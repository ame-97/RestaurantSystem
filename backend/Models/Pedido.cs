using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MenuApi.Models
{
    public class Pedido
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }

        public string TipoPedido { get; set; }

        public string Direccion { get; set; }

        public decimal? Latitud { get; set; }

        public decimal? Longitud { get; set; }

        public string MetodoPago { get; set; }

        public string EstadoPago { get; set; }

        public decimal Total { get; set; }

        public DateTime Fecha { get; set; }

        public List<DetallePedido> Detalles { get; set; }
    }
}