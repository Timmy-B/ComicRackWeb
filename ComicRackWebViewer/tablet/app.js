/*
  This file is part of Badaap Comic Reader.
  
  Copyright (c) 2012 Jeroen Walter
  
  Badaap Comic Reader is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Badaap Comic Reader is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Badaap Comic Reader.  If not, see <http://www.gnu.org/licenses/>.
*/  

// For desktop: enable caching mechanism disabled so we can debug js files....
// For tablet: disable caching so the tablet always gets refreshed files.
var disableCache = Ext.os.deviceType == 'Tablet';

Ext.Loader.setConfig({
  disableCaching: disableCache, 
  paths   : {
    'Ext': 'touch/src',
    'Comic': './app',
    'Ext.ux': './lib/ux'
  } 
});

// Simple remote logging without AJAX.
function RemoteLog(severity, message) 
{
  console.log("RemoteLog["+severity+"] "+message);
  /* Disabled, as server-side logging is not yet implemented.....
  var img = new Image();
  img.src = "/BCR/Log?sev=" + encodeURIComponent(severity) + "&msg=" + encodeURIComponent(message)+"&_dc="+encodeURIComponent(Date.now());
  */
}

RemoteLog(1, "BCR initializing....");


if (!Ext.browser.is.WebKit) 
{
  alert("The current browser is unsupported.\n\nSupported browsers:\n" +
        "Google Chrome\n" +
        "Apple Safari\n" +
        "Mobile Safari (iOS)\n" +
        "Android Browser\n" +
        "BlackBerry Browser"
    );
}

/*
  This creates the application.
  The application object is a global variable named 'Comic'.
  
*/
Ext.application({
    name: 'Comic',
    
    icon: {
        '57': 'resources/icons/bcr_icon_57.png',
        '72': 'resources/icons/bcr_icon_72.png',
        '114': 'resources/icons/bcr_icon_114.png',
        '144': 'resources/icons/bcr_icon_144.png'
    },
        
    isIconPrecomposed: true,

    startupImage: {
        '320x460': 'resources/startup/320x460.jpg',
        '640x920': 'resources/startup/640x920.jpg',
        '768x1004': 'resources/startup/768x1004.jpg',
        '748x1024': 'resources/startup/748x1024.jpg',
        '1536x2008': 'resources/startup/1536x2008.jpg',
        '1496x2048': 'resources/startup/1496x2048.jpg'
    },
    
    /*
    viewport: {
      autoMaximize: true
    },
    */
    //profiles: ['Phone', 'Tablet'],
    
    views: ['Main', 'Login'],
    controllers: [
      'Login',
      'TreeList',
      'ComicList',
      'Comic',
      'ComicInfo',
      'ComicSettings',
      'Series',
      'Search'
    ],
        
    requires: [
      'Comic.Scrollerfix',
      'Ext.MessageBox',
      'Comic.RemoteApi'
    ],

    stores: ['List', 'TreeList', 'Series'],
    
    launch: function()
    {
      Ext.getBody().removeCls('splash');
            
      Ext.fly('splashtitle').destroy();
      Ext.fly('appLoadingIndicator').destroy();
      
      // Check to see if the user was already logged in, i.e. if the browser has a token that 
      // is still valid on the server.
      Comic.RemoteApi.ValidateAuthentication(function(success) {
        if (success)
        {
          Ext.Viewport.add(Ext.create('Comic.view.Main'));
        }
        else
        {
          Ext.Viewport.add(Ext.create('Comic.view.Login'));
        }
      });
    },
    
    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
/*
function hideAddressBar() {
    setTimeout(function() {
        window.scrollTo(0, 1);
    }, 1000); // The delay can be tweaked a bit, but is necessary.
}

window.onresize = function() {
     if (document.activeElement.tagName.toLowerCase() == 'body') {
        // Do this check to prevent scrolling when typing in a textfield
        hideAddressBar();
    }
};
*/