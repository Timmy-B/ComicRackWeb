using System;
using System.Windows;
using cYo.Projects.ComicRack.Plugins.Automation;
using FreeImageAPI;

namespace ComicRackWebViewer
{
    public static class Plugin
    {
        internal static IApplication Application;
        private static WebServicePanel panel;
        private static Version requiredVersion = new Version(0, 9, 156);
        
        static void FreeImage_Message(FREE_IMAGE_FORMAT fif, string message)
    		{
          string m = message;
    			
    		}
            
        public static bool Initialize(IApplication app)
        {
          try
          {
            Application = app;
            var comicVersion = new Version(app.ProductVersion);
            if (comicVersion < requiredVersion)
            {
              MessageBox.Show("Version check failed!\n\nThe ComicRack Web Viewer Plugin requires an updated version of ComicRack\nComicRack version required: " + requiredVersion + "\n\nThe Web Viewer is now disabled.", "ComicRack Web Viewer Plugin", MessageBoxButton.OK, MessageBoxImage.Error);
              return false;
            }
            
            BCRInstaller.Instance.Install();
            
            if (!FreeImage.IsAvailable())
            {
              MessageBox.Show("FreeImage.dll seems to be missing. Aborting.", "ComicRack Web Viewer Plugin", MessageBoxButton.OK, MessageBoxImage.Error);
              return false;
            }

            FreeImageEngine.Message += new OutputMessageFunction(FreeImage_Message);
            
            return true;
          }
          catch (Exception e)
          {
            MessageBox.Show(e.ToString());
          }
          
          return false;
        }
        
        public static void Run(IApplication app)
        {
          if (Initialize(app))
          {
            try
            {
              /*
                var comicVersion = new Version(app.ProductVersion);
                if (comicVersion < requiredVersion)
                {
                  MessageBox.Show("Version check failed!\n\nThe ComicRack Web Viewer Plugin requires an updated version of ComicRack\nComicRack version required: " + requiredVersion + "\n\nThe Web Viewer is now disabled.", "ComicRack Web Viewer Plugin", MessageBoxButton.OK, MessageBoxImage.Error);
                  return;
                }
              */
                if (panel == null)
                {
                    panel = new WebServicePanel();
                    panel.Closed += new EventHandler(panel_Closed);
                }
                
                panel.ShowDialog();
            }
            catch (Exception e)
            {
                MessageBox.Show(e.ToString());
            }
          }
        }

        public static void RunAtStartup(IApplication app)
        {
          if (Initialize(app))
          {
            try
            {
              /*
                var comicVersion = new Version(app.ProductVersion);
                if (comicVersion < requiredVersion)
                {
                  return;
                }
              */
                
                if (panel == null)
                {
                    panel = new WebServicePanel();
                    panel.Closed += new EventHandler(panel_Closed);
                }
                panel.StartService();
            }
            catch (Exception e)
            {
                MessageBox.Show(e.ToString());
            }
          }
        }

        static void panel_Closed(object sender, EventArgs e)
        {
            panel = null;
        }

        [STAThread]
        public static void Main()
        {
            if (panel == null)
            {
                panel = new WebServicePanel();
                panel.Closed += new EventHandler(panel_Closed);
            }
            panel.ShowDialog();
        }

    }
}
