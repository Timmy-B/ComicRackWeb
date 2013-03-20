using System;
using System.Windows;
using cYo.Projects.ComicRack.Plugins.Automation;
using FreeImageAPI;

namespace ComicRackWebViewer
{
    public static class Plugin
    {
        internal static IApplication Application;
        private static MainForm panel;
        
        
        static void FreeImage_Message(FREE_IMAGE_FORMAT fif, string message)
    		{
          string m = message;
    			
    		}
            
        public static bool Initialize(IApplication app)
        {
          try
          {
            Application = app;
            
            if (!BCRInstaller.Instance.Install())
              return false;

            FreeImageEngine.Message += new OutputMessageFunction(FreeImage_Message);
            
            BCR.Database.Instance.Initialize();
            
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
                if (panel == null)
                {
                    panel = new MainForm();
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
                if (panel == null)
                {
                    panel = new MainForm();
                    panel.Closed += new EventHandler(panel_Closed);
                }
                //panel.StartService();
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
                panel = new MainForm();
                panel.Closed += new EventHandler(panel_Closed);
            }
            panel.ShowDialog();
        }

    }
}
