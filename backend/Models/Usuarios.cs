using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MenuApi.Models
{
    public class Usuarios
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public string Contra { get; set; }
        public int RolId { get; set; }
        public string RolNombre { get; set; }
        public DateTime FechaRegistro { get; set; }
    }
}