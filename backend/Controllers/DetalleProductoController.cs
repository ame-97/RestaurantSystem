using MenuApi.Models;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http;

namespace MenuApi.Controllers
{
    [RoutePrefix("api/detalleproducto")]
    public class DetalleProductoController : ApiController
    {
        string conexion = ConfigurationManager.ConnectionStrings["MenuDB"].ConnectionString;

        // 🔹 GET ALL
        [HttpGet]
        [Route("")]
        public IHttpActionResult Get()
        {
            List<DetalleProducto> lista = new List<DetalleProducto>();

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand("SELECT * FROM DetalleProducto", con);
                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    lista.Add(new DetalleProducto
                    {
                        Id = (int)dr["Id"],
                        ProductoId = (int)dr["ProductoId"],
                        Descripcion = dr["Descripcion"]?.ToString(),
                        Precio = (decimal)dr["Precio"]
                    });
                }
            }

            return Ok(lista);
        }

        // 🔹 GET BY PRODUCTO ID
        [HttpGet]
        [Route("{productoId:int}")]
        public IHttpActionResult GetByProducto(int productoId)
        {
            DetalleProducto detalle = null;

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(
                    "SELECT * FROM DetalleProducto WHERE ProductoId=@id", con);

                cmd.Parameters.AddWithValue("@id", productoId);

                SqlDataReader dr = cmd.ExecuteReader();

                if (dr.Read())
                {
                    detalle = new DetalleProducto
                    {
                        Id = (int)dr["Id"],
                        ProductoId = (int)dr["ProductoId"],
                        Descripcion = dr["Descripcion"]?.ToString(),
                        Precio = (decimal)dr["Precio"]
                    };
                }
            }

            if (detalle == null)
                return NotFound();

            return Ok(detalle);
        }

        // 🔹 POST
        [HttpPost]
        [Route("")]
        public IHttpActionResult Post(DetalleProducto d)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlCommand cmd = new SqlCommand(
                    "INSERT INTO DetalleProducto (ProductoId, Descripcion, Precio) VALUES (@pid,@desc,@precio)", con);

                cmd.Parameters.AddWithValue("@pid", d.ProductoId);
                cmd.Parameters.AddWithValue("@desc", d.Descripcion);
                cmd.Parameters.AddWithValue("@precio", d.Precio);

                cmd.ExecuteNonQuery();
            }

            return Ok("Detalle agregado");
        }

        // 🔹 PUT (ACTUALIZAR POR PRODUCTO ID)
        [HttpPut]
        [Route("{productoId:int}")]
        public IHttpActionResult Put(int productoId, DetalleProducto d)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlCommand cmd = new SqlCommand(
                    @"UPDATE DetalleProducto 
                      SET Precio=@precio, Descripcion=@desc 
                      WHERE ProductoId=@id", con);

                cmd.Parameters.AddWithValue("@id", productoId);
                cmd.Parameters.AddWithValue("@precio", d.Precio);
                cmd.Parameters.AddWithValue("@desc", d.Descripcion ?? "");

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Detalle actualizado");
        }

        // DELETE
        [HttpDelete]
        [Route("{id:int}")]
        public IHttpActionResult Delete(int id)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlCommand cmd = new SqlCommand(
                    "DELETE FROM DetalleProducto WHERE Id=@id", con);

                cmd.Parameters.AddWithValue("@id", id);

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Detalle eliminado");
        }
    }
}