/*
  Copyright 2013 Jeroen Walter
*/  

// Cookie entries

function createCookie(name, value, days) 
{
    var expires = "",
        date;
        
    if (days) 
    {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } 
    
    document.cookie = name + "=" + value + expires + "; path=/";
    console.log(document.cookie);
}

function readCookie(name) 
{
    var cookieValue = null,
        nameEQ = name + "=",
        ca = document.cookie.split(';'),
        i, c, found;
        
    for (i = 0; i < ca.length; i++) 
    {
        c = ca[i];
        while (c.charAt(0) == ' ') 
        {
          c = c.substring(1, c.length);
        }
        
        if (c.indexOf(nameEQ) == 0) 
        {
            found = c.substring(nameEQ.length, c.length);
            cookieValue = found;
        }
    }
    return cookieValue;
}

function eraseCookie(name) 
{
    createCookie(name, "", -1);
}

           
var ApiToken = {
    authUrl : "/auth",
    apiKeyKey : "BCR_apiKey",
    usernameKey : "BCR_username",

    Set: function (username, apiKey, rememberMe) {
        var me = this,
            days = rememberMe ? 10 : 0;
            
        createCookie(me.apiKeyKey, apiKey, days);
        createCookie(me.usernameKey, username, days);
        
        //localStorage.setItem(me.apiKeyKey, apiKey);
        //localStorage.setItem(me.usernameKey, username);
    },

    Get: function () {
        var me = this;
        //localStorage.getItem(me.apiKeyKey);
        //localStorage.getItem(me.usernameKey);
        
        var key = readCookie(me.apiKeyKey);
        var username = readCookie(me.usernameKey);
        var token = { Key: key, Username: username, IsValid: key != null };        
        return token;
    },

    Delete: function () {
        var me = this;
        eraseCookie(me.apiKeyKey);
        eraseCookie(me.usernameKey);
        
        //localStorage.removeItem(me.apiKeyKey);
        //localStorage.removeItem(me.usernameKey);
    }
    
    
};
     
////////////////////////////////////////////////////////////////////

