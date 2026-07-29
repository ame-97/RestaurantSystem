using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.SessionState;
using MenuApi.Models;

namespace MenuApi.Controllers
{
    public class UsuariosController : ApiController, IRequiresSessionState
    {
        string conexion = ConfigurationManager.ConnectionStrings["MenuDB"].ConnectionString;

        // multisesion
        public static Dictionary<int, string> sesionesActivas = new Dictionary<int, string>();
        // token simple
        public static Dictionary<string, Usuarios> tokensActivos = new Dictionary<string, Usuarios>();

        private string GetToken()
        {
            var auth = Request?.Headers?.Authorization;
            if (auth != null && auth.Scheme == "Bearer" && !string.IsNullOrWhiteSpace(auth.Parameter))
                return auth.Parameter;

            if (Request?.Headers?.Contains("X-Auth-Token") == true)
                return Request.Headers.GetValues("X-Auth-Token").FirstOrDefault();

            return null;
        }

        private Usuarios ObtenerUsuarioAutenticado()
        {
            var token = GetToken();
            if (!string.IsNullOrWhiteSpace(token) && tokensActivos.ContainsKey(token))
                return tokensActivos[token];

            if (!SesionValida())
                return null;

            return (Usuarios)HttpContext.Current.Session["Usuario"];
        }

        private bool EsAdmin(Usuarios usuario)
        {
            if (usuario == null) return false;
            return usuario.RolId == 1;
        }

        // ================================
        // VALIDAR SESION
        // ================================
        private bool SesionValida()
        {
            if (HttpContext.Current.Session == null ||
                HttpContext.Current.Session["Usuario"] == null)
                return false;

            var usuario = (Usuarios)HttpContext.Current.Session["Usuario"];

            int userId = usuario.Id;

            // multisesion
            if (!sesionesActivas.ContainsKey(userId) ||
                sesionesActivas[userId] != HttpContext.Current.Session.SessionID)
                return false;

            // inactividad
            if (HttpContext.Current.Session["UltimaActividad"] != null)
            {
                DateTime ultima = (DateTime)HttpContext.Current.Session["UltimaActividad"];

                if ((DateTime.Now - ultima).TotalMinutes > 30)
                {
                    HttpContext.Current.Session.Abandon();
                    return false;
                }
            }

            HttpContext.Current.Session["UltimaActividad"] = DateTime.Now;

            return true;
        }

        // ================================
        // LOGIN
        // ================================
        [HttpPost]
        [Route("api/usuarios/login")]
        public IHttpActionResult Login(Usuarios u)
        {
            if (u == null || string.IsNullOrEmpty(u.Email) || string.IsNullOrEmpty(u.Contra))
                return BadRequest("Datos invalidos");

            Usuarios usuario = null;

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlCommand cmd = new SqlCommand(
                    "SELECT Id, Nombre, Email, RolId FROM Usuarios WHERE Email=@email AND Contra=@contra", con);

                cmd.Parameters.AddWithValue("@email", u.Email);
                cmd.Parameters.AddWithValue("@contra", u.Contra);

                SqlDataReader dr = cmd.ExecuteReader();

                if (dr.Read())
                {
                    usuario = new Usuarios
                    {
                        Id = (int)dr["Id"],
                        Nombre = dr["Nombre"].ToString(),
                        Email = dr["Email"].ToString(),
                        RolId = (int)dr["RolId"]
                    };
                }
            }

            if (usuario == null)
                return Unauthorized();

            // crear sesion
            HttpContext.Current.Session["Usuario"] = usuario;
            HttpContext.Current.Session["Rol"] = usuario.RolId;
            HttpContext.Current.Session["UltimaActividad"] = DateTime.Now;

            // multisesion
            if (sesionesActivas.ContainsKey(usuario.Id))
                sesionesActivas.Remove(usuario.Id);

            sesionesActivas[usuario.Id] = HttpContext.Current.Session.SessionID;

            // token simple
            var token = Guid.NewGuid().ToString("N");
            tokensActivos[token] = usuario;

            return Ok(new { token, usuario });
        }

        // ================================
        // SESSION
        // ================================
        [HttpGet]
        [Route("api/usuarios/session")]
        public IHttpActionResult ObtenerSesion()
        {
            var usuario = ObtenerUsuarioAutenticado();
            if (usuario == null)
                return Unauthorized();

            return Ok(usuario);
        }

        // ================================
        // LOGOUT
        // ================================
        [HttpPost]
        [Route("api/usuarios/logout")]
        public IHttpActionResult Logout()
        {
            var usuario = HttpContext.Current.Session["Usuario"] as Usuarios;

            if (usuario != null && sesionesActivas.ContainsKey(usuario.Id))
            {
                sesionesActivas.Remove(usuario.Id);
            }

            var token = GetToken();
            if (!string.IsNullOrWhiteSpace(token) && tokensActivos.ContainsKey(token))
            {
                tokensActivos.Remove(token);
            }

            HttpContext.Current.Session.Clear();
            HttpContext.Current.Session.Abandon();

            return Ok();
        }

