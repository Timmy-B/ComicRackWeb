/*
  
*/  


Ext.define('Comic.RemoteApi', {
  extend: 'Ext.Base',
  singleton: true,
  requires: [ 'Comic.model.ComicInfo', 'Comic.store.Comic' ],
  config: {
  },
  
  
  constructor: function(config) {
    this.initConfig(config);
        
    this.searchfields = { 
      1: [ 'Caption', /*'ShadowSeries'*/, 'Summary', /*'ShadowTitle'*/, 'Writer', 'Penciller', 'Inker', 'Colorist', 'Letterer', 'CoverArtist', 'FilePath' ], 
      2: [ 'Caption' ],
      3: [ 'ShadowSeries' ], 
      4: [ 'ShadowTitle' ], 
      5: [ 'Writer' ], 
      6: [ 'Writer', 'Penciller', 'Inker', 'Colorist', 'Letterer', 'CoverArtist' ], 
      7: [ 'Summary', 'Notes', 'Tags' ],
      8: [ 'FilePath' ],
    };
  },
  
    
  // This will get the C# Comic object, not the ComicBook object....
  GetComicInfo: function(comic_id, callback)
  {
    //Comic.OData.requestGet({ entity: 'Comics', id: comic_id }, callback);
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
  SetComicInfo: function(comic_id, comic_info, callback)
  {
    Ext.Ajax.request({
      url: '/BCR/Comics/' + comic_id,
      method: 'PUT',
      params: comic_info,
      success: function(response){
      },
      callback: callback,
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
  
   
  CreateComicStoreFromList: function(list_id)
  {
    var store = Ext.create('Comic.store.Comic');
    var proxy = store.getProxy();
    proxy.setUrl();
    return { url: '/BCR/Lists/' + list_id + '/Comics' };
  },
  
  CreateComicStoreFromSearch: function(values)
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
  
  CreateComicStoreFromSeries: function(series_id)
  {
    return { url: '/BCR/Series/' + series_id };
  },
  
  SetViewState: function(params, callback)
  {
    
  },
  
  GetSettings: function(callback)
  {
    Ext.Ajax.request({
      url: '/BCR/Settings',
      method: 'GET',
      success: function(response){
          var text = response.responseText;
          // process server response here
          
          eval('result = ' + text);
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
  },

  GetComicTitle: function(comic)
  {
    return comic.Caption;
    /*
    var s = '';
    if (comic.ShadowSeries)
      s += comic.ShadowSeries + ' ' + comic.ShadowNumber;
    else
      s += comic.name;
      
    if (comic.ShadowTitle)
      s += ': ' + comic.ShadowTitle;
    
    if (comic.ShadowYear > 0)
    {
      s += ' [' + comic.ShadowYear;
      if (comic.Month)
        s += '/' + comic.Month + ']';
      else
        s += ']';
    }
      
    return s;
    */
  },
  
});


