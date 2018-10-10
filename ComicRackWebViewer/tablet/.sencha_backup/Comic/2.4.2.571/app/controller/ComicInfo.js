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

Ext.define('Comic.controller.ComicInfo', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
          mainview: 'mainview',
          comicinfoview: 'comicinfoview',
          backbutton: 'comicinfoview #backbutton',
          titlebar: 'comicinfoview titlebar',
          
          maintabpanel: 'mainview maintabpanel',
          comicinfofieldset: 'comicinfoview #comicinfofieldset',
          coverimage: 'comicinfoview #coverimage'
        },
        
        control: {
        
          comicinfoview: {
            activate: 'onActivate'
          },
          
          backbutton: {
            tap: 'onBackButton'
          }
        }
    },
    
    init : function()
    {
      // called before application.launch()
      var me = this;
      
    },
    
    
    onActivate: function()
    {
      var me = this,
          titlebar = me.getTitlebar(),
          comicinfoview = me.getComicinfoview(),
          comicinfofieldset = me.getComicinfofieldset(),
          coverimage = me.getCoverimage();
      
      // Retrieve Comic from server.
      Comic.RemoteApi.GetComicInfo(comicinfoview.comic.Id, function(success, result) {
          if (!success)
          {
            console.log('GetComicInfo() failed for comic id ' + comicinfoview.comic.id);
            return;
          }
          
          var values = result.getData(),
              s = "";
          //values.Filename = comicinfoview.comic.filename;
          
          s += '<span class="series">' + values.ShadowSeries + ' V' + values.ShadowVolume + ' #' + values.ShadowNumber + '</span><br/>';
          if (values.ShadowTitle)
          {
            s += '<span class="title">'+values.ShadowTitle+'</span></br/>';
          }
            
          s += 'Published: ' + values.ShadowYear + '/' + values.Month + '<br/>' + values.PageCount + ' pages</br/>';
          
          comicinfofieldset.setTitle('<div class="comicinfo-header"><img src="' + BcrBaseUrl + '/BCR/Comics/'+values.Id+'/Pages/0?height=128" height="128"/><span>' + s + "</span>");
                    
          /*
          comicinfofieldset.removeAll();
          Ext.each(values, function(name, index, values) {
              comicinfofieldset.add({ xtype: 'textfield', name: name, label: name, readOnly: true, value: values[name] });
          });
          */
          
          
          comicinfoview.setValues(values);
        });
      
    },
    
    onBackButton: function() 
    {
      this.getMainview().pop(1);
    }   
   


});