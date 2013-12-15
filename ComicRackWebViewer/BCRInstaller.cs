using FreeImageAPI;
using ICSharpCode.SharpZipLib.Zip;
using System;
using System.Data.SQLite;
using System.Diagnostics;
using System.IO;
using System.Windows;

namespace ComicRackWebViewer
{
  /// <summary>
  /// Description of BCRInstaller.
  /// </summary>
  public sealed class BCRInstaller
  {
    private const string INSTALLER_FILE = "BCRPlugin.zip";
    private const string VERSION_FILE = "BCRVersion.txt";
    private const string VERSION = "1.27";
    
    public string installFolder = "";
    
    private static BCRInstaller instance = new BCRInstaller();
    
    public static BCRInstaller Instance {
      get {
        return instance;
      }
    }
    
    private BCRInstaller()
    {
    }
    
    public bool Install()
    {
      string path = typeof(BCRInstaller).Assembly.Location;
      string dir = path.Substring(0, path.Length - Path.GetFileName(path).Length);
      installFolder = dir;

      ///////////////////////////////////////////////////////////
      //
      /*
      if (!InstallState.IsVC90RedistSP1Installed())
      {
        if (MessageBoxResult.Yes != MessageBox.Show("The required component 'Microsoft Visual C++ 2008 SP1 Redistributable Package' seems to be missing.\nDownload and install the correct version (32/64bit) from the Microsoft website, then restart ComicRack.\n\nDo you want to continue anyway (expect a crash...)?", "Badaap Comic Reader Plugin", MessageBoxButton.YesNo, MessageBoxImage.Error))
        {
          return false;
        }
      }
      */
      
      ///////////////////////////////////////////////////////////
      // Install the correct FreeImage.dll
      if (!FreeImage.IsAvailable())
      {
        System.IO.File.Copy(dir + (Environment.Is64BitProcess ? "FreeImage.64bit.dll" : "FreeImage.32bit.dll"), dir + "FreeImage.dll", true);
      }
     
      if (!FreeImage.IsAvailable())
      {
        MessageBox.Show("FreeImage.dll seems to be missing. Aborting.", "Badaap Comic Reader Plugin", MessageBoxButton.OK, MessageBoxImage.Error);
        return false;
      }
      
      ///////////////////////////////////////////////////////////
      // Install the correct SQLite.Interop.dll
      try 
      {
        var connection = new SQLiteConnection();
        //connection.Open();
      }
      catch (Exception e)
      {
        Trace.WriteLine(String.Format("Exception: {0}", e));
        System.IO.File.Copy(dir + (Environment.Is64BitProcess ? "SQLite.Interop.64bit.dll" : "SQLite.Interop.32bit.dll"), dir + "SQLite.Interop.dll", true);
      }
      
      try 
      {
        var connection = new SQLiteConnection();
        //connection.Open();
      }
      catch (System.DllNotFoundException e)
      {
        Trace.WriteLine(String.Format("Exception: {0}", e));
        MessageBox.Show("SQLite.Interop.dll seems to be missing. Aborting.", "Badaap Comic Reader Plugin", MessageBoxButton.OK, MessageBoxImage.Error);
        return false;
      }
      
      ///////////////////////////////////////////////////////////
      // Check version.txt in order to decide if this is an upgrade.
      if (File.Exists(dir + VERSION_FILE))
      {
        StreamReader streamReader = new StreamReader(dir + VERSION_FILE);
        string text = streamReader.ReadToEnd();
        streamReader.Close();
        
        if (text.StartsWith(VERSION))
        {
          return true;
        }
      }
      
      // Create/Update the version file.
      System.IO.File.WriteAllText(dir + VERSION_FILE, VERSION);
      if (!Unzip(dir + INSTALLER_FILE, dir))
      {
        MessageBox.Show("Error while installing the web viewer site. Aborting.", "Badaap Comic Reader Plugin", MessageBoxButton.OK, MessageBoxImage.Error);
        return false;
      }
        
      
      return true;      
    }
    
    public bool Unzip(string ZipFile, string DestinationFolder)
    {
  		if ( !File.Exists(ZipFile) ) 
  		{
  			Console.WriteLine("Cannot find file '{0}'", ZipFile);
  			return false;
  		}
  
  		using (ZipInputStream s = new ZipInputStream(File.OpenRead(ZipFile))) 
  		{
  			ZipEntry theEntry;
  			while ((theEntry = s.GetNextEntry()) != null) 
  			{
  				//Console.WriteLine(theEntry.Name);
  				
  				string directoryName = Path.GetDirectoryName(theEntry.Name);
  				string fileName      = Path.GetFileName(theEntry.Name);
  				
  				// create directory
  				if ( directoryName.Length > 0 ) 
  				{
  					Directory.CreateDirectory(DestinationFolder + directoryName);
  				}
  				
  				if (fileName != String.Empty) 
  				{
  					using (FileStream streamWriter = File.Create(DestinationFolder + theEntry.Name)) 
  					{
  						int size = 2048;
  						byte[] data = new byte[2048];
  						while (true) 
  						{
  							size = s.Read(data, 0, data.Length);
  							if (size > 0) 
  							{
  								streamWriter.Write(data, 0, size);
  							} 
  							else
  							{
  								break;
  							}
  						}
  					}
  				}
  			}
  		}
  		return true;
  	}
    
  }
}
