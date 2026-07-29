using MenuApi;
using System.Web;
using System.Web.Http; // 👈 IMPORTANTE
using System.Web.Mvc;
using System.Web.Routing;

namespace MenuApi
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            // 👇 AGREGA ESTA LÍNEA
            GlobalConfiguration.Configure(WebApiConfig.Register);

            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }

        protected void Application_PostAuthorizeRequest()
        {
            System.Web.HttpContext.Current.SetSessionStateBehavior(
                System.Web.SessionState.SessionStateBehavior.Required
            );
        }
    }
}