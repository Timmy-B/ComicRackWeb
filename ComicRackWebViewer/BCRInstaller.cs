/*
 * Created by SharpDevelop.
 * User: jeroen
 * Date: 8/19/2012
 * Time: 11:27 PM
 * 
 * To change this template use Tools | Options | Coding | Edit Standard Headers.
 */
using System;
using System.Text;
using System.Collections;
using System.IO;
using System.Windows;

using ICSharpCode.SharpZipLib.Zip;
using ICSharpCode.SharpZipLib.Zip.Compression.Streams;

namespace ComicRackWebViewer
{
  /// <summary>
  /// Description of BCRInstaller.
  /// </summary>
  public sealed class BCRInstaller
  {
    private const string INSTALLER_FILE = "BCRPlugin.zip";
    private const string VERSION_FILE = "BCRVersion.txt";
    private const string VERSION = "1.0";
    
    private static BCRInstaller instance = new BCRInstaller();
    
    public static BCRInstaller Instance {
      get {
        return instance;
      }
    }
    
    private BCRInstaller()
    {
    }
    
    public void Install()
    {
      string path = typeof(BCRInstaller).Assembly.Location;
      string dir = path.Substring(0, path.Length - Path.GetFileName(path).Length);
      
      // check version.txt in order to decide if this is an upgrade.
      if (File.Exists(dir + VERSION_FILE))
      {
        StreamReader streamReader = new StreamReader(dir + VERSION_FILE);
        string text = streamReader.ReadToEnd();
        streamReader.Close();
        
        if (text.StartsWith(VERSION))
        {
          return;
        }
        else
        {
          // TODO: remove previous install ?  
        }
      }
      
      Unzip(dir + INSTALLER_FILE, dir);
    }
    
    public void Unzip(string ZipFile, string DestinationFolder)
    {
  		if ( !File.Exists(ZipFile) ) 
  		{
  			Console.WriteLine("Cannot find file '{0}'", ZipFile);
  			return;
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
  	}
  }
}
