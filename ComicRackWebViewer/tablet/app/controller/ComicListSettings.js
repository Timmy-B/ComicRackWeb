/*
  This file is part of Badaap Comic Reader.
  
  Copyright (c) 2014 Jeroen Walter
  
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
Ext.define('Comic.controller.ComicListSettings', {
    extend: 'Ext.app.Controller',
    
    requires: [ 
      
      'Comic.view.ComicList', 
      'Comic.view.ComicListSettings',
      'Comic.view.TreeList'
    ],

    config: {
        refs: {
          comiclistview: 'comiclistview',
          comiclistsettingsview: 'comiclistsettingsview'
        },
        
        control: {
          comiclistsettingsview: {
            show: 'onShow',
            hide: 'onHide'
          }
        }
    },

    launch: function()
    {
      // called before application.launch()
    },
    
    init: function()
    {
      var me = this;
      
      
      // called before application.launch()
      
      
    },
      
      
    onShow: function() {
      var me = this,
          comiclistsettingsview = me.getComiclistsettingsview();
             
      comiclistsettingsview.setValues({
        orderby_1: Comic.ordersettings.get('orderby_1'),
        direction_1: Comic.ordersettings.get('direction_1'),
        orderby_2: Comic.ordersettings.get('orderby_2'),
        direction_2: Comic.ordersettings.get('direction_2'),
        layout: Comic.ordersettings.get('layout'),
        theme: Comic.ordersettings.get('theme')
      });
    },
    
    onHide: function() {
      var me = this,
          values = me.getComiclistsettingsview().getValues();
        
      Comic.ordersettings.set('orderby_1', values.orderby_1);
      Comic.ordersettings.set('direction_1', values.direction_1);
      Comic.ordersettings.set('orderby_2', values.orderby_2);
      Comic.ordersettings.set('direction_2', values.direction_2);
      Comic.ordersettings.set('layout', values.layout);
      Comic.ordersettings.set('theme', values.theme);

      if (Comic.ordersettings.get('orderby_2') == Comic.ordersettings.get('orderby_1'))
        Comic.ordersettings.set('orderby_2', Comic.Enums.OrderBy.NONE);

      Comic.ordersettings.save();

      var comiclistcontroller = me.getApplication().getController('ComicList');
      comiclistcontroller.onSettingsChanged();

      var treelistcontroller = me.getApplication().getController('TreeList');
      treelistcontroller.onSettingsChanged();
    }
});