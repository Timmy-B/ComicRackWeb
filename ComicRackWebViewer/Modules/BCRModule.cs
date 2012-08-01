using System;
using System.Windows;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using cYo.Common;
using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Engine.IO.Provider;
using cYo.Projects.ComicRack.Viewer;
using Nancy;
using Nancy.OData;


  
namespace ComicRackWebViewer
{
    public class BCRModule : NancyModule
    {
        public BCRModule()
            : base("/BCR")
        {
        	  Get["/"] = x => View["BCR.cshtml"];
            
            Get["/Lists"] = x => { 
        	    int depth = Request.Query.depth.HasValue ? int.Parse(Request.Query.depth) : -1;
        	    return Response.AsOData(Program.Database.ComicLists.Select(c => c.ToComicList(depth)));
        	  };
        	  
            Get["/Lists/{id}"]  = x => { 
        	    IEnumerable<ComicList> list = Program.Database.ComicLists.Where(c => c.Id == new Guid(x.id)).Select(c => c.ToComicList());
        	    if (list.Count() == 0)
        	    {
        	      return HttpStatusCode.NotFound;
        	    }
        	    
        	    try 
        	    {
        	     return Response.AsOData(list); 
        	    }
        	    catch(Exception e)
        	    {
        	      MessageBox.Show(e.ToString());
        	      return HttpStatusCode.InsufficientStorage;
        	    }
        	  };
        	  
            Get["/Lists/{id}/Comics"] = x => { 
        	    

        	    try
        	    {
        	      return Response.AsOData(API.GetIssuesOfListFromId(new Guid(x.id), Context).Comics); 
        	    }
        	    catch(Exception e)
        	    {
        	       MessageBox.Show(e.ToString());
        	       return HttpStatusCode.InsufficientStorage;
        	    }

        	  };
            
            Get["/Comics/{id}"] = x => { 
              Comic comic = API.GetComic(new Guid(x.id));
              if (comic == null)
              {
                return HttpStatusCode.NotFound;
              }

              return Response.AsOData(new List<Comic> { comic });
            };

            Get["/Comics/{id}/Pages/{page}"] = x => {
              
              int width = Request.Query.width.HasValue ? int.Parse(Request.Query.width) : -1;
              int height = Request.Query.height.HasValue ? int.Parse(Request.Query.height) : -1;
              
              return API.GetPageImage(new Guid(x.id), int.Parse(x.page), width, height, Response);
            };
            
//            Get["/views/{view}/(?<all>.*)"] = Render;
           
        }
        
        /*
        private Response Render(dynamic parameters) {
        String result = "View: " + parameters.view + "<br/>";
        foreach (var other in ((string)parameters.all).Split('/'))
            result += other + "<br/>";

        foreach (var name in Request.Query)
            result += name + ": " + Request.Query[name] + "<br/>";

        return result;
        }
        */
       

    }

   
}