Ext.define('Comic.RemoteApi', {
  extend: 'Ext.Base',
  singleton: true,
  requires: [ 'Comic.model.ComicInfo', 'Comic.store.Comic' ],
  config: {
  },
  
  
  constructor: function(config) {
    this.initConfig(config);
        
    this.searchfields = { 
      1: [ 'Caption', /*'ShadowSeries',*/ 'Summary', /*'ShadowTitle',*/ 'Writer', 'Penciller', 'Inker', 'Colorist', 'Letterer', 'CoverArtist', 'FilePath' ], 
      2: [ 'Caption' ],
      3: [ 'ShadowSeries' ], 
      4: [ 'ShadowTitle' ], 
      5: [ 'Writer' ], 
      6: [ 'Writer', 'Penciller', 'Inker', 'Colorist', 'Letterer', 'CoverArtist' ], 
      7: [ 'Summary', 'Notes', 'Tags' ],
      8: [ 'FilePath' ]
    };
  },
  
  
  // ValidateAuthentication checks if the user can access the /BCR resource using the current apikey in the cookie.
  // If it can't, the server will return a 401 Unauthorized status.
  // If it can, the user's settings are retrieved, completing the validation as if the user just logged in.
  // callback must be a function(bool success).
  ValidateAuthentication: function(callback) {
    var me = this;
    Ext.Ajax.request({
      url: '/BCR',
      method: 'GET',
      params: {},
      success: function(response) {
          console.log('ApiToken Validate OK');
          console.log('Retrieving settings...');
    
          me.GetSettings(function(success, settings) {
            if (!success)
            {
              console.log('Error while retrieving settings !');
              return;
            }
            
            console.log('Settings retrieved.');
            
            Comic.settings = settings;
            
            callback(true);
          });
      },
      failure: function(response) {
          console.log('ApiToken Validate Failed');
          callback(false);
      }
    });
  },

  
  Login: function(_username, _password, _rememberMe, callback) 
  {
      var me = this,
          request = {
            username: _username,
            password: _password,
            rememberMe: _rememberMe
          };
    
      Ext.Ajax.request({
        url: ApiToken.authUrl,
        method: 'POST',
        params: request,
        success: function(response) {
            var result = Ext.JSON.decode(response.responseText);
            ApiToken.Set(request.username, result.ApiKey, request.rememberMe);
            
            console.log('Retrieving settings...');
      
            me.GetSettings(function(success, settings) {
              if (!success)
              {
                console.log('Error while retrieving settings !');
                return;
              }
              
              console.log('Settings retrieved.');
              
              Comic.settings = settings;
              
              callback(true);
            });
            
            
        },
        failure: function(response) {
            console.log('Ext.Ajax.request error');
            // process server response here
            callback(false);
        }
      });
  },

  Logout: function(callback)
  {
      var apiToken = ApiToken.Get();
      if (apiToken.IsValid) 
      {
        var request = { apiKey: apiToken.Key };
        
        Ext.Ajax.request({
          url: ApiToken.authUrl,
          method: 'DELETE',
          params: request,
          success: function(response) {
              console.log('Logout: OK');
              ApiToken.Delete();
              callback(true);
          },
          failure: function(response) {
              console.log('Logout: Ext.Ajax.request error');
              ApiToken.Delete();
              callback(false);
          }
        });
      }
      else
      {
        // not logged in 
        console.log('Logout: not logged in....');
        ApiToken.Delete();
        callback(true);
      }
  },

  // This will get the C# Comic object, not the ComicBook object....
  GetComicInfo: function(comic_id, callback)
  {
    Comic.model.ComicInfo.load(comic_id, {
      scope: this,
      failure: function(record, operation) {
        console.error('Comic.RemoteApi.GetComicInfo failed for comic ' + comic_id);
        callback(false);
      },
      success: function(record, operation) {
        callback(true, record);
      },
      callback: function(record, operation) {
          //do something whether the load succeeded or failed
      }
    });
    
    
  },
  
  // This will set the C# ComicBook object directly, not the Comic object.... 
  /*
  SetComicInfo: function(comic_id, comic_info, callback)
  {
    Ext.Ajax.request({
      url: '/BCR/Comics/' + comic_id,
      method: 'PUT',
      params: comic_info,
      success: function(response){
      },
      callback: callback
    });
  },
  */
  
  
  // Update the progress state of the comic for the current user.
  UpdateProgress: function(comic_id, current_page, callback)
  {
    Ext.Ajax.request({
      url: '/BCR/Comics/' + comic_id + '/Progress',
      method: 'PUT',
      params: { CurrentPage : current_page },
      success: function(response){
      },
      callback: callback
    });
  },
  
  
  GetImageUrl: function(comic_id, page_nr, width, height)
  {
    //width = 1024;
    var url = '/BCR/Comics/' + comic_id + '/Pages/' + page_nr;
    if (width)
    {
      url = Ext.String.urlAppend(url, 'width='+width);
    }
    
    if (height)
    {
      url = Ext.String.urlAppend(url, 'height='+height);
    }
    
    //max_dimension = 4096; // * 3072
    //url = Ext.String.urlAppend(url, 'maxWidth=4096');
    
    return url;
  },
  
   
  CreateStoreParams_ListComics: function(list_id)
  {
    return { url: '/BCR/Lists/' + list_id + '/Comics' };
  },
  
  CreateStoreParams_SearchComics: function(values)
  {
    var fields = Comic.RemoteApi.searchfields[values.type];
    var filter = "";
    var value = values.value.toLowerCase();
    var terms = value.split(" ");
    // Linq2Rest has no concat() support (yet), so use multiple substringof() instead of concatenating all field values and doing one substringof.
    // Don't know if that would be faster though....
    var combined_filter = "";
    
    for (term in terms)
    {
      if (combined_filter.length == 0)
        combined_filter = "(";
      else
        combined_filter += " and (";
      
      filter = '';
      
      for (field in fields)
      {
        if (filter.length != 0)
          filter += " or ";
        filter += "substringof('" + terms[term] +"', tolower("+fields[field]+")) eq true";
      }
      
      if (filter.length != 0)
        combined_filter += filter;
        
      combined_filter += ")";
    }
    
    return { url: '/BCR/Comics', filter: combined_filter };
  },
  
  CreateStoreParams_SerieComics: function(series_id)
  {
    return { url: '/BCR/Series/' + series_id };
  },
  
  
  GetSettings: function(callback)
  {
    Ext.Ajax.request({
      url: '/BCR/Settings',
      method: 'GET',
      success: function(response){

          result = Ext.JSON.decode(response.responseText);
          
          callback(true, result);
      },
      failure: function(response){
          console.log('Ext.Ajax.request error');
          // process server response here
          callback(false);
      }
    });
  },
  
  SetSettings: function(settings, callback)
  {
    Ext.Ajax.request({
      url: '/BCR/Settings',
      method: 'PUT',
      params: settings,
      success: function(response){
          
          callback(true);
      },
      failure: function(response){
          console.log('Ext.Ajax.request error');
          // process server response here
          callback(false);
      }
    });
  }
  
});


