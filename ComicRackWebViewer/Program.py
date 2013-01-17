import clr

clr.AddReferenceByPartialName("IronPython")
clr.AddReferenceByPartialName("Microsoft.Scripting")
clr.AddReferenceByPartialName("ComicRackWebViewer")

clr.AddReference('System')
from System import Version

clr.AddReference("System.Windows.Forms")
from System.Windows.Forms import MessageBox, MessageBoxButtons, MessageBoxIcon

from ComicRackWebViewer import Plugin

#@Name	ComicRack Web
#@Key	ComicRackWebViewer
#@Hook	Books, Editor
#@Image nancy.jpg
#@Description ComicRack Web
def ComicRackWebViewer(books):
 
  if IsVersionOK():
    Plugin.Run(ComicRack.App)
  
           
#@Name ComicRack Web (Startup)
#@Hook Startup
#@Enabled false
#@Image nancy.jpg
#@Description ComicRack Web (Startup)
def ComicRackWebViewerStartup():
  if IsVersionOK():
    Plugin.RunAtStartup(ComicRack.App)
   
      
def IsVersionOK():
  requiredVersion = Version(0, 9, 159)
  if str(ComicRack.App.ProductVersion) != str(requiredVersion):
    MessageBox.Show( ComicRack.MainWindow, "Version check failed!\n\nThe ComicRack Web Viewer Plugin requires an updated version of ComicRack.\nComicRack version required: " + str(requiredVersion) + ".\nExiting...", "Incompatible ComicRack version", MessageBoxButtons.OK, MessageBoxIcon.Warning)
  
  return str(ComicRack.App.ProductVersion) == str(requiredVersion)
    