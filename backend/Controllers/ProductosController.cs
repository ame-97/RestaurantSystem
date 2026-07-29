using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Http;
using MenuApi.Models;

namespace MenuApi.Controllers
{
    public class ProductoController : ApiController
    {
        string conexion = ConfigurationManager.ConnectionStrings["MenuDB"].ConnectionString;

        // 🔍 GET TODOS

        public IHttpActionResult Get()
        {
            List<Producto> lista = new List<Producto>();

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(@"
            SELECT p.Id, p.Nombre, p.CategoriaId, c.Nombre AS CategoriaNombre
            FROM Producto p
            INNER JOIN Categoria c ON p.CategoriaId = c.Id
        ", con);

                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    lista.Add(new Producto
                    {
                        Id = (int)dr["Id"],
                        Nombre = dr["Nombre"].ToString(),
                        CategoriaId = (int)dr["CategoriaId"],
                        CategoriaNombre = dr["CategoriaNombre"].ToString()
                    });
                }
            }

            return Ok(lista);
        }

        // 🔍 GET POR ID

        public IHttpActionResult Get(int id)
        {
            Producto p = null;

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(@"
            SELECT p.Id, p.Nombre, p.CategoriaId, c.Nombre AS CategoriaNombre
            FROM Producto p
            INNER JOIN Categoria c ON p.CategoriaId = c.Id
            WHERE p.Id = @id
        ", con);

                cmd.Parameters.AddWithValue("@id", id);

                SqlDataReader dr = cmd.ExecuteReader();

                if (dr.Read())
                {
                    p = new Producto
                    {
                        Id = (int)dr["Id"],
                        Nombre = dr["Nombre"].ToString(),
                        CategoriaId = (int)dr["CategoriaId"],
                        CategoriaNombre = dr["CategoriaNombre"].ToString()
                    };
                }
            }

            if (p == null)
                return NotFound();

            return Ok(p);
        }

        // ➕ POST (INSERTAR)
        public IHttpActionResult Post(Producto p)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(
                    "INSERT INTO Producto (Nombre, CategoriaId) VALUES (@nombre, @categoriaId); SELECT SCOPE_IDENTITY();", con);

                cmd.Parameters.AddWithValue("@nombre", p.Nombre);
                cmd.Parameters.AddWithValue("@categoriaId", p.CategoriaId);

                int nuevoId = Convert.ToInt32(cmd.ExecuteScalar());

                p.Id = nuevoId;
            }

            return Ok(p);
        }

        // ✏️ PUT (ACTUALIZAR)
        public IHttpActionResult Put(int id, Producto p)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand(
                    "UPDATE Producto SET Nombre=@nombre, CategoriaId=@categoriaId WHERE Id=@id", con);

                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@nombre", p.Nombre);
                cmd.Parameters.AddWithValue("@categoriaId", p.CategoriaId);

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Producto actualizado");
        }

        // ❌ DELETE
        public IHttpActionResult Delete(int id)
        {
            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();
                SqlCommand cmd = new SqlCommand("DELETE FROM Producto WHERE Id=@id", con);
                cmd.Parameters.AddWithValue("@id", id);

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Producto eliminado");
        }
    }
}