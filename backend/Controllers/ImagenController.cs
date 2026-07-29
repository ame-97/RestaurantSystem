using MenuApi.Models;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http;

namespace MenuApi.Controllers
{
    public class ImagenController : ApiController
    {
        string conexion = ConfigurationManager.ConnectionStrings["MenuDB"].ConnectionString;

        // 🔍 GET TODOS
        public IHttpActionResult Get()
        {
            List<ImagenProducto> lista = new List<ImagenProducto>();

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand("SELECT * FROM Imagen", con);
                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    lista.Add(new ImagenProducto
                    {
                        Id = (int)dr["Id"],
                        ProductoId = (int)dr["ProductoId"],
                        Url = dr["Url"].ToString()
                    });
                }
            }

            return Ok(lista);
        }

        // 🔍 GET POR productoId
        public IHttpActionResult Get(int productoId)
        {
            ImagenProducto img = null;

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand("SELECT * FROM Imagen WHERE ProductoId=@id", con);
                cmd.Parameters.AddWithValue("@id", productoId);

                SqlDataReader dr = cmd.ExecuteReader();

                if (dr.Read())
                {
                    img = new ImagenProducto
                    {
                        Id = (int)dr["Id"],
                        ProductoId = (int)dr["ProductoId"],
                        Url = dr["Url"].ToString()
                    };
                }
            }

            if (img == null)
                return NotFound();

            return Ok(img);
        }

        // ➕ POST
        public IHttpActionResult Post(ImagenProducto i)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(
                    "INSERT INTO Imagen (ProductoId, Url) VALUES (@pid,@url)", con);

                cmd.Parameters.AddWithValue("@pid", i.ProductoId);
                cmd.Parameters.AddWithValue("@url", i.Url);

                cmd.ExecuteNonQuery();
            }

            return Ok("Imagen agregada");
        }

        // ✏️ PUT
        public IHttpActionResult Put(int id, ImagenProducto i)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(
                    "UPDATE Imagen SET Url=@url WHERE Id=@id", con);

                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@url", i.Url);

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Imagen actualizada");
        }

        // ❌ DELETE
        public IHttpActionResult Delete(int id)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand("DELETE FROM Imagen WHERE Id=@id", con);
                cmd.Parameters.AddWithValue("@id", id);

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Imagen eliminada");
        }
    }
}