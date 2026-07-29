using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http;
using MenuApi.Models;

namespace MenuApi.Controllers
{
    public class CategoriasController : ApiController
    {
        string conexion = ConfigurationManager.ConnectionStrings["MenuDB"].ConnectionString;

        // 🔍 GET TODOS
        public IHttpActionResult Get()
        {
            List<Categoria> lista = new List<Categoria>();

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand("SELECT * FROM Categoria", con);
                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    lista.Add(new Categoria
                    {
                        Id = (int)dr["Id"],
                        Nombre = dr["Nombre"].ToString()
                    });
                }
            }

            return Ok(lista);
        }

        // 🔍 GET POR ID
        public IHttpActionResult Get(int id)
        {
            Categoria c = null;

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand("SELECT * FROM Categoria WHERE Id=@id", con);
                cmd.Parameters.AddWithValue("@id", id);

                SqlDataReader dr = cmd.ExecuteReader();

                if (dr.Read())
                {
                    c = new Categoria
                    {
                        Id = (int)dr["Id"],
                        Nombre = dr["Nombre"].ToString()
                    };
                }
            }

            if (c == null)
                return NotFound();

            return Ok(c);
        }

        // ➕ POST
        public IHttpActionResult Post(Categoria c)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(
                    "INSERT INTO Categoria (Nombre) VALUES (@nombre)", con);

                cmd.Parameters.AddWithValue("@nombre", c.Nombre);

                cmd.ExecuteNonQuery();
            }

            return Ok("Categoría agregada");
        }

        // ✏️ PUT
        public IHttpActionResult Put(int id, Categoria c)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(
                    "UPDATE Categoria SET Nombre=@nombre WHERE Id=@id", con);

                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@nombre", c.Nombre);

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Categoría actualizada");
        }

        // ❌ DELETE
        public IHttpActionResult Delete(int id)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(
                    "DELETE FROM Categoria WHERE Id=@id", con);

                cmd.Parameters.AddWithValue("@id", id);

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Categoría eliminada");
        }
    }
}