
using System;
using System.Collections.Generic;
using System.Data.SQLite;

namespace BCR
{

  public class GlobalSettings
  {
    public bool nancy_request_tracing { get; set; }
    public string nancy_diagnostics_password { get; set; }
    public int webserver_port { get; set; }
    public bool webserver_allow_external { get; set; }
            
    private Dictionary<string, string> mSettings = new Dictionary<string, string>();
    // TODO: maximum image size should be per requesting target device instead of using one global setting.

      
    public GlobalSettings()
    {
      nancy_request_tracing = true;
      nancy_diagnostics_password = "diagnostics";
      
      webserver_port = 8080;
      webserver_allow_external = true;
    }
    
    /// <summary>
    /// Read global settings.   
    /// </summary>
    public void Initialize()
    {
      mSettings.Clear();

      using (SQLiteDataReader reader = Database.Instance.ExecuteReader("SELECT key, value FROM settings;"))
      {
        while (reader.Read())
        {
          mSettings.Add(reader["key"].ToString(), reader["value"].ToString());
        }
      }
      
      webserver_port = GetInt32("webserver_port", 8080);
      nancy_request_tracing = GetBoolean("nancy_request_tracing", true);
      nancy_diagnostics_password = GetString("nancy_diagnostics_password", "diagnostics");
      webserver_allow_external = GetBoolean("webserver_allow_external", true);
    }
    
    public void Save()
    {
      // Save to SQLite
      Set("webserver_port", webserver_port.ToString());
      Set("nancy_request_tracing", nancy_request_tracing.ToString());
      Set("nancy_diagnostics_password", nancy_diagnostics_password.ToString());
      Set("webserver_allow_external", webserver_allow_external.ToString());
    }
    
    
    public string GetString(string key, string defaultValue)
    {
      string value;
      if (mSettings.TryGetValue(key, out value))
        return value;
      
      Set(key, defaultValue);
      return defaultValue;
    }
    
    public int GetInt32(string key, int defaultValue)
    {
      string s;
      if (mSettings.TryGetValue(key, out s))
      {
        return Convert.ToInt32(s);
      }
      
      Set(key, defaultValue.ToString());
      return defaultValue;
    }
    
    public bool GetBoolean(string key, bool defaultValue)
    {
      string s;
      if (mSettings.TryGetValue(key, out s))
      {
        return Convert.ToBoolean(s);
      }
      
      Set(key, defaultValue.ToString());
      return defaultValue;
    }
    
    public void Set(string key, string value)
    {
      string test;
      if (mSettings.TryGetValue(key, out test))
      {
        Database.Instance.ExecuteNonQuery("UPDATE settings SET value='" + value + "' WHERE key='"+key+"';");
      }
      else
      {
        Database.Instance.ExecuteNonQuery("INSERT INTO settings (key,value) VALUES ('"+key+"','"+value+"');");
      }
      
      mSettings[key] = value;
    }
    
    
  }

     
    
}
