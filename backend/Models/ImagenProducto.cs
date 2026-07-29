using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MenuApi.Models
{
    public class ImagenProducto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string Url { get; set; }
    }
}