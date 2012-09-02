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
using cYo.Common.IO;
using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Engine.IO.Provider;
using cYo.Projects.ComicRack.Viewer;
using Nancy;
//using Nancy.OData;
using Nancy.ModelBinding;
using Nancy.Responses;
using ComicRackWebViewer;
using System.Text.RegularExpressions;


using Linq2Rest.Parser;

namespace BCR
{
    public class NaturalSortComparer<T> : IComparer<string>, IDisposable
    {
        private bool isAscending;
     
        public NaturalSortComparer(bool inAscendingOrder = true)
        {
            this.isAscending = inAscendingOrder;
        }
     
        #region IComparer<string> Members
     
        public int Compare(string x, string y)
        {
            throw new NotImplementedException();
        }
     
        #endregion
     
        #region IComparer<string> Members
     
        int IComparer<string>.Compare(string x, string y)
        {
            if (x == y)
                return 0;
     
            string[] x1, y1;
     
            if (!table.TryGetValue(x, out x1))
            {
                x1 = Regex.Split(x.Replace(" ", ""), "([0-9]+)");
                table.Add(x, x1);
            }
     
            if (!table.TryGetValue(y, out y1))
            {
                y1 = Regex.Split(y.Replace(" ", ""), "([0-9]+)");
                table.Add(y, y1);
            }
     
            int returnVal;
     
            for (int i = 0; i < x1.Length && i < y1.Length; i++)
            {
                if (x1[i] != y1[i])
                {
                    returnVal = PartCompare(x1[i], y1[i]);
                    return isAscending ? returnVal : -returnVal;
                }
            }
     
            if (y1.Length > x1.Length)
            {
                returnVal = 1;
            }
            else if (x1.Length > y1.Length)
            {
                returnVal = -1;
            }
            else
            {
                returnVal = 0;
            }
     
            return isAscending ? returnVal : -returnVal;
        }
     
        private static int PartCompare(string left, string right)
        {
            int x, y;
            if (!int.TryParse(left, out x))
                return left.CompareTo(right);
     
            if (!int.TryParse(right, out y))
                return left.CompareTo(right);
     
            return x.CompareTo(y);
        }
     
        #endregion
     
        private Dictionary<string, string[]> table = new Dictionary<string, string[]>();
     
        public void Dispose()
        {
            table.Clear();
            table = null;
        }
    }
  
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
        
        public static string GetReflectedPropertyValue(this object subject, string field)
        {
            object reflectedValue = subject.GetType().GetProperty(field).GetValue(subject, null);
            return reflectedValue != null ? reflectedValue.ToString() : "";
        }
        
        public static IEnumerable<object> ApplyODataUriFilter<T>(this NancyContext context, IEnumerable<T> modelItems, ref int totalCount)
        {
            var nv = MyParseUriOptions(context);
                        
            
            // $select is broken somehow....remove it for now
            //NameValueCollection selectNV = new NameValueCollection();
            //selectNV.Add("$select", nv.Get("$select"));
            nv.Remove("$select");
            
            NameValueCollection pagingNV = new NameValueCollection();
            // We want the total count of the query before limiting the result set with $top and $skip
            if (null != nv.Get("$skip"))
            {
              pagingNV.Add("$skip", nv.Get("$skip"));
              nv.Remove("$skip");
            }
            
            if (null != nv.Get("$top"))
            {
              pagingNV.Add("$top", nv.Get("$top"));
              nv.Remove("$top");
            }
            
            // perform sorting ourselves, because linq2rest doesn't allow custom comparers.
            NameValueCollection sortNV = new NameValueCollection();
            if (null != nv.Get("$orderby"))
            {
              sortNV.Add("$orderby", nv.Get("$orderby"));
              nv.Remove("$orderby");
            }

            // Now do a query that returns all records
            var parser = new ParameterParser<T>();
            var filter = parser.Parse(nv);
            var objects = filter.Filter(modelItems);
            totalCount = objects.Count();
            
            // Now sort
            // Right now, only a single sort term is supported.
            if (null != sortNV.Get("$orderby"))
            {
              char[] delimiterChars = {','};
              string[] orderby = sortNV.Get("$orderby").Split(delimiterChars);
              char[] delimiterSpace = {' '};
              string[] terms = orderby[0].Split(delimiterSpace);
              bool ascending = true;
              if (terms.Count() == 2)
                ascending = terms[1] != "desc";
              
              if (orderby.Count() == 1)
              {
                objects = objects.OrderBy(item => item.GetReflectedPropertyValue(terms[0]), new NaturalSortComparer<string>(ascending));
              }
              else
              if (orderby.Count() > 1)
              {
                // get the second orderby
                string[] terms2 = orderby[1].Split(delimiterSpace);
                bool ascending2 = true;
                if (terms2.Count() == 2)
                  ascending2 = terms2[1] != "desc";
                
                objects = objects.OrderBy(item => item.GetReflectedPropertyValue(terms[0]), new NaturalSortComparer<string>(ascending))
                                 .ThenBy(item => item.GetReflectedPropertyValue(terms2[0]), new NaturalSortComparer<string>(ascending2));
              }
                
            }

            
            // Now limit the resultset
            var parser2 = new ParameterParser<T>();
            var filter2 = parser2.Parse(pagingNV);
            var objects2 = filter2.Filter(objects.Cast<T>());
            return objects2;
        }

