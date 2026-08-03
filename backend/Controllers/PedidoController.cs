using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http;
using MenuApi.Models;

namespace MenuApi.Controllers
{
    [RoutePrefix("api/pedido")]
    public class PedidoController : ApiController
    {
        private readonly string conexion =
            ConfigurationManager.ConnectionStrings["MenuDB"].ConnectionString;

        // ================================
        // HISTORIAL DE PEDIDOS DEL USUARIO
        // ================================
        [HttpGet]
        [Route("usuario/{usuarioId:int}")]
        public IHttpActionResult GetPorUsuario(int usuarioId)
        {
            if (usuarioId <= 0)
                return BadRequest("El usuario no es válido.");

            List<Pedido> pedidos = new List<Pedido>();

            // Se indexan por Id para poder colgarles los detalles sin repetir
            // una consulta por cada pedido.
            Dictionary<int, Pedido> porId = new Dictionary<int, Pedido>();

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlCommand cmdPedidos = new SqlCommand(@"
                    SELECT
                        Id,
                        UsuarioId,
                        TipoPedido,
                        Direccion,
                        Latitud,
                        Longitud,
                        MetodoPago,
                        EstadoPago,
                        Total,
                        Fecha
                    FROM Pedido
                    WHERE UsuarioId = @usuarioId
                    ORDER BY Id DESC
                ", con);

                cmdPedidos.Parameters.AddWithValue("@usuarioId", usuarioId);

                using (SqlDataReader dr = cmdPedidos.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        Pedido pedido = new Pedido
                        {
                            Id = (int)dr["Id"],
                            UsuarioId = (int)dr["UsuarioId"],
                            TipoPedido = dr["TipoPedido"].ToString(),

                            Direccion = dr["Direccion"] == DBNull.Value
                                ? null
                                : dr["Direccion"].ToString(),

                            Latitud = dr["Latitud"] == DBNull.Value
                                ? (decimal?)null
                                : Convert.ToDecimal(dr["Latitud"]),

                            Longitud = dr["Longitud"] == DBNull.Value
                                ? (decimal?)null
                                : Convert.ToDecimal(dr["Longitud"]),

                            MetodoPago = dr["MetodoPago"].ToString(),
                            EstadoPago = dr["EstadoPago"].ToString(),
                            Total = Convert.ToDecimal(dr["Total"]),
                            Fecha = Convert.ToDateTime(dr["Fecha"]),

                            Detalles = new List<DetallePedido>()
                        };

                        pedidos.Add(pedido);
                        porId[pedido.Id] = pedido;
                    }
                }

                if (pedidos.Count == 0)
                    return Ok(pedidos);

                // Todos los detalles del usuario en una sola consulta.
                SqlCommand cmdDetalles = new SqlCommand(@"
                    SELECT
                        d.Id,
                        d.PedidoId,
                        d.ProductoId,
                        d.Cantidad,
                        d.PrecioUnitario,
                        d.Subtotal,
                        pr.Nombre AS ProductoNombre
                    FROM DetallePedido d
                    INNER JOIN Pedido pe ON pe.Id = d.PedidoId
                    INNER JOIN Producto pr ON pr.Id = d.ProductoId
                    WHERE pe.UsuarioId = @usuarioId
                    ORDER BY d.Id
                ", con);

                cmdDetalles.Parameters.AddWithValue("@usuarioId", usuarioId);

                using (SqlDataReader dr = cmdDetalles.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        int pedidoId = (int)dr["PedidoId"];

                        if (!porId.ContainsKey(pedidoId))
                            continue;

                        porId[pedidoId].Detalles.Add(new DetallePedido
                        {
                            Id = (int)dr["Id"],
                            PedidoId = pedidoId,
                            ProductoId = (int)dr["ProductoId"],
                            Cantidad = (int)dr["Cantidad"],
                            PrecioUnitario = Convert.ToDecimal(dr["PrecioUnitario"]),
                            Subtotal = Convert.ToDecimal(dr["Subtotal"]),
                            ProductoNombre = dr["ProductoNombre"].ToString()
                        });
                    }
                }
            }

            return Ok(pedidos);
        }

