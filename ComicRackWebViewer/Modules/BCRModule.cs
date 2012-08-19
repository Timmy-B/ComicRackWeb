using System;
using System.Windows;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Diagnostics;
using cYo.Common;
using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Engine.IO.Provider;
using cYo.Projects.ComicRack.Viewer;
using Nancy;
using Nancy.OData;
using Nancy.ModelBinding;
using Nancy.Responses;

namespace ComicRackWebViewer
{
    public static class BCRExtensions
    {
      public static Response AsError(this IResponseFormatter formatter, HttpStatusCode statusCode, string message)
      {
          return new Response
              {
                  StatusCode = statusCode,
                  ContentType = "text/plain",
                  Contents = stream => (new StreamWriter(stream) { AutoFlush = true }).Write(message)
              };
      }
    }
    

	

    
    public class BCRModule : NancyModule
    {
        private BCRSettings settings = null;
        
    		
    		
        public BCRModule()
            : base("/BCR")
        {
            settings = BCRSettings.Load();
            
            Get["/"] = x => { return Response.AsRedirect("/viewer/index.html", RedirectResponse.RedirectType.Permanent); };
            
            Get["/Lists"] = x => { 
       	    
        	    int depth = Request.Query.depth.HasValue ? int.Parse(Request.Query.depth) : -1;
        	    return Response.AsOData(Program.Database.ComicLists.Select(c => c.ToComicList(depth)));
        	  };
        	  
        	  
            Get["/Lists/{id}"]  = x => { 
        	    int depth = Request.Query.depth.HasValue ? int.Parse(Request.Query.depth) : -1;
        	    IEnumerable<ComicList> list = Program.Database.ComicLists.Where(c => c.Id == new Guid(x.id)).Select(c => c.ToComicList(depth));
        	    if (list.Count() == 0)
        	    {
        	      return Response.AsError(HttpStatusCode.NotFound, "List not found");
        	    }
        	    
        	    try 
        	    {
        	     return Response.AsOData(list); 
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InsufficientStorage, e.ToString());
        	    }
        	  };
        	  
        	  // For OData compatibility, count should be $count, but I don't know how to parse the $ with Nancy....
        	  Get["/Lists/{id}/Comics/count"] = x => { 
        	    return Response.AsText(Context.ApplyODataUriFilter(API.GetIssuesOfListFromId(new Guid(x.id), Context).Comics).Count().ToString());
        	  };
        	  
        	  // Return the comics of the specified list using OData to filter the comic properties and the list paging.
            Get["/Lists/{id}/Comics"] = x => { 
        	    
        	    bool wantsCount = Request.Query["$inlinecount"].HasValue;
        	    
        	    try
        	    {
        	      IEnumerable<Comic> comics = API.GetIssuesOfListFromId(new Guid(x.id), Context).Comics;
        	      return Response.AsOData(comics); 
        	    }
        	    catch(Exception e)
        	    {
                return Response.AsError(HttpStatusCode.InsufficientStorage, e.ToString());
        	    }

        	  };
            
        	  Get["/Comics"] = x => { 
        	    return Response.AsOData(API.GetComics().Select(c => c.ToComic()));
        	  };
        	  
        	  // Return the comicbook info as an OData filtered bag of properties.
            Get["/Comics/{id}"] = x => { 
              Comic comic = API.GetComic(new Guid(x.id));
              if (comic == null)
              {
                return Response.AsError(HttpStatusCode.NotFound, "Comic not found");
              }

              return Response.AsOData(new List<Comic> { comic });
            };
        	  
            // Retrieve the specified page as a jpg file with the specified dimensions.
            Get["/Comics/{id}/Pages/{page}"] = x => {
              
              int width = Request.Query.width.HasValue ? int.Parse(Request.Query.width) : -1;
              int height = Request.Query.height.HasValue ? int.Parse(Request.Query.height) : -1;
              
              int maxWidth = Request.Query.maxWidth.HasValue ? int.Parse(Request.Query.maxWidth) : -1;
              int maxHeight = Request.Query.maxHeight.HasValue ? int.Parse(Request.Query.maxHeight) : -1;
              
              return API.GetPageImage(new Guid(x.id), int.Parse(x.page), width, height, settings, Response);
            };
            
