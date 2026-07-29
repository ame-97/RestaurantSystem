using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MenuApi.Models
{
    public class Producto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public int CategoriaId { get; set; }   
        public string CategoriaNombre { get; set; }
    }
}