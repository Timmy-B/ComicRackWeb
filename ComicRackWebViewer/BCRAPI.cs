#define USE_GDI
//#define USE_FIB
//#define USE_DIB

using System;
using System.Windows;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.IO;
using System.Linq;
using cYo.Projects.ComicRack.Engine;
using cYo.Projects.ComicRack.Engine.IO.Provider;
using cYo.Projects.ComicRack.Viewer;
using Nancy;
using Nancy.OData;
using FreeImageAPI;



namespace BCR
{
    public static class BCR
    {
        private static System.Object lockThis = new System.Object();
        
        public static IEnumerable<ComicExcerpt> GetIssuesOfListFromId(Guid id, NancyContext context)
        {
            var list = Program.Database.ComicLists.FindItem(id);
            if (list == null)
            {
              return Enumerable.Empty<ComicExcerpt>();
            }
            
            return list.GetBooks().Select(x => x.ToComicExcerpt());
        }

        public static IEnumerable<Series> GetSeriesAndVolumes()
        {
          return ComicRackWebViewer.Plugin.Application.GetLibraryBooks().AsSeries();
        }

        public static IEnumerable<Series> GetSeries()
        {
          return ComicRackWebViewer.Plugin.Application.GetLibraryBooks().AsSeries();
          //return ComicRackWebViewer.Plugin.Application.GetLibraryBooks().Select(x => x.ToSeries()).Distinct();
        }
        /*
         * 
         */ 
        public static IEnumerable<Comic> GetSeries(Guid id, NancyContext context)
        {
            var books = ComicRackWebViewer.Plugin.Application.GetLibraryBooks();
            var book = books.Where(x => x.Id == id).First();
            var series = books.Where(x => x.ShadowSeries == book.ShadowSeries)
                .Where(x => x.ShadowVolume == book.ShadowVolume)
                .Select(x => x.ToComic())
                .OrderBy(x => x.ShadowNumber).ToList();

            return context.ApplyODataUriFilter(series).Cast<Comic>();
        }
        
        // Get all comics from a specific series
        public static IEnumerable<ComicExcerpt> GetComicsFromSeries(Guid id)
        {
            var books = ComicRackWebViewer.Plugin.Application.GetLibraryBooks();
            var book = books.Where(x => x.Id == id).First();
            var series = books.Where(x => x.ShadowSeries == book.ShadowSeries)
                .Where(x => x.ShadowVolume == book.ShadowVolume)
                .Select(x => x.ToComicExcerpt())
                .OrderBy(x => x.ShadowVolume)
                .ThenBy(x => x.ShadowNumber).ToList();
            
            return series;
        }
        
        // Get all volumes from a specific series
        public static IEnumerable<int> GetVolumesFromSeries(Guid id)
        {
            var books = ComicRackWebViewer.Plugin.Application.GetLibraryBooks();
            var book = books.Where(x => x.Id == id).First();
            var volumes = books.Where(x => x.ShadowSeries == book.ShadowSeries).Select(x => x.ShadowVolume).Distinct();
                        
            return volumes;
        }
        
        // Get all comics from a specific series and volume
        public static IEnumerable<ComicExcerpt> GetComicsFromSeriesVolume(Guid id, int volume)
        {
            var books = ComicRackWebViewer.Plugin.Application.GetLibraryBooks();
            var book = books.Where(x => x.Id == id).First();
            var series = books.Where(x => x.ShadowSeries == book.ShadowSeries)
                .Where(x => x.ShadowVolume == volume)
                .Select(x => x.ToComicExcerpt())
                .OrderBy(x => x.ShadowNumber).ToList();
            
            return series;
        }


        public static MemoryStream GetBytesFromImage(Image image/*, bool progressive, int qualitylevel*/)
        {
            var bitmap = new Bitmap(image);
            MemoryStream stream = new MemoryStream();
            bitmap.Save(stream, ImageFormat.Jpeg);
            
            stream.Position = 0;
            return stream;
        }

