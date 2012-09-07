using System.Collections.Generic;
using System.IO;
using System.IO.IsolatedStorage;
using System;
using System.Xml.Serialization;

using System.Drawing;

namespace BCR
{
    public class BCRSettings
    {
        public bool open_current_comic_at_launch { get; set; }
        public bool open_next_comic { get; set; }
        public int page_fit_mode { get; set; } // 1: Fit width, 2: Full page
        public int zoom_on_tap { get; set; } // 0: off, 1: singletap, 2: doubletap
        public int toggle_paging_bar { get; set; } // 0: off, 1: singletap, 2: doubletap
        public bool use_page_turn_drag { get; set; }
        public int page_turn_drag_threshold { get; set; }
        public bool use_page_change_area { get; set; }
        public int page_change_area_width { get; set; }
        public int cache_size { get; set; }
        public bool nancy_request_tracing { get; set; }
        public string nancy_diagnostics_password { get; set; }
        public int webserver_port { get; set; }
        public string webserver_externalip { get; set; }
                
        
        // TODO: maximum image size should be per requesting target device instead of using one global setting.
        
        // Image conversion settings
        // If use_progressive_jpeg is enabled, images are recompressed to progressive jpeg format.
        // This is done, because the iPad (IOS 5 and lower) have a limit of 2 megapixels on images in normal jpeg format.
        // All normal jpeg images larger than 2 MP are subsampled to abominable quality.
        // Subsampling doesn't occur for progressive jpeg and for png file.
        // IOS 6 should have a larger limit of 5 MP, which will still be too small for HD comics.
        // As the images will be recompressed, some quality loss may occur, but it's way better than subsampling.
        public bool use_progressive_jpeg { get; set; }
        public int progressive_jpeg_quality { get; set; }
        public int progressive_jpeg_size_threshold { get; set; }
        
        // Maximum image dimensions
        public int maximum_imagesize { get; set; }
        
        public bool use_max_dimension { get; set; }
        public int max_dimension_long { get; set; }
        public int max_dimension_short { get; set; }
                
          
        public BCRSettings()
        {
          open_current_comic_at_launch = true; 
          open_next_comic = true;
          page_fit_mode = 1;
          zoom_on_tap = 1;
          toggle_paging_bar = 2;
          use_page_turn_drag = true;
          page_turn_drag_threshold = 75;
          use_page_change_area = true;
          page_change_area_width = 50;
          cache_size = 1024; // MB 
          
          nancy_request_tracing = true;
          nancy_diagnostics_password = "diagnostics";
          
          // Maximum image dimensions for images.
          // If you never zoom in, then set this to the size of your tablet screen, e.g. 2048x1536 for ipad 3
          use_max_dimension = false;
          max_dimension_long = 4096;
          max_dimension_short = 3072; 
          
          webserver_port = 8080;
          webserver_externalip = ""; 
          
          maximum_imagesize = 5*1024*1024; // IOS5 : 5 megapixels
          
          use_progressive_jpeg = true;
          progressive_jpeg_size_threshold = 2*1024*1024; // 2 megapixels
          progressive_jpeg_quality = 90; // 10..100 %
        }
    }
     
    public sealed class BCRSettingsStore : BCRSettings
    {
        private const string DIRECTORY = "ComicRack BCR";
        private const string SETTINGS_FILE = "settings.xml";
        
        private static string folder;
        private static string cache_folder;
        private static string thumbnail_folder;
        private static string filepath;
        
        //private static int max_image_dimension = 3072; // max ipad image size is 4096x3072 ?

        private static BCRSettingsStore instance = new BCRSettingsStore();
    
        public static BCRSettingsStore Instance 
        {
          get { return instance; }
        }
        
        private BCRSettingsStore()
        { 
          folder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), DIRECTORY);
          if (!Directory.Exists(folder))
          {
        	  Directory.CreateDirectory(folder);
          }
          
          cache_folder = folder + "\\cache\\";
          if (!Directory.Exists(cache_folder))
          {
        	  Directory.CreateDirectory(cache_folder);
          }
          
          thumbnail_folder = folder + "\\cache\\thumbnails\\";
          if (!Directory.Exists(thumbnail_folder))
          {
        	  Directory.CreateDirectory(thumbnail_folder);
          }
          

          filepath = folder + "\\" + SETTINGS_FILE;
          
          if (File.Exists(filepath))
          {
            Load();
          }
          
