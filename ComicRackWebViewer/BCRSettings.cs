using System.Collections.Generic;
using System.IO;
using System.IO.IsolatedStorage;
using System;
using System.Xml.Serialization;

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
        }


        public static string GetFilePath()
        {
          string folder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), DIRECTORY);
          if (!Directory.Exists(folder))
          {
        	  Directory.CreateDirectory(folder);
          }

          string filepath = folder + "\\" + SETTINGS_FILE;
          return filepath;
        }
        
        public static BCRSettings Load()
        {
          string filepath = GetFilePath();
          if (!File.Exists(filepath))
          {
            BCRSettings settings = new BCRSettings();
            settings.Save();
            return settings;
          }
          else
          {
            XmlSerializer deserializer = new XmlSerializer(typeof(BCRSettings));
            TextReader textReader = new StreamReader(filepath);
            
            BCRSettings settings = (BCRSettings)deserializer.Deserialize(textReader);
            textReader.Close();
            return settings;
          }
        }
        
        public void Save()
        {
          string filepath = GetFilePath();
          
          XmlSerializer serializer = new XmlSerializer(this.GetType());
          StreamWriter writer = new StreamWriter(filepath);
          serializer.Serialize(writer.BaseStream, this);
          writer.Close();
        }
       
     
    }
}
