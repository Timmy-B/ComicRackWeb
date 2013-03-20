using Nancy;
using Nancy.Responses;

namespace ComicRackWebViewer
{
    public class IndexModule : NancyModule
    {
        public IndexModule()
            : base("/")
        {
            Get["/"] = x => { return Response.AsRedirect("/tablet/index.html", RedirectResponse.RedirectType.Permanent); };
        }
    }
}