          // save current settings once, so new entries will be saved in the xml file.
          Save();
        }

    
        // this can undoubtely be done simpler, but I don't enough C#....
        public void UpdateFrom(BCRSettings data)
        {
          open_current_comic_at_launch = data.open_current_comic_at_launch; 
          open_next_comic = data.open_next_comic;
          page_fit_mode = data.page_fit_mode;
          zoom_on_tap = data.zoom_on_tap;
          toggle_paging_bar = data.toggle_paging_bar;
          use_page_turn_drag = data.use_page_turn_drag;
          page_turn_drag_threshold = data.page_turn_drag_threshold;
          use_page_change_area = data.use_page_change_area;
          page_change_area_width = data.page_change_area_width;
          cache_size = data.cache_size; 
          
          nancy_request_tracing = data.nancy_request_tracing;
          nancy_diagnostics_password = data.nancy_diagnostics_password;
          
          webserver_port = data.webserver_port;
          webserver_externalip = data.webserver_externalip; 
          max_dimension_long = data.max_dimension_long;
          max_dimension_short = data.max_dimension_short;
          Save();
        }
        
        
        public BCRSettings GetData()
        {
          BCRSettings data = new BCRSettings();
          data.open_current_comic_at_launch = open_current_comic_at_launch; 
          data.open_next_comic = open_next_comic;
          data.page_fit_mode = page_fit_mode;
          data.zoom_on_tap = zoom_on_tap;
          data.toggle_paging_bar = toggle_paging_bar;
          data.use_page_turn_drag = use_page_turn_drag;
          data.page_turn_drag_threshold = page_turn_drag_threshold;
          data.use_page_change_area = use_page_change_area;
          data.page_change_area_width = page_change_area_width;
          data.cache_size = cache_size; 
          data.max_dimension_long = max_dimension_long;
          data.max_dimension_short = max_dimension_short;
          
          data.nancy_request_tracing = nancy_request_tracing;
          data.nancy_diagnostics_password = nancy_diagnostics_password;
          
          data.webserver_port = webserver_port;
          data.webserver_externalip = webserver_externalip;
          
          return data;
        }
        
        
        public void Load()
        {
          XmlSerializer deserializer = new XmlSerializer(typeof(BCRSettings));
          TextReader textReader = new StreamReader(filepath);
          
          try
          {
            BCRSettings settings = (BCRSettings)deserializer.Deserialize(textReader);
            UpdateFrom(settings);
          }
          catch//(Exception e)
          {
            // ignore, use default values.
          }
          
          textReader.Close();
        }
        
        public void Save()
        {
          XmlSerializer serializer = new XmlSerializer(typeof(BCRSettings));
          StreamWriter writer = new StreamWriter(filepath);
          serializer.Serialize(writer.BaseStream, GetData());
          writer.Close();
        }
       
        public static bool GetImageInfoFromCache(string filename, ref int width, ref int height)
        {
          /*
          StreamReader streamReader = new StreamReader(cache_folder + filename);
          
          string text = streamReader.ReadToEnd();
          streamReader.Close();
          
          
          var reader = new StreamReader(File.OpenRead(@"C:\test.csv"));
          List<string> listA = new List<string>();
          List<string> listB = new List<string>();
          while (!reader.EndOfStream)
          {
              var line = reader.ReadLine();
              var values = line.Split(';');
  
              listA.Add(values[0]);
              listB.Add(values[1]);
          }

          */
          return false;
        }
        
        public MemoryStream LoadFromCache(string filename, bool thumbnail)
        {
          if (cache_size <= 0)
            return null;
          
          try 
          {
            byte[] content = File.ReadAllBytes((thumbnail ? thumbnail_folder : cache_folder) + filename);
            MemoryStream stream = new MemoryStream(content);
            return stream;
          }
          catch
          {
            return null;
          }
        }
        
        public void SaveToCache(string filename, MemoryStream image, bool thumbnail)
        {
          if (cache_size <= 0)
            return;
          
          try 
          {
            CheckCache();
            
            FileStream file = new FileStream((thumbnail ? thumbnail_folder : cache_folder) + filename, FileMode.Create, FileAccess.Write);
            image.WriteTo(file);
            file.Close();
            file.Dispose();
          }
          catch//(Exception e)
          {
            // ignore....
          }
        }
        
        public void ClearCache()
        {
        
        }
        
        private static int CompareFileDate(FileInfo x, FileInfo y)
        {
          if (x.CreationTimeUtc == y.CreationTimeUtc)
            return 0;
          return (x.CreationTimeUtc < y.CreationTimeUtc) ? -1 : 1;
        }
          
          
        public void CheckCache()
        {
          // If cache is larger than allowed, delete oldest files first
          DirectoryInfo d = new DirectoryInfo(cache_folder);
          
          long Size = 0;    
          // Add file sizes.
          FileInfo[] fis = d.GetFiles();
          
          //fis[0].CreationTimeUtc;
          
          foreach (FileInfo fi in fis) 
          {      
            Size += fi.Length;
          }
          
          long maxsize = (long)cache_size * 1024*1024;
          if (Size > maxsize)
          {
            Array.Sort(fis, CompareFileDate);
            foreach (FileInfo fi in fis) 
            {      
              File.Delete(fi.FullName);
              Size -= fi.Length;
              
              if (Size < maxsize)
                break;
            } 
          }
        }
    }
}
