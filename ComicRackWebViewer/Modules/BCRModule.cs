using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using cYo.Common;
using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Engine.IO.Provider;
using cYo.Projects.ComicRack.Viewer;
using Nancy;

namespace ComicRackWebViewer
{
    public class BCRModule : NancyModule
    {
        public BCRModule()
            : base("/BCR")
        {
        	Get["/"] = x => View["BCR.cshtml"];
            Get["/Lists"] = x => View["BCR_Lists.cshtml", Program.Database.ComicLists];
            //Get["/Lists/{id}"] = x => View["BCR_List.cshtml", Program.Database.ComicLists.Where(c => c.Name).OrderBy(c => c)];
            Get["/Lists({id})/Comics"] = x => View["BCR_ListComics.cshtml", API.GetIssuesOfListFromId(new Guid(x.id), Context)];
            //Get["/Comics"] = x => View["BCR_Comics.cshtml", API.GetIssuesOfList(x.name, Context).AsSeries()];
            Get["/Comics({id})"] = x => View["BCR_Comic.cshtml", API.GetComic(new Guid(x.id))];
            Get["/Comics({id})/Pages({page})"] = x => API.GetPageImage(new Guid(x.id), int.Parse(x.page), Response);
        }
    }

   
}