        private static Bitmap GetPageBitmap(Guid id, int page)
        {
          try
          {
            ComicBook comic = GetComics().First(x => x.Id == id);
            var index = comic.TranslatePageToImageIndex(page);
            var provider = GetProvider(comic);
            if (provider == null)
            {
                return null;
            }
            return provider.GetImage(index); // ComicRack returns the page converted to a jpeg image.....
          }
          catch //(Exception e)
          {
              //MessageBox.Show(e.ToString());
              return null;
          }
        }
        private static byte[] GetPageImageBytes(Guid id, int page)
        {
            try
            {
              ComicBook comic = GetComics().First(x => x.Id == id);
              // Webcomics are not (yet) supported. If I don't filter them here, ComicRack hangs.
              if (comic.IsDynamicSource)
                return null;
              
              var index = comic.TranslatePageToImageIndex(page);
              var provider = GetProvider(comic);
              if (provider == null)
              {
                  return null;
              }
              return provider.GetByteImage(index); // ComicRack returns the page converted to a jpeg image.....
            }
            catch //(Exception e)
            {
                //MessageBox.Show(e.ToString());
                return null;
            }
        }
        
        // Uses GDI+ for resizing.
        public static Bitmap Resize(Image img, int width, int height)
        {
            //create a new Bitmap the size of the new image
            Bitmap bmp = new Bitmap(width, height);
            //create a new graphic from the Bitmap
            Graphics graphic = Graphics.FromImage((Image)bmp);
            graphic.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphic.SmoothingMode  = SmoothingMode.HighQuality;
            graphic.CompositingQuality = CompositingQuality.HighQuality;
            graphic.PixelOffsetMode = PixelOffsetMode.HighQuality; 
            //draw the newly resized image
            graphic.DrawImage(img, 0, 0, width, height);
            //dispose and free up the resources
            graphic.Dispose();
            //return the image
            return bmp;
        }
        
        
        public static bool GetPageImageSize(Guid id, int page, ref int width, ref int height)
        {
          MemoryStream stream = null;
          /*
          // Check if a processed (rescaled and/or progressive) image is cached.
          string processed_filename = string.Format("{0}-p{1}-processed.jpg", id, page);
          stream = BCRSettingsStore.Instance.LoadFromCache(processed_filename, false);
          if (stream != null)
            return response.FromStream(stream, MimeTypes.GetMimeType(".jpg"));
          */
        
          if (stream == null)
          {
            // Check if original image is in the cache.
            string org_filename = string.Format("{0}-p{1}.jpg", id, page);
            stream = BCRSettingsStore.Instance.LoadFromCache(org_filename, false);
            
            if (stream == null)
            {
              // Image is not in the cache, get it via ComicRack.
              var bytes = GetPageImageBytes(id, page);
              if (bytes == null)
              {
                return false;
              }
              
              stream = new MemoryStream(bytes);
              
              // Always save the original page to the cache
              BCRSettingsStore.Instance.SaveToCache(org_filename, stream, false);
            }
          }
          
          stream.Seek(0, SeekOrigin.Begin);

          Bitmap bitmap = new Bitmap(stream, false);
          width = (int)bitmap.Width;
          height = (int)bitmap.Height;
          bitmap.Dispose();
          return true;    
        }
        
