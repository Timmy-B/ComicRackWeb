﻿using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Viewer;
using Nancy;
using Nancy.ModelBinding;
using Nancy.Responses;
using Nancy.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;


namespace BCR
{

    public class BCRModule : NancyModule
    {
        public BCRModule()
          : base(Database.Instance.GlobalSettings.url_base + "/BCR")
        {
            // The user must be authenticated in order to use the BCR API.
            this.RequiresAuthentication();

            Get["/"] = x => { return Response.AsText("Authentication OK"); };
            
                        
            ///////////////////////////////////////////////////////////////////////////////////////////////
            // Retrieve a list of all (smart)lists.
            Get["/Lists"] = x => { 
              
        	    try 
        	    {
        	      //var user = (BCRUser)this.Context.CurrentUser;
                //Gui guid = user.GetHomeList();
                //ComicListItem item = Program.Database.ComicLists.GetItems<ComicListItem>(false).FirstOrDefault((ComicListItem cli) => cli.Id == s);
                
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
                BCRUser user = (BCRUser)this.Context.CurrentUser;
                int totalCount = 0;
        	      return Response.AsText(Context.ApplyODataUriFilter(BCR.GetComicsForList(user, new Guid(x.id)), ref totalCount).Count().ToString());
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
        	      BCRUser user = (BCRUser)this.Context.CurrentUser;
        	      
                var rawcomics = BCR.GetComicsForList(user, new Guid(x.id));
        	    int propCount = rawcomics.Count();
        	    var result = new { totalCount = propCount, items = rawcomics };
        	    return Response.AsJson(result, HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
                return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };

            ///////////////////////////////////////////////////////////////////////////////////////////////
            // Return the Library Totals.
            Get["/Totals"] = x => {
                try
                {
                    BCRUser user = (BCRUser)this.Context.CurrentUser;
                    var comics = BCR.GetComics().Select(c => c.ToComic(user));
                    var series = BCR.GetSeries();
                    var publishers = BCR.GetPublishers();
                    int issuesCount = comics.Count();
                    int seriesCount = series.Count();
                    int publishersCount = publishers.Count();
                    var result = new { issues = issuesCount, series = seriesCount, publishers = publishersCount };
                    return Response.AsJson(result, HttpStatusCode.OK);
                }
                catch (Exception e)
                {
                    return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
                }
            };

            ///////////////////////////////////////////////////////////////////////////////////////////////
            // Returns a list of all the comics as comic excerpts
            Get["/Comics"] = x => { 
        	    try
        	    {
        	      BCRUser user = (BCRUser)this.Context.CurrentUser;
        	      var comics = BCR.GetComics().Select(c => c.ToComic(user));
                  int propCount = comics.Count();
        	      var result = new { totalCount = propCount, items = comics };
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
        	    BCRUser user = (BCRUser)this.Context.CurrentUser;
                Comic comic = BCR.GetComic(user, new Guid(x.id));
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
            // Retrieve the original size (in pixels) of the requested page.
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

            Get["/Comics/{id}/pagesizes"] = x => {
                try
                {
                    //   int width = 0;
                    //     int height = 0;
                    //  int pageCnt = 0;
                    //      List<PageSizes> pagesizes = new List<PageSizes>();
                    //    BCRUser user = (BCRUser)this.Context.CurrentUser;
                    //      Comic comic = BCR.GetComic(user, new Guid(x.id));
                    var pages = BCR.GetPagesInfo(new Guid(x.id));
                    if (pages == null)
                    {
                        return Response.AsError(HttpStatusCode.NotFound, "Comic not found", Request);
                    }
                    
                   // pageCnt = comic.PageCount;
                    //  for (int i = 0; i < pageCnt; i++)
                    // {
                         //BCR.GetPageImageSize(new Guid(x.id), i, ref width, ref height);
                         //pagesizes.Add(new PageSizes { pageNbr = i, height = height, width = width, ratio = width / height });
                    // }

                     return Response.AsJson(pages, HttpStatusCode.OK);
                }
                catch (Exception e)
                {
                    return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
                }
            };

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // Get one property.
        /*
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
      */


        ///////////////////////////////////////////////////////////////////////////////////////////////
        // Update properties of the specified comicbook.
        /*
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
        */

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // Update properties of the specified comicbook for the current user
        Post["/Comics/{id}/Progress"] = x => {
        	    try
        	    {
                      // Check if the comic exists.
                

                  Guid comicId = new Guid(x.id);
                ComicBook book = BCR.GetComics().FirstOrDefault(comic => comic.Id == comicId);
          	    if (book == null)
          	    {
          	      return Response.AsError(HttpStatusCode.NotFound, "Comic not found", Request);
          	    }

                BCRUser user = (BCRUser)this.Context.CurrentUser;
          	    user.UpdateComicProgress(book, int.Parse(this.Request.Form.CurrentPage));
                //if using multiple users do we update the master file with a users progress?
                //book.SetValue("CurrentPage", int.Parse(this.Request.Form.CurrentPage));
                return HttpStatusCode.OK;  
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Update one property
        	  /*
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
        	  */
        	 
        	 
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Get the BCR settings.
        	  Get["/Settings"] = x => {
        	    try
        	    {
        	      var user = (BCRUser)this.Context.CurrentUser;
        	      return Response.AsJson(user.GetSettings(), HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
        	  
        	  
        	  ///////////////////////////////////////////////////////////////////////////////////////////////
        	  // Update the BCR settings.
        	  Put["/Settings"] = x => {
        	    try 
        	    {
          	    var user = (BCRUser)this.Context.CurrentUser;
          	    user.UpdateSettings(this.Bind<UserSettings>());
          	    
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
                 var user = (BCRUser)this.Context.CurrentUser;
        	     var series = BCR.GetSeriesList();
                 int propCount = series.Count();
                 var result = new { totalCount = propCount, items = series };
        	     return Response.AsJson(result, HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };
            // Get a list of series added in the last 2 days
            Get["/Series/Recent/{days}"] = x => {
                try
                {
                    var user = (BCRUser)this.Context.CurrentUser;
                    int days = x.days;
                    var series = BCR.GetMostRecentlyAdded(user, days);
                    int propCount = series.Count();
                    var result = new { totalCount = propCount, items = series };
                    return Response.AsJson(result, HttpStatusCode.OK);
                }
                catch (Exception e)
                {
                    return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
                }
            };
            // Get a list of series Read in the last 2 days
            Get["/Series/RecentlyRead/{days}"] = x => {
                try
                {
                    var user = (BCRUser)this.Context.CurrentUser;
                    int days = x.days;
                    var series = BCR.GetMostRecentlyRead(user, days);
                    int propCount = series.Count();
                    var result = new { totalCount = propCount, items = series };
                    return Response.AsJson(result, HttpStatusCode.OK);
                }
                catch (Exception e)
                {
                    return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
                }
            };
            ///////////////////////////////////////////////////////////////////////////////////////////////
            // Retrieve a list of all comics in the specified list
            Get["/Series/{id}"] = x => {
        	    try 
        	    {
        	      var user = (BCRUser)this.Context.CurrentUser;
        	      var series =BCR.GetComicsFromSeries(user, new Guid(x.id));
                  int propCount = series.Count();
                  var result = new { totalCount = propCount, items = series };
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
        	      var user = (BCRUser)this.Context.CurrentUser;
        	      int totalCount = 0;
        	      return Response.AsText(Context.ApplyODataUriFilter(BCR.GetComicsFromSeries(user, new Guid(x.id)), ref totalCount).Count().ToString());
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
        	      BCRUser user = (BCRUser)this.Context.CurrentUser;
        	      int volume = int.Parse(x.volume);
        	      var comics = BCR.GetComicsFromSeriesVolume(user, new Guid(x.id), volume);
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
                      var publishers =  BCR.GetPublishers();
                      int propCount = publishers.Count();
                      var result = new { totalCount = propCount, items = publishers };
                      return Response.AsJson(result, HttpStatusCode.OK);
        	    }
        	    catch(Exception e)
        	    {
        	      return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
        	    }
        	  };

            Get["/Publishers/{publisher}/Imprint/{imprint}/"] = x => {
                try
                {
                    var user = (BCRUser)this.Context.CurrentUser;
                    var pub = x.publisher;
                    var imprint = x.imprint;
                    if (string.IsNullOrEmpty(imprint))
                    {
                        imprint = "";
                    }
                    var series = BCR.GetSeries(pub, imprint);
                   // int propCount = series.Count();
                    var result = new { items = series };
                    return Response.AsJson(result, HttpStatusCode.OK);
                }
                catch (Exception e)
                {
                    return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
                }
            };


            Get["/Ratings"] = x => {
                try
                {
                    var series = BCR.GetAgeRatings();
                    int propCount = series.Count();
                    var result = new { totalCount = propCount, items = series };
                    return Response.AsJson(result, HttpStatusCode.OK);
                }
                catch (Exception e)
                {
                    return Response.AsError(HttpStatusCode.InternalServerError, e.ToString(), Request);
                }
            };

            Get["/Rating/{rating}/"] = x => {
                try
                {
                    var user = (BCRUser)this.Context.CurrentUser;
                    string rating = x.rating;
                    // replace ~ with +
                    rating = rating.Replace('~', '+');
                    if (string.IsNullOrEmpty(rating))
                    {
                        rating = "";
                    }
                    var series = BCR.GetSeriesByAgeRating(rating);
                    int propCount = series.Count();
                    var result = new { totalCount = propCount, items = series };
                    return Response.AsJson(result, HttpStatusCode.OK);
                }
                catch (Exception e)
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