        public static Response AsOData<T>(this IResponseFormatter formatter, IEnumerable<T> modelItems, HttpStatusCode code = HttpStatusCode.OK)
        {
            bool isJson = formatter.Context.Request.Headers.Accept.Select(x => x.Item1).Where(x => x.StartsWith("application/json", StringComparison.InvariantCultureIgnoreCase)).Any();

            var nv = MyParseUriOptions(formatter.Context);
            string value = nv.Get("$format");
            if (string.Compare(value, "json", true) == 0)
            {
              isJson = true;
            }

            // BCR only supports json, no need to supply the $format every time....
            isJson = true;
            
            if (isJson)
            {
              int totalCount = 0;
              return formatter.AsJson(formatter.Context.ApplyODataUriFilter(modelItems, ref totalCount), code);
            }
            throw new NotImplementedException("Atom feeds not implemented");
        }
    }
}



namespace BCR
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
    
    
      public static List<ComicBook> GetFolderBookList(string folder, bool includeSubFolders)
      {
        List<ComicBook> list = new List<ComicBook>();
        try
        {
          IEnumerable<string> fileExtensions = Providers.Readers.GetFileExtensions();
          foreach (string file in FileUtility.GetFiles(folder, includeSubFolders ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly, new string[0]))
          {
            string f = file;
            if (Enumerable.Any<string>(fileExtensions, (Func<string, bool>) (ext => f.EndsWith(ext, StringComparison.OrdinalIgnoreCase))))
            {
              ComicBook comicBook = Program.BookFactory.Create(file, CreateBookOption.AddToTemporary, list.Count > 100 ? RefreshInfoOptions.DontReadInformation : RefreshInfoOptions.None);
              if (comicBook != null)
                list.Add(comicBook);
            }
          }
        }
        catch
        {
        }
        return list;
      }
      
      public static List<string> GetFolderBookList2(string folder, bool includeSubFolders)
      {
        List<string> list = new List<string>();
        try
        {
          IEnumerable<string> fileExtensions = Providers.Readers.GetFileExtensions();
          foreach (string file in FileUtility.GetFiles(folder, includeSubFolders ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly, new string[0]))
          {
            string f = file;
            if (Enumerable.Any<string>(fileExtensions, (Func<string, bool>) (ext => f.EndsWith(ext, StringComparison.OrdinalIgnoreCase))))
            {
              list.Add(file);
            }
          }
        }
        catch
        {
        }
        return list;
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
                int totalCount = 0;
        	      return Response.AsText(Context.ApplyODataUriFilter(BCR.GetIssuesOfListFromId(new Guid(x.id), Context), ref totalCount).Count().ToString());
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
        	  
        	  Get["/Folder"] = x => {
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
        	  
        	  Get["/Folder/{id}"] = x => {
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