        public static Response GetPageImage(Guid id, int page, int width, int height, IResponseFormatter response)
        {
          // Restrict access to the FreeImage library to one thread at a time.
          lock(lockThis)
          {
            int max_width = 0;
            int max_height = 0;
            bool thumbnail = !(width == -1 && height == -1);
            bool processed = false;
            
            MemoryStream stream = null;
            
            string filename = string.Format("{0}-p{1}-w{2}-h{3}.jpg", id, page, width, height);
            
            //string info_filename = string.Format("{0}-p{1}.txt", id, page);
            //int info_width = 0;
            //int info_height = 0;
            //bool success = BCRSettingsStore.GetImageInfoFromCache(info_filename, ref info_width, ref info_height);
            
            if (thumbnail)
            {
              stream = BCRSettingsStore.Instance.LoadFromCache(filename, true);
            
              // Cached thumbnails are assumed to be in the correct format and adhere to the size/format restrictions of the ipad.
              if (stream != null)
                return response.FromStream(stream, MimeTypes.GetMimeType(".jpg"));
            }
            else
            {
              // Check if a processed (rescaled and/or progressive) image is cached.
              string processed_filename = string.Format("{0}-p{1}-processed.jpg", id, page);
              stream = BCRSettingsStore.Instance.LoadFromCache(processed_filename, false);
              if (stream != null)
                return response.FromStream(stream, MimeTypes.GetMimeType(".jpg"));
            }
          
            if (stream == null)
            {
              // Check if original image is in the cache.
              string org_filename = string.Format("{0}-p{1}.jpg", id, page);
              stream = BCRSettingsStore.Instance.LoadFromCache(org_filename, false);
              
              if (stream == null)
              {
                // Image is not in the cache, get it via ComicRack.
                var bytes = GetPageImageBytes(id, page);
                if (bytes == null)
                {
                  return HttpStatusCode.NotFound;
                }
                
                stream = new MemoryStream(bytes);
                
                // Always save the original page to the cache
                BCRSettingsStore.Instance.SaveToCache(org_filename, stream, false);
              }
            }
            
            stream.Seek(0, SeekOrigin.Begin);

            #if USE_GDI
            
              Bitmap bitmap = new Bitmap(stream, false);
              int bitmap_width = (int)bitmap.Width;
              int bitmap_height = (int)bitmap.Height;
              
            #elif USE_DIB
            
              FIBITMAP dib = FreeImage.LoadFromStream(stream);
              if (dib == null)
              {
                Console.WriteLine("Loading bitmap failed. Aborting.");
                // Check whether there was an error message.
                return HttpStatusCode.InternalServerError;
              }
              int bitmap_width = (int)FreeImage.GetWidth(dib);
              int bitmap_height = (int)FreeImage.GetHeight(dib);
            
            #elif USE_FIB
            
              FreeImageBitmap fib = FreeImageBitmap.FromStream(stream, false);
              if (fib == null)
              {
                Console.WriteLine("Loading bitmap failed. Aborting.");
                // Check whether there was an error message.
                return HttpStatusCode.InternalServerError;
              }
                                      
              int bitmap_width = (int)fib.Width;
              int bitmap_height = (int)fib.Height;
            #endif
            
            if (BCRSettingsStore.Instance.use_max_dimension)
            {
              int mw, mh;
              
              if (bitmap_width >= bitmap_height)
              {
                mw = BCRSettingsStore.Instance.max_dimension_long;
                mh = BCRSettingsStore.Instance.max_dimension_short;
              }
              else
              {
                mw = BCRSettingsStore.Instance.max_dimension_short;
                mh = BCRSettingsStore.Instance.max_dimension_long;
              }
              
              if (bitmap_width > mw || bitmap_height > mh)
              {
                double scaleW = (double)mw / (double)bitmap_width;
                double scaleH = (double)mh / (double)bitmap_height;
                double scale = Math.Min(scaleW, scaleH);
                
                max_width = (int)Math.Floor(scale * bitmap_width);
                max_height = (int)Math.Floor(scale * bitmap_height);
              }
              else
              {
                max_width = bitmap_width;
                max_height = bitmap_height;
              }
            }
            else            
            // Check if the image dimensions exceeds the maximum image dimensions
            if ((bitmap_width * bitmap_height) > BCRSettingsStore.Instance.maximum_imagesize)
            {
              max_width = (int)Math.Floor(Math.Sqrt((double)bitmap_width / (double)bitmap_height * (double)BCRSettingsStore.Instance.maximum_imagesize));
              max_height = (int)Math.Floor((double)max_width * (double)bitmap_height / (double)bitmap_width);
            }
            else
            {
              max_width = bitmap_width;
              max_height = bitmap_height;
            }
                        
            // Calculate the dimensions of the returned image.
            int result_width = width;
            int result_height = height;
            
            if (result_width == -1 && result_height == -1)
            {
              result_width = max_width;
              result_height = max_height;
            }
            else
            {
              if (result_width == -1)
              {
                result_height = Math.Min(max_height, result_height);
                double ratio = (double)result_height / (double)max_height;
                result_width = (int)Math.Floor(((double)max_width * ratio));
              }
              else
              if (result_height == -1)
              {
                result_width = Math.Min(max_width, result_width);
                double ratio = (double)result_width / (double)max_width;
                result_height = (int)Math.Floor(((double)max_height * ratio));
              }
            }
            
            // TODO: do this per requesting target device instead of using one global setting.
            
            // Resize ?
            if (result_width != bitmap_width || result_height != bitmap_height)
            {
                processed = true;
                
              #if USE_DIB || USE_FIB
                //FREE_IMAGE_FILTER resizer = FREE_IMAGE_FILTER.FILTER_BICUBIC;
                FREE_IMAGE_FILTER resizer = FREE_IMAGE_FILTER.FILTER_LANCZOS3;
                
                #if USE_FIB
                  fib.Rescale(result_width, result_height, resizer);
                #else
                              
                  FIBITMAP newdib = FreeImage.Rescale(dib, result_width, result_height, resizer);
                  if (!newdib.IsNull)
                  {
                    FreeImage.Unload(dib);
                    dib.SetNull();
                    dib = newdib;
                  }
                #endif
              #elif USE_GDI
                bitmap = Resize(bitmap, result_width, result_height);
              #endif
            }
            
            
            // Check if the image must be converted to progressive jpeg
            if (BCRSettingsStore.Instance.use_progressive_jpeg && (result_width * result_height) >= BCRSettingsStore.Instance.progressive_jpeg_size_threshold)
            {
              processed = true;
              
              // Convert image to progressive jpeg
              
              // FreeImage source code reveals that lower 7 bits of the FREE_IMAGE_SAVE_FLAGS enum are used for low-level quality control.
              FREE_IMAGE_SAVE_FLAGS quality = (FREE_IMAGE_SAVE_FLAGS)BCRSettingsStore.Instance.progressive_jpeg_quality;
              FREE_IMAGE_SAVE_FLAGS flags = FREE_IMAGE_SAVE_FLAGS.JPEG_SUBSAMPLING_444 | FREE_IMAGE_SAVE_FLAGS.JPEG_PROGRESSIVE | quality;

              #if USE_DIB || USE_FIB
                
                stream.Dispose();
                stream = new MemoryStream();
                
                #if USE_FIB
                
                  fib.Save(stream, FREE_IMAGE_FORMAT.FIF_JPEG, flags);
                  fib.Dispose();
                  
                #else
                
                  FreeImage.SaveToStream(dib, stream, FREE_IMAGE_FORMAT.FIF_JPEG, flags);
                  FreeImage.Unload(dib);
                  dib.SetNull();
                 
                #endif
                
              #else
                FIBITMAP dib = FreeImage.CreateFromBitmap(bitmap);
                bitmap.Dispose();
                stream.Dispose();
                stream = new MemoryStream();
                
                FreeImage.SaveToStream(dib, stream, FREE_IMAGE_FORMAT.FIF_JPEG, flags);
                FreeImage.Unload(dib);
                dib.SetNull();
                
              #endif              
            }
            else
            if (processed) 
            {
              // image was rescaled, make new stream with rescaled bitmap
              
              #if USE_DIB || USE_FIB
              
                FREE_IMAGE_SAVE_FLAGS flags = FREE_IMAGE_SAVE_FLAGS.JPEG_SUBSAMPLING_444 | FREE_IMAGE_SAVE_FLAGS.JPEG_OPTIMIZE | FREE_IMAGE_SAVE_FLAGS.JPEG_QUALITYNORMAL;
                
                stream.Dispose();  
                stream = new MemoryStream();
                
                #if USE_FIB
                  fib.Save(stream, FREE_IMAGE_FORMAT.FIF_JPEG, flags);
                  fib.Dispose();
                #else
                  FreeImage.SaveToStream(dib, stream, FREE_IMAGE_FORMAT.FIF_JPEG, flags);
                  FreeImage.Unload(dib);
                  dib.SetNull();
                #endif
              #else
              
                stream = GetBytesFromImage(bitmap);
   
              #endif           
              // For now, images that were resized because they exceeded the maximum dimensions are not saved to the cache.
            }
            
            #if USE_DIB
              FreeImage.Unload(dib);
              dib.SetNull();
            #elif USE_FIB
              fib.Dispose();
            #elif USE_GDI
              bitmap.Dispose();            
            #endif
            
            // Always save thumbnails to the cache
            if (thumbnail)
            {
              BCRSettingsStore.Instance.SaveToCache(filename, stream, true);
            }
            else
            if (processed)
            {
              // Store rescaled and/or progressive jpegs in the cache for now.
              string processed_filename = string.Format("{0}-p{1}-processed.jpg", id, page);
              BCRSettingsStore.Instance.SaveToCache(processed_filename, stream, false);
            }
            
            stream.Seek(0, SeekOrigin.Begin);
            return response.FromStream(stream, MimeTypes.GetMimeType(".jpg"));
          }
        }
        
