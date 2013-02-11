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
//using cYo.Common;
//using cYo.Common.IO;
using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Engine.IO.Provider;
using cYo.Projects.ComicRack.Viewer;
using Nancy;
using Nancy.ModelBinding;
using Nancy.Responses;
using ComicRackWebViewer;
using System.Text.RegularExpressions;
using Linq2Rest.Parser;




namespace BCR
{
    public class BCRModule : NancyModule
    {
        public BCRModule()
            : base("/BCR")
        {
            Get["/"] = x => { return Response.AsRedirect("/tablet/index.html", RedirectResponse.RedirectType.Permanent); };
            
            ///////////////////////////////////////////////////////////////////////////////////////////////
            // Retrieve a list of all (smart)lists.
            Get["/Lists"] = x => { 
        	    try 
        	    {
                int depth = Request.Query.depth.HasValue ? int.Parse(Request.Query.depth) : -1;
         	      return Response.AsOData(Program.Database.ComicLists.Select(c => c.ToComicList(depth)));
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
            
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
            // Retrieve the contents of the specified list.
            Get["/Lists/{id}"]  = x => { 
              try
              {
          	    int depth = Request.Query.depth.HasValue ? int.Parse(Request.Query.depth) : -1;
          	    IEnumerable<ComicList> list = Program.Database.ComicLists.Where(c => c.Id == new Guid(x.id)).Select(c => c.ToComicList(depth));
          	    if (list.Count() == 0)
          	    {
          	      return Response.AsError(HttpStatusCode.NotFound, "List not found", Request);
          	    }
          	    
        	      return Response.AsOData(list); 
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
            
            ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // For OData compatibility, count should be $count, but I don't know how to parse the $ with Nancy....
        	  Get["/Lists/{id}/Comics/count"] = x => {
              try 
              {
                int totalCount = 0;
        	      return Response.AsText(Context.ApplyODataUriFilter(BCR.GetIssuesOfListFromId(new Guid(x.id), Context), ref totalCount).Count().ToString());
              }
              catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Return the comics of the specified list using OData to filter the comic properties and the list paging.
            Get["/Lists/{id}/Comics"] = x => { 
        	    try
        	    {
        	      var rawcomics = BCR.GetIssuesOfListFromId(new Guid(x.id), Context);
        	      int totalCount = 0;
        	      var comics = Context.ApplyODataUriFilter(rawcomics, ref totalCount);
        	      var result = new { totalCount = totalCount, items = comics };
        	      return Response.AsJson(result, HttpStatusCode.OK);
        	      
        	      //IEnumerable<Comic> comics = BCR.GetIssuesOfListFromId(new Guid(x.id), Context).Comics;
        	      //return Response.AsOData(comics); 
        	    }
        	    catch(Exception e)
        	    {
                return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
            
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Returns a list of all the comics as comic excerpts
        	  Get["/Comics"] = x => { 
        	    try
        	    {
        	      int totalCount = 0;
        	      var comics = Context.ApplyODataUriFilter(BCR.GetComics().Select(c => c.ToComicExcerpt()), ref totalCount).Cast<ComicExcerpt>();
        	      var result = new { totalCount = totalCount, items = comics };
        	      return Response.AsJson(result, HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Return the comicbook info as an OData filtered bag of properties.
            Get["/Comics/{id}"] = x => { 
        	    try
        	    {
                Comic comic = BCR.GetComic(new Guid(x.id));
                if (comic == null)
                {
                  return Response.AsError(HttpStatusCode.NotFound, "Comic not found", Request);
                }
  
                return Response.AsOData(new List<Comic> { comic });
        	    }
              catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
            };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
            // Retrieve the specified page as a jpg file with the specified dimensions.
            Get["/Comics/{id}/Pages/{page}"] = x => {
              try
              {
                int width = Request.Query.width.HasValue ? int.Parse(Request.Query.width) : -1;
                int height = Request.Query.height.HasValue ? int.Parse(Request.Query.height) : -1;
                
                int maxWidth = Request.Query.maxWidth.HasValue ? int.Parse(Request.Query.maxWidth) : -1;
                int maxHeight = Request.Query.maxHeight.HasValue ? int.Parse(Request.Query.maxHeight) : -1;
                
                return BCR.GetPageImage(new Guid(x.id), int.Parse(x.page), width, height, Response);
              }
              catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
            };
            
            
            ///////////////////////////////////////////////////////////////////////////////////////////////
            //
            Get["/Comics/{id}/Pages/{page}/size"] = x => {
              try
              {
                int width = 0;
                int height = 0;
                BCR.GetPageImageSize(new Guid(x.id), int.Parse(x.page), ref width, ref height);
                return Response.AsJson(new { width = width, height = height}, HttpStatusCode.OK);
              }
              catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
            };
            
            
            ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Get one property.
        	  Get["/Comics/{id}/{property}"] = x => { 
        	    try
        	    {
                Comic comic = BCR.GetComic(new Guid(x.id));
                if (comic == null)
                {
                  return Response.AsError(HttpStatusCode.NotFound, "Comic not found", Request);
                }

                PropertyInfo property = comic.GetType().GetProperty(x.property);
                object value = property.GetValue(comic, null);
                
                return Response.AsJson(value);
              }
              catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
            };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Update properties of the specified comicbook.
        	  Put["/Comics/{id}"] = x => {
        	    try
        	    {
          	    // Get the ComicBook entry from the library, so we can change it.
          	    ComicBook book = BCR.GetComicBook(new Guid(x.id));
          	    if (book == null)
          	    {
          	      return Response.AsError(HttpStatusCode.NotFound, "Comic not found", Request);
          	    }
          	    
          	    // Convert form values to temporary ComicBook object.
          	    ComicBook info = this.Bind<ComicBook>();
          	    
          	    IEnumerable<string> keys = Request.Form.GetDynamicMemberNames();
          	    
          	    // This also triggers the update of the ComicRack application.
          	    book.CopyDataFrom(info, keys);
          	      
          	    return HttpStatusCode.OK;  
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  

        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Update one property
        	  Put["/Comics/{id}/{property}"] = x => {
        	    try
        	    {
          	    // Convert form values to temporary Comic object.
          	    string info = this.Bind<string>();
          	    
          	    
          	    // Now get the ComicBook entry from the library, so we can change it.
          	    ComicBook book = BCR.GetComicBook(x.id);
          	    if (book == null)
          	    {
          	      return Response.AsError(HttpStatusCode.NotFound, "Comic not found", Request);
          	    }
          	    
          	    // Setting one of these values also triggers the update of the ComicRack application.
          	    book.SetValue(x.property, info);
          	    
          	    
          	    return HttpStatusCode.OK;  
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Get the BCR settings.
        	  Get["/Settings"] = x => {
        	    try
        	    {
        	      return Response.AsJson(BCRSettingsStore.Instance, HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Update the BCR settings.
        	  Put["/Settings"] = x => {
        	    
        	    // TODO: only overwrite settings that were specified.
        	    try 
        	    {
          	    BCRSettings settings = this.Bind<BCRSettings>();
          	    BCRSettingsStore.Instance.UpdateFrom(settings);
          	    return HttpStatusCode.OK;  
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
           
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Get a list of series
        	  Get["/Series"] = x => {
        	    try 
        	    {
        	      int totalCount = 0;
        	      var series = Context.ApplyODataUriFilter(BCR.GetSeries(), ref totalCount);
        	      var result = new { totalCount = totalCount, items = series };
        	      return Response.AsJson(result, HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Retrieve a list of all comics in the specified list
        	  Get["/Series/{id}"] = x => {
        	    try 
        	    {
        	      int totalCount = 0;
        	      var series = Context.ApplyODataUriFilter(BCR.GetComicsFromSeries(new Guid(x.id)), ref totalCount);
        	      var result = new { totalCount = totalCount, items = series };
        	      return Response.AsJson(result, HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Retrieve the number of comics in the specified list
        	  Get["/Series/{id}/count"] = x => {
        	    try 
        	    {
        	      int totalCount = 0;
        	      return Response.AsText(Context.ApplyODataUriFilter(BCR.GetComicsFromSeries(new Guid(x.id)), ref totalCount).Count().ToString());
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  //
        	  Get["/Series/{id}/Volumes"] = x => {
        	    try 
        	    {
        	      return Response.AsOData(BCR.GetVolumesFromSeries(new Guid(x.id)), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  //
        	  Get["/Series/{id}/Volumes/{volume}"] = x => {
        	    try 
        	    {
        	      int volume = int.Parse(x.volume);
        	      var comics = BCR.GetComicsFromSeriesVolume(new Guid(x.id), volume);
        	      return Response.AsOData(comics, HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Get a list of publishers
        	  Get["/Publishers"] = x => {
        	    try 
        	    {
        	      return Response.AsOData(BCR.GetPublishers(), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  //
        	  Get["/Log"] = x => {
        	    try
        	    {
          	    string severity = Request.Query.sev.HasValue ? Request.Query.sev : "";
                string message = Request.Query.msg.HasValue ? Request.Query.msg : "";
                
                // TODO: write log entry to a file.
                
                return Response.AsRedirect("/tablet/resources/images/empty_1x1.png", RedirectResponse.RedirectType.Permanent);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Get the list of watched folders.
        	  Get["/WatchFolder"] = x => {
        	    try 
        	    {
        	      //return Response.AsOData(BCR.GetPublishers(), HttpStatusCode.OK);
        	      
        	      var folders = Program.Database.WatchFolders as cYo.Projects.ComicRack.Engine.Database.WatchFolderCollection;
        	      
        	      List<string> books = BCRExtensions.GetFolderBookList2(folders.Folders.First(), true);
        	      return Response.AsJson(books, HttpStatusCode.OK);
        	      
        	      //return Response.AsRedirect("/tablet/resources/images/empty_1x1.png", RedirectResponse.RedirectType.Permanent);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Get list of all files in the folder 
        	  Get["/WatchFolder/{folder}"] = x => {
        	    try 
        	    {
        	      return Response.AsRedirect("/tablet/resources/images/empty_1x1.png", RedirectResponse.RedirectType.Permanent);
        	      
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        }

    }
   
}
