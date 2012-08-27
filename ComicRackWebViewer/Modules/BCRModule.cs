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



/*
using Linq2Rest.Parser;

namespace Nancy.OData
{
    public static class ODataExtensions
    {
        private const string ODATA_URI_KEY = "OData_Uri";

        private static NameValueCollection MyParseUriOptions(NancyContext context)
        {
            object item;
            if (context.Items.TryGetValue(ODATA_URI_KEY, out item))
            {
                return item as NameValueCollection;
            }
            NameValueCollection nv = new NameValueCollection();
            context.Items.Add(ODATA_URI_KEY, nv);
            var queryString = context.Request.Url.Query;
            if (string.IsNullOrWhiteSpace(queryString))
            {
                return nv;
            }
            if (!queryString.StartsWith("?"))
            {
                throw new InvalidOperationException("Invalid OData query string " + queryString);
            }
            var parameters = queryString.Substring(1).Split('&', '=');
            if (parameters.Length % 2 != 0)
            {
                throw new InvalidOperationException("Invalid OData query string " + queryString);
            }
            for (int i = 0; i < parameters.Length; i += 2)
            {
                nv.Add(parameters[i], Uri.UnescapeDataString(parameters[i + 1]));
            }
            return nv;
        }
        public static IEnumerable<object> MyApplyODataUriFilter<T>(this NancyContext context, IEnumerable<T> modelItems)
        {
            var nv = MyParseUriOptions(context);
            
            
            NameValueCollection selectNV = new NameValueCollection();
            selectNV.Add("$select", nv.Get("$select"));
            nv.Remove("$select");

            var parser = new ParameterParser<T>();
            var filter = parser.Parse(nv);
            var objects = filter.Filter(modelItems);
            
            var parser2 = new ParameterParser<T>();
            var filter2 = parser2.Parse(selectNV);
            var objects2 = filter2.Filter(objects.Cast<T>());
            return objects2;
        }

        public static Response MyAsOData<T>(this IResponseFormatter formatter, IEnumerable<T> modelItems, HttpStatusCode code = HttpStatusCode.OK)
        {
            bool isJson = formatter.Context.Request.Headers.Accept.Select(x => x.Item1).Where(x => x.StartsWith("application/json", StringComparison.InvariantCultureIgnoreCase)).Any();

            var nv = MyParseUriOptions(formatter.Context);
            string value = nv.Get("$format");
            if (string.Compare(value, "json", true) == 0)
            {
                isJson = true;
            }

            if (isJson)
            {
                return formatter.AsJson(formatter.Context.MyApplyODataUriFilter(modelItems), code);
            }
            throw new NotImplementedException("Atom feeds not implemented");
        }
    }
}

*/

namespace ComicRackWebViewer
{
    public static class BCRExtensions
    {
      public static Response AsError(this IResponseFormatter formatter, HttpStatusCode statusCode, string message, Request request)
      {
          return new Response
              {
                  StatusCode = statusCode,
                  ContentType = "text/plain",
                  Contents = stream => (new StreamWriter(stream) { AutoFlush = true }).Write("Request: " + request.Url + "\nError: " + message)
              };
      }
    }
    

	

    
    public class BCRModule : NancyModule
    {
        public BCRModule()
            : base("/BCR")
        {
            Get["/"] = x => { return Response.AsRedirect("/tablet/index.html", RedirectResponse.RedirectType.Permanent); };
            
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
        	  
        	  // For OData compatibility, count should be $count, but I don't know how to parse the $ with Nancy....
        	  Get["/Lists/{id}/Comics/count"] = x => {
              try 
              {
        	      return Response.AsText(Context.ApplyODataUriFilter(API.GetIssuesOfListFromId(new Guid(x.id), Context)).Count().ToString());
              }
              catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  // Return the comics of the specified list using OData to filter the comic properties and the list paging.
            Get["/Lists/{id}/Comics"] = x => { 
        	    try
        	    {
        	      var rawcomics = API.GetIssuesOfListFromId(new Guid(x.id), Context);
        	      var comics = Context.ApplyODataUriFilter(rawcomics);
        	      
        	      return Response.AsJson(comics, HttpStatusCode.OK);
        	      
        	      //IEnumerable<Comic> comics = API.GetIssuesOfListFromId(new Guid(x.id), Context).Comics;
        	      //return Response.AsOData(comics); 
        	    }
        	    catch(Exception e)
        	    {
                return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
            
        	  Get["/Comics"] = x => { 
        	    try
        	    {
        	      var comics = Context.ApplyODataUriFilter(API.GetComics().Select(c => c.ToComic())).Cast<Comic>();
        	      return Response.AsJson(comics.Select(c => c.ToComicExcerpt()), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  // Return the comicbook info as an OData filtered bag of properties.
            Get["/Comics/{id}"] = x => { 
        	    try
        	    {
                Comic comic = API.GetComic(new Guid(x.id));
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
        	  
            // Retrieve the specified page as a jpg file with the specified dimensions.
            Get["/Comics/{id}/Pages/{page}"] = x => {
              try
              {
                int width = Request.Query.width.HasValue ? int.Parse(Request.Query.width) : -1;
                int height = Request.Query.height.HasValue ? int.Parse(Request.Query.height) : -1;
                
                int maxWidth = Request.Query.maxWidth.HasValue ? int.Parse(Request.Query.maxWidth) : -1;
                int maxHeight = Request.Query.maxHeight.HasValue ? int.Parse(Request.Query.maxHeight) : -1;
                
                return API.GetPageImage(new Guid(x.id), int.Parse(x.page), width, height, Response);
              }
              catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
            };
            
        	  // Get one property.
        	  Get["/Comics/{id}/{property}"] = x => { 
        	    try
        	    {
                Comic comic = API.GetComic(new Guid(x.id));
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
        	  
        	  // Update properties of the specified comicbook.
        	  Put["/Comics/{id}"] = x => {
        	    try
        	    {
          	    // Get the ComicBook entry from the library, so we can change it.
          	    ComicBook book = API.GetComicBook(new Guid(x.id));
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
        	  

        	  
        	  // Update one property
        	  Put["/Comics/{id}/{property}"] = x => {
        	    try
        	    {
          	    // Convert form values to temporary Comic object.
          	    string info = this.Bind<string>();
          	    
          	    
          	    // Now get the ComicBook entry from the library, so we can change it.
          	    ComicBook book = API.GetComicBook(x.id);
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
           
        	  Get["/Series"] = x => {
        	    try 
        	    {
        	      return Response.AsOData(API.GetSeries(), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  Get["/Series/{id}"] = x => {
        	    try 
        	    {
        	      return Response.AsOData(API.GetComicsFromSeries(new Guid(x.id)), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  Get["/Series/{id}/count"] = x => {
        	    try 
        	    {
        	      return Response.AsText(Context.ApplyODataUriFilter(API.GetComicsFromSeries(new Guid(x.id))).Count().ToString());
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  Get["/Publishers"] = x => {
        	    try 
        	    {
        	      return Response.AsOData(API.GetPublishers(), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
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
        	  
        }

    }
   
}