        private static ImageProvider GetProvider(ComicBook comic)
        {
            var provider = comic.CreateImageProvider();
            if (provider == null)
            {
                return null;
            }
            if (provider.Status != ImageProviderStatus.Completed)
            {
                provider.Open(false);
            }
            return provider;
        }

        public static Comic GetComic(Guid id)
        {
          try
          {
            var comic = GetComics().First(x => x.Id == id);
            return comic.ToComic();
          }
          catch//(Exception e)
          {
            //MessageBox.Show(e.ToString());
            return null;
          }
        }
        
        public static ComicBook GetComicBook(Guid id)
        {
          try
          {
            var comic = GetComics().First(x => x.Id == id);
            return comic;
          }
          catch//(Exception e)
          {
            //MessageBox.Show(e.ToString());
            return null;
          }
        }

        public static IQueryable<ComicBook> GetComics()
        {
            return ComicRackWebViewer.Plugin.Application.GetLibraryBooks().AsQueryable();
        }

        public static Response GetIcon(string key, IResponseFormatter response)
        {
            var image = ComicBook.PublisherIcons.GetImage(key);
            if (image == null)
            {
                return response.AsRedirect("/original/Views/spacer.png");
            }
            return response.FromStream(GetBytesFromImage(image), MimeTypes.GetMimeType(".jpg"));
        }

        public static IEnumerable<Publisher> GetPublishers()
        {
            return ComicRackWebViewer.Plugin.Application.GetLibraryBooks().GroupBy(x => x.Publisher).Select(x =>
            {
                return x.GroupBy(y => y.Imprint).Select(y => new Publisher { Name = x.Key, Imprint = y.Key });
            }).SelectMany(x => x).OrderBy(x => x.Imprint).OrderBy(x => x.Name);
        }

        public static IEnumerable<Series> GetSeries(string publisher, string imprint)
        {
            IEnumerable<ComicBook> comics;
            if (string.Compare(publisher, "no publisher", true) == 0)
            {
                comics = ComicRackWebViewer.Plugin.Application.GetLibraryBooks().Where(x => string.IsNullOrEmpty(x.Publisher));
            }
            else
            {
                comics = ComicRackWebViewer.Plugin.Application.GetLibraryBooks().Where(x => string.Compare(publisher, x.Publisher, true) == 0);
                if (string.IsNullOrEmpty(imprint))
                {
                    comics = comics.Where(x => string.IsNullOrEmpty(x.Imprint));
                }
                comics = comics.Where(x => string.Compare(imprint, x.Imprint, true) == 0);
            }
            return comics.AsSeries();
        }
    }

}
