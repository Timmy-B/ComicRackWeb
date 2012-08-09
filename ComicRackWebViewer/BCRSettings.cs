using System.Collections.Generic;
using System.IO;
using System.IO.IsolatedStorage;
using System;
using System.Xml.Serialization;

using System.Drawing;

namespace ComicRackWebViewer
{
    public class BCRSettings
    {
        private const string DIRECTORY = "ComicRack BCR";
        private const string SETTINGS_FILE = "settings.xml";
        
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
        

        private static string folder;
        private static string cache_folder;
        private static string thumbnail_folder;
        private static string filepath;
        private static bool initialized = false;
        
        private static int max_size = 3072; // max ipad image size is 4096x3072 ?

        public BCRSettings()
        { 
          Init();
          
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
        }

        private static void Init()
        {
          if (!initialized)
          {
            initialized = true;
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
            
            if (!File.Exists(filepath))
            {
              BCRSettings settings = new BCRSettings();
              settings.Save();
            }
          }
        }
        
        public static BCRSettings Load()
        {
          Init();
          
          XmlSerializer deserializer = new XmlSerializer(typeof(BCRSettings));
          TextReader textReader = new StreamReader(filepath);
          
          BCRSettings settings = (BCRSettings)deserializer.Deserialize(textReader);
          textReader.Close();
          return settings;
        }
        
        public void Save()
        {
          XmlSerializer serializer = new XmlSerializer(this.GetType());
          StreamWriter writer = new StreamWriter(filepath);
          serializer.Serialize(writer.BaseStream, this);
          writer.Close();
        }
       
        public MemoryStream LoadFromCache(string filename, bool thumbnail)
        {
          byte[] content = File.ReadAllBytes((thumbnail ? thumbnail_folder : cache_folder) + filename);
          MemoryStream stream = new MemoryStream(content);
          return stream;
        }
        
        public void SaveToCache(string filename, MemoryStream image, bool thumbnail)
        {
          try 
          {
            CheckCache();
            
            FileStream file = new FileStream((thumbnail ? thumbnail_folder : cache_folder) + filename, FileMode.Create, FileAccess.Write);
            image.WriteTo(file);
            file.Close();
            file.Dispose();
          }
          catch(Exception e)
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