        // ================================
        // GET TODOS (ADMIN)
        // ================================
        public IHttpActionResult Get()
        {
            var usuario = ObtenerUsuarioAutenticado();
            if (usuario == null) return Unauthorized();
            if (!EsAdmin(usuario)) return Unauthorized();

            List<Usuarios> lista = new List<Usuarios>();

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlCommand cmd = new SqlCommand(@"
            SELECT 
                u.Id,
                u.Nombre,
                u.Email,
                u.RolId,
                r.Nombre AS RolNombre,
                u.FechaRegistro
            FROM Usuarios u
            INNER JOIN Roles r ON u.RolId = r.Id
        ", con);

                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    lista.Add(new Usuarios
                    {
                        Id = (int)dr["Id"],
                        Nombre = dr["Nombre"].ToString(),
                        Email = dr["Email"].ToString(),
                        RolId = (int)dr["RolId"],
                        RolNombre = dr["RolNombre"].ToString(),
                        FechaRegistro = (DateTime)dr["FechaRegistro"]
                    });
                }
            }

            return Ok(lista);
        }

        // ================================
        // GET POR ID (ADMIN)
        // ================================
        public IHttpActionResult Get(int id)
        {
            var usuario = ObtenerUsuarioAutenticado();
            if (usuario == null) return Unauthorized();
            if (!EsAdmin(usuario)) return Unauthorized();

            Usuarios u = null;

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlCommand cmd = new SqlCommand("SELECT * FROM Usuarios WHERE Id=@id", con);
                cmd.Parameters.AddWithValue("@id", id);

                SqlDataReader dr = cmd.ExecuteReader();

                if (dr.Read())
                {
                    u = new Usuarios
                    {
                        Id = (int)dr["Id"],
                        Nombre = dr["Nombre"].ToString(),
                        Email = dr["Email"].ToString(),
                        RolId = (int)dr["RolId"],
                        FechaRegistro = (DateTime)dr["FechaRegistro"]
                    };
                }
            }

            if (u == null) return NotFound();

            return Ok(u);
        }

        [HttpPut]
        [Route("api/usuarios/{id}")]
        public IHttpActionResult Put(int id, Usuarios u)
        {
            var usuario = ObtenerUsuarioAutenticado();
            if (usuario == null) return Unauthorized();
            if (!EsAdmin(usuario)) return Unauthorized();

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlCommand cmd = new SqlCommand(@"
            UPDATE Usuarios 
            SET Nombre = @nombre,
                Email = @email,
                RolId = @rol
            WHERE Id = @id
        ", con);

                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@nombre", u.Nombre);
                cmd.Parameters.AddWithValue("@email", u.Email);
                cmd.Parameters.AddWithValue("@rol", u.RolId);

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Usuario actualizado");
        }
        [HttpDelete]
        [Route("api/usuarios/{id}")]
        public IHttpActionResult Delete(int id)
        {
            var usuario = ObtenerUsuarioAutenticado();
            if (usuario == null) return Unauthorized();
            if (!EsAdmin(usuario)) return Unauthorized();

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                SqlCommand cmd = new SqlCommand(
                    "DELETE FROM Usuarios WHERE Id = @id", con);

                cmd.Parameters.AddWithValue("@id", id);

                int filas = cmd.ExecuteNonQuery();

                if (filas == 0)
                    return NotFound();
            }

            return Ok("Usuario eliminado");
        }

        [HttpPost]
        [Route("api/usuarios/registro")]
        public IHttpActionResult Registro(Usuarios u)
        {
            if (u == null || string.IsNullOrEmpty(u.Email) || string.IsNullOrEmpty(u.Contra))
                return BadRequest("Datos invalidos");

            using (SqlConnection con = new SqlConnection(conexion))
            {
                con.Open();

                // verificar si ya existe
                SqlCommand check = new SqlCommand("SELECT COUNT(*) FROM Usuarios WHERE Email=@e", con);
                check.Parameters.AddWithValue("@e", u.Email);

                int existe = (int)check.ExecuteScalar();

                if (existe > 0)
                    return BadRequest("El correo ya esta registrado");

                // insertar usuario NORMAL (Rol 2)
                SqlCommand cmd = new SqlCommand(
                    "INSERT INTO Usuarios (Nombre, Email, Contra, RolId) VALUES (@n, @e, @c, 2)",
                    con);

                cmd.Parameters.AddWithValue("@n", u.Nombre);
                cmd.Parameters.AddWithValue("@e", u.Email);
                cmd.Parameters.AddWithValue("@c", u.Contra);

                cmd.ExecuteNonQuery();
            }

            return Ok("Usuario registrado");
        }
    }
}
