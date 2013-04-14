import clr

clr.AddReferenceByPartialName("IronPython")
clr.AddReferenceByPartialName("Microsoft.Scripting")
clr.AddReferenceByPartialName("ComicRackWebViewer")

clr.AddReference('System')
from System import Version

clr.AddReference("System.Windows.Forms")
from System.Windows.Forms import MessageBox, MessageBoxButtons, MessageBoxIcon

from ComicRackWebViewer import Plugin

#@Name	Badaap Comic Reader
#@Key	ComicRackWebViewer
#@Hook	Books, Editor
#@Image badaap_icon.png
#@Description Badaap Comic Reader
def ComicRackWebViewer(books):
 
  if IsVersionOK():
    Plugin.Run(ComicRack.App)
  
           
#@Name Badaap Comic Reader (Startup)
#@Hook Startup
#@Enabled false
#@Image badaap_icon.png
#@Description Badaap Comic Reader (Startup)
def ComicRackWebViewerStartup():
  if IsVersionOK():
    Plugin.RunAtStartup(ComicRack.App)
   
      
def IsVersionOK():
  requiredVersion = Version(0, 9, 168)
  if str(ComicRack.App.ProductVersion) != str(requiredVersion):
    MessageBox.Show( ComicRack.MainWindow, "Version check failed!\n\nThe ComicRack Web Viewer Plugin requires a different version of ComicRack.\nComicRack version required: " + str(requiredVersion) + ".\nExiting...", "Incompatible ComicRack version", MessageBoxButtons.OK, MessageBoxIcon.Warning)
  
  return str(ComicRack.App.ProductVersion) == str(requiredVersion)
    