        	  // Get one property.
        	  Get["/Comics/{id}/{property}"] = x => { 
              Comic comic = API.GetComic(new Guid(x.id));
              if (comic == null)
              {
                return Response.AsError(HttpStatusCode.NotFound, "Comic not found");
              }

              try 
              {
                PropertyInfo property = comic.GetType().GetProperty(x.property);
                object value = property.GetValue(comic, null);
                
                return Response.AsJson(value);
              }
              catch(Exception e)
              {
                return Response.AsError(HttpStatusCode.NotFound, "Comic property not found");
              }
            };
        	  
        	  // Update properties of the specified comicbook.
        	  Put["/Comics/{id}"] = x => {
        	    
        	    // Get the ComicBook entry from the library, so we can change it.
        	    ComicBook book = API.GetComicBook(new Guid(x.id));
        	    if (book == null)
        	    {
        	      return Response.AsError(HttpStatusCode.NotFound, "Comic not found");
        	    }
        	    
        	    // Convert form values to temporary ComicBook object.
        	    ComicBook info = this.Bind<ComicBook>();
        	    
        	    IEnumerable<string> keys = Request.Form.GetDynamicMemberNames();
        	    
        	    // This also triggers the update of the ComicRack application.
        	    book.CopyDataFrom(info, keys);
        	      
        	    return HttpStatusCode.OK;  
        	  };
        	  

        	  
        	  // Update one property
        	  Put["/Comics/{id}/{property}"] = x => {
        	    
        	    // Convert form values to temporary Comic object.
        	    string info = this.Bind<string>();
        	    
        	    
        	    // Now get the ComicBook entry from the library, so we can change it.
        	    ComicBook book = API.GetComicBook(x.id);
        	    if (book == null)
        	    {
        	      return Response.AsError(HttpStatusCode.NotFound, "Comic not found");
        	    }
        	    
        	    // Setting one of these values also triggers the update of the ComicRack application.
        	    book.SetValue(x.property, info);
        	    
        	    
        	    return HttpStatusCode.OK;  
        	  };
        	  
        	  // Get the BCR settings.
        	  Get["/Settings"] = x => {
        	    
        	    return Response.AsJson(settings, HttpStatusCode.OK);
        	  };
        	  
        	  // Update the BCR settings.
        	  Put["/Settings"] = x => {
        	    
        	    // TODO: only overwrite settings that were specified.
        	    try 
        	    {
          	    settings = this.Bind<BCRSettings>();
          	    settings.Save();
          	    return HttpStatusCode.OK;  
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString());
        	    }
        	  };
           
        	  Get["/Series"] = x => {
        	    try 
        	    {
        	      return Response.AsOData(API.GetSeries(), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.BadRequest, e.ToString());
        	    }
        	  };
        	  
        	  
        	  Get["/Series/{id}"] = x => {
        	    try 
        	    {
        	      return Response.AsOData(API.GetComicsFromSeries(new Guid(x.id)), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.BadRequest, e.ToString());
        	    }
        	  };
        	  
        	  Get["/Series/{id}/count"] = x => {
        	    try 
        	    {
        	      return Response.AsText(Context.ApplyODataUriFilter(API.GetComicsFromSeries(new Guid(x.id))).Count().ToString());
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.BadRequest, e.ToString());
        	    }
        	  };
        	  
        	  
        	  Get["/Publishers"] = x => {
        	    try 
        	    {
        	      return Response.AsOData(API.GetPublishers(), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.BadRequest, e.ToString());
        	    }
        	  };
        	  
        	  Get["/Log"] = x => {
        	    string severity = Request.Query.sev.HasValue ? Request.Query.sev : "";
              string message = Request.Query.msg.HasValue ? Request.Query.msg : "";
              return Response.AsRedirect("/viewer/resources/images/empty_1x1.png", RedirectResponse.RedirectType.Permanent);
        	  };
        	  
        }

    }
   
}
