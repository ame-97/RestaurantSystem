using System.Web.Http;
using System.Web.Http.Cors;

namespace MenuApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Habilitar CORS globalmente (solo aquí)
            var cors = new EnableCorsAttribute(
                "http://localhost:5500,http://127.0.0.1:5500,http://localhost:5501,http://127.0.0.1:5501,http://localhost:5502,http://127.0.0.1:5502,http://localhost:5503,http://127.0.0.1:5503",
                "*",
                "*"
            );

            cors.SupportsCredentials = true;


            config.EnableCors(cors);
            config.MapHttpAttributeRoutes();

            // Eliminar XML y usar JSON
            config.Formatters.Remove(config.Formatters.XmlFormatter);

            // Ruta por defecto
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}