        [HttpPost]
        [Route("")]
        public IHttpActionResult Post(Pedido pedido)
        {
            if (pedido == null)
                return BadRequest("El pedido no contiene información.");

            if (pedido.UsuarioId <= 0)
                return BadRequest("El usuario es obligatorio.");

            if (pedido.Detalles == null || pedido.Detalles.Count == 0)
                return BadRequest("El pedido debe contener al menos un producto.");

            if (pedido.TipoPedido != "Para llevar" &&
                pedido.TipoPedido != "A domicilio")
            {
                return BadRequest("El tipo de pedido no es válido.");
            }

            if (pedido.MetodoPago != "Efectivo" &&
                pedido.MetodoPago != "Tarjeta al recibir" &&
                pedido.MetodoPago != "Tarjeta simulada")
            {
                return BadRequest("El método de pago no es válido.");
            }

            if (pedido.TipoPedido == "A domicilio")
            {
                if (string.IsNullOrWhiteSpace(pedido.Direccion))
                    return BadRequest("La dirección es obligatoria.");

                if (!pedido.Latitud.HasValue || !pedido.Longitud.HasValue)
                    return BadRequest("La ubicación es obligatoria.");
            }

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlTransaction transaction = con.BeginTransaction();

                try
                {
                    decimal total = 0;

                    foreach (DetallePedido detalle in pedido.Detalles)
                    {
                        if (detalle.ProductoId <= 0)
                            throw new Exception("Producto no válido.");

                        if (detalle.Cantidad <= 0)
                            throw new Exception("La cantidad debe ser mayor que cero.");

                        SqlCommand cmdPrecio = new SqlCommand(@"
                    SELECT Precio
                    FROM DetalleProducto
                    WHERE ProductoId = @productoId
                ", con, transaction);

                        cmdPrecio.Parameters.AddWithValue(
                            "@productoId",
                            detalle.ProductoId
                        );

                        object resultadoPrecio = cmdPrecio.ExecuteScalar();

                        if (resultadoPrecio == null)
                        {
                            throw new Exception(
                                "No se encontró el producto con ID " +
                                detalle.ProductoId
                            );
                        }

                        detalle.PrecioUnitario =
                            Convert.ToDecimal(resultadoPrecio);

                        detalle.Subtotal =
                            detalle.PrecioUnitario * detalle.Cantidad;

                        total += detalle.Subtotal;
                    }

                    string estadoPago =
                        pedido.MetodoPago == "Tarjeta simulada"
                            ? "Pagado"
                            : "Pendiente";

                    SqlCommand cmdPedido = new SqlCommand(@"
                INSERT INTO Pedido
                (
                    UsuarioId,
                    TipoPedido,
                    Direccion,
                    Latitud,
                    Longitud,
                    MetodoPago,
                    EstadoPago,
                    Total
                )
                VALUES
                (
                    @usuarioId,
                    @tipoPedido,
                    @direccion,
                    @latitud,
                    @longitud,
                    @metodoPago,
                    @estadoPago,
                    @total
                );

                SELECT SCOPE_IDENTITY();
            ", con, transaction);

                    cmdPedido.Parameters.AddWithValue(
                        "@usuarioId",
                        pedido.UsuarioId
                    );

                    cmdPedido.Parameters.AddWithValue(
                        "@tipoPedido",
                        pedido.TipoPedido
                    );

                    cmdPedido.Parameters.AddWithValue(
                        "@direccion",
                        string.IsNullOrWhiteSpace(pedido.Direccion)
                            ? (object)DBNull.Value
                            : pedido.Direccion
                    );

                    cmdPedido.Parameters.AddWithValue(
                        "@latitud",
                        pedido.Latitud.HasValue
                            ? (object)pedido.Latitud.Value
                            : DBNull.Value
                    );

                    cmdPedido.Parameters.AddWithValue(
                        "@longitud",
                        pedido.Longitud.HasValue
                            ? (object)pedido.Longitud.Value
                            : DBNull.Value
                    );

                    cmdPedido.Parameters.AddWithValue(
                        "@metodoPago",
                        pedido.MetodoPago
                    );

                    cmdPedido.Parameters.AddWithValue(
                        "@estadoPago",
                        estadoPago
                    );

                    cmdPedido.Parameters.AddWithValue(
                        "@total",
                        total
                    );

                    int pedidoId =
                        Convert.ToInt32(cmdPedido.ExecuteScalar());

                    foreach (DetallePedido detalle in pedido.Detalles)
                    {
                        SqlCommand cmdDetalle = new SqlCommand(@"
                    INSERT INTO DetallePedido
                    (
                        PedidoId,
                        ProductoId,
                        Cantidad,
                        PrecioUnitario,
                        Subtotal
                    )
                    VALUES
                    (
                        @pedidoId,
                        @productoId,
                        @cantidad,
                        @precioUnitario,
                        @subtotal
                    )
                ", con, transaction);

                        cmdDetalle.Parameters.AddWithValue(
                            "@pedidoId",
                            pedidoId
                        );

                        cmdDetalle.Parameters.AddWithValue(
                            "@productoId",
                            detalle.ProductoId
                        );

                        cmdDetalle.Parameters.AddWithValue(
                            "@cantidad",
                            detalle.Cantidad
                        );

                        cmdDetalle.Parameters.AddWithValue(
                            "@precioUnitario",
                            detalle.PrecioUnitario
                        );

                        cmdDetalle.Parameters.AddWithValue(
                            "@subtotal",
                            detalle.Subtotal
                        );

                        cmdDetalle.ExecuteNonQuery();
                    }

                    transaction.Commit();

                    pedido.Id = pedidoId;
                    pedido.Total = total;
                    pedido.EstadoPago = estadoPago;
                    pedido.Fecha = DateTime.Now;

                    return Ok(new
                    {
                        mensaje = "Pedido registrado correctamente.",
                        pedido = pedido
                    });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();

                    return InternalServerError(ex);
                }
            }
        }
    }
}