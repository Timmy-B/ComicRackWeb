/*
 * Created by SharpDevelop.
 * User: jeroen
 * Date: 3/19/2013
 * Time: 8:08 PM
 * 
 * To change this template use Tools | Options | Coding | Edit Standard Headers.
 */

using System;
using System.Data.SQLite;


namespace BCR
{
    public class UserSettings
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


        public UserSettings()
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
        
        public bool Validate()
        {
          return true;
        }
        
        public void Save(BCRUser user)
        {
          // TODO: only overwrite settings that were specified.
          
          string s = String.Format("UPDATE user_settings SET open_current_comic_at_launch={0}, open_next_comic={1}, page_fit_mode={2}," +
                "zoom_on_tap={3}, toggle_paging_bar={4}, use_page_turn_drag={5}, page_turn_drag_threshold={6}, use_page_change_area={7}," +
                "page_change_area_width={8} WHERE user_id={9};", open_current_comic_at_launch?1:0, open_next_comic?1:0, page_fit_mode,
                zoom_on_tap, toggle_paging_bar, use_page_turn_drag?1:0, page_turn_drag_threshold, use_page_change_area?1:0, page_change_area_width, user.UserId);
          
          Database.Instance.ExecuteNonQuery(s);
        }
        
        public void Load(BCRUser user)
        {
          using (SQLiteDataReader reader = Database.Instance.ExecuteReader(@"SELECT open_current_comic_at_launch, open_next_comic, page_fit_mode,
                zoom_on_tap, toggle_paging_bar, use_page_turn_drag, page_turn_drag_threshold, use_page_change_area, page_change_area_width
                FROM user_settings WHERE user_id = " + user.UserId + " LIMIT 1;"))
          {
            if (reader.Read())
            {
              open_current_comic_at_launch = reader.GetBoolean(0);
              open_next_comic = reader.GetBoolean(1);
              page_fit_mode = reader.GetInt32(2);
              zoom_on_tap = reader.GetInt32(3);
              toggle_paging_bar = reader.GetInt32(4);
              use_page_turn_drag = reader.GetBoolean(5);
              page_turn_drag_threshold = reader.GetInt32(6);
              use_page_change_area = reader.GetBoolean(7);
              page_change_area_width = reader.GetInt32(8);
            }
          }
        }
    }
}
