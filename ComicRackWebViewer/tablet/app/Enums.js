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
    authUrl: bcrBase + '/auth',
    apiKeyKey : 'BCR_apiKey',
    usernameKey : 'BCR_username',

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

Ext.define('Comic.Enums', {
  extend: 'Ext.Base',
  singleton: true,
  config: {
  },
  
  

  OrderBy: {
    NONE: 0,
    CAPTION: 1,
    SERIES: 2,
    VOLUME: 3,
    TITLE: 4,
    NUMBER: 5,
    YEAR: 6,
    FILE: 7,
    LAST_OPENED: 8,
    PUBLISH_DATE: 9
  },

  Direction: {
    ASCENDING: 0,
    DESCENDING: 1
  },

  ComicListLayout: {
    LIST_SMALL: 0,
    LIST_MEDIUM: 1,
    LIST_LARGE: 2,
    GRID_SMALL: 3,
    GRID_MEDIUM: 4,
    GRID_LARGE: 5
  }

});


