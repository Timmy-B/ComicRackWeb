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
          
          webserver_port = 8080;
          webserver_externalip = ""; 
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
       
        public MemoryStream LoadFromCache(string filename, bool thumbnail)
        {
          if (cache_size <= 0)
            return null;
          
          byte[] content = File.ReadAllBytes((thumbnail ? thumbnail_folder : cache_folder) + filename);
          MemoryStream stream = new MemoryStream(content);
          return stream;
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
