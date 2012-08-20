using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Engine.IO.Provider;
using Nancy;

namespace ComicRackWebViewer
{
    public class ComicsModule : NancyModule
    {
        public ComicsModule()
            : base("/Comics")
        {
            Get["/{id}"] = p => View["ComicBook.cshtml", API.GetComic(new Guid(p.id))];
            Get["/Metadata/{id}"] = x => View["ComicInfoPanel.cshtml", API.GetComic(new Guid(x.id))];
            Get["/Thumbnail/{id}/{page}"] = parameters => API.GetThumbnailImage(new Guid(parameters.id), int.Parse(parameters.page), Response);
            Get["/Image/{id}/{page}"] = parameters => API.GetPageImage(new Guid(parameters.id), int.Parse(parameters.page), Response);
        }

       
    }
}
