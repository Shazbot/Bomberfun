using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Bomberfun.Startup))]

namespace Bomberfun
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            app.MapSignalR();
        }
    }
}