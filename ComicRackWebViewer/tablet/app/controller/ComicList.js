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


Ext.define('Comic.controller.ComicList', {
    extend: 'Ext.app.Controller',
    requires: [
          'Comic.model.OrderSettings',
          'Comic.view.Comic',
          'Comic.view.Search',
          'Comic.view.Series',
          'Comic.view.TreeList',
          'Comic.store.ComicList',
          'Comic.view.TabPanel'
    ],
    
    config: {
        refs: {
          mainview: 'mainview',
          comiclistview: 'comiclistview',
          comiclisttitlebar: 'comiclistview #comiclisttitlebar',
          ordertoolbar: 'comiclistview #ordertoolbar',
          refreshbutton: 'comiclistview #refreshbutton',
          toggleLibraryButton: 'comiclistview #toggleLibrary',

          searchview: 'searchview',
          maintabpanel: 'maintabpanel',
          seriesview: 'seriesview',
          
          comicview: { selector: 'comicview', xtype: 'comicview', autoCreate: true },
          comicinfoview: { selector: 'comicinfoview', xtype: 'comicinfoview', autoCreate: true },

          order_orderby_1: '#ordertoolbar #orderby_1',
          order_direction_1: '#ordertoolbar #direction_1',
          order_orderby_2: '#ordertoolbar #orderby_2',
          order_direction_2: '#ordertoolbar #direction_2',
          order_refresh: '#ordertoolbar #refreshbutton'

        },
        
        control: {
        
          comiclistview: {
            initialize: 'onComicListViewInitialize',
            itemtap: 'onComicListViewItemTap'
          },
          
          searchview: {
            search: 'onSearch'
          },
          
          treelistview: {
            showlist: 'onShowList'
          },
          
          seriesview: {
            showseries: 'onShowSeries'
          },
          
          refreshbutton: {
            tap: 'onRefreshButton'
          },

          toggleLibraryButton: {
            tap: 'onToggleLibraryButton'
          },
          
          
          order_orderby_1: {
            change: 'onDoSort'
          },
          order_orderby_2: {
            change: 'onDoSort'
          },
          order_direction_1: {
            change: 'onDoSort'
          },
          order_direction_2: {
            change: 'onDoSort'
          },
          order_refresh: {
            change: 'onDoSort'
          }

          
        }
    },
    
    init : function()
    {
      // called before application.launch()
      var me = this;
      
      // Make sure each store has a unique, just to prevent bugs caused by name clashing.
      me.storeName = 'ComicList-';
      me.storeCount = 0;

      Comic.sortfields = { 
        0: '',
        1: 'Caption', 
        2: 'ShadowSeries', 
        3: 'ShadowVolume',
        4: 'ShadowTitle',
        5: 'ShadowNumber',
        6: 'ShadowYear', 
        7: 'FilePath',
        8: 'UserOpenedTimeAsText',
        9: 'PublishedAsText'
      };
    },
     
    onToggleLibraryButton: function()
    {
      var me = this,
          maintabpanel = me.getMaintabpanel();

      if (maintabpanel.isHidden())
      {
        maintabpanel.setShowAnimation({ type: 'slide', direction: 'right' });
        //maintabpanel.setShowAnimation('fadeIn');
        maintabpanel.show();
        //me.setLeft(100);
      }
      else
      {
        maintabpanel.setHideAnimation({ type: 'slideOut', direction: 'left' });
        //maintabpanel.setHideAnimation('fadeOut');
        maintabpanel.hide();
        //me.setLeft(0);
      }
      

    },
    onRefreshButton: function()
    {
      var me = this,
          comiclistview = me.getComiclistview(),
          store = comiclistview.getStore(),
          filter = '',
          sorters = [];

      comiclistview.setMasked({
            xtype: 'loadmask',
            message: 'Loading...'
        });
        
      sorters.push({
          property : Comic.sortfields[Comic.ordersettings.get('orderby_1')],
          direction: Comic.ordersettings.get('direction_1') == 0 ? 'asc' : 'desc'
      });
      if (Comic.ordersettings.get('orderby_2') > 0)
      {
        sorters.push({
            property : Comic.sortfields[Comic.odersettings.get('orderby_2')],
            direction: Comic.ordersettings.get('direction_2') == 0 ? 'asc' : 'desc'
        });
      }
      
      store.setSorters( sorters );
      /*
      if (Comic.sortsettings.filter.length != 0)
      {
        filter = "substringof('" + Comic.sortsettings.filter +"', tolower(Caption)) eq true";
        store.setFilters( { property: filter, type: 'use' } );
      }
      else
        store.setFilters([]);
      */
      
      store.load({
        callback: function(records, operation, success) {
           
            var scrollable = comiclistview.getScrollable();
            if (scrollable)
            {
              scrollable.getScroller().scrollToTop();
            }
              
            comiclistview.setMasked(false);
            me.getComiclisttitlebar().setTitle(me.title + ' [#: ' + store.getTotalCount() + ']');
            
        },
        scope: me
      });
    },
    
    
    onComicListViewInitialize: function()
    {
      var me = this;
      
      var apiToken = ApiToken.Get();
      var store = Ext.create('Ext.data.Store', { model: "Comic.model.OrderSettings" });

      //loads any existing Search data from localStorage
      store.load();

      var index = store.findExact('user', apiToken.Username);
      if (index == -1)
      {
        Comic.ordersettings = Ext.create('Comic.model.OrderSettings',
            {
              user : apiToken.Username,
              orderby_1: 1,// caption
              direction_1: 0, // ascending
              orderby_2: 0, // none
              direction_2: 0 // ascending
            });
        
        // Save to localStorage
        Comic.ordersettings.save();
      }
      else
      {
        Comic.ordersettings = store.getAt(index);
      }

      
      me.getOrder_orderby_1().suspendEvents();
      me.getOrder_orderby_1().setValue(Comic.ordersettings.get('orderby_1'));
      me.getOrder_orderby_1().resumeEvents(true);
      
      me.getOrder_direction_1().suspendEvents();
      me.getOrder_direction_1().setValue(Comic.ordersettings.get('direction_1'));
      me.getOrder_direction_1().resumeEvents(true);

      me.getOrder_orderby_2().suspendEvents();
      me.getOrder_orderby_2().setValue(Comic.ordersettings.get('orderby_2'));
      me.getOrder_orderby_2().resumeEvents(true);

      me.getOrder_direction_2().suspendEvents();
      me.getOrder_direction_2().setValue(Comic.ordersettings.get('direction_2'));
      me.getOrder_direction_2().resumeEvents(true);
      
    },
       
    onComicListViewItemTap: function(/*Ext.dataview.DataView*/ list, /*Number*/ index, /*Ext.Element/Ext.dataview.component.DataItem*/ target, /*Ext.data.Model*/ record, /*Ext.EventObject*/ e, /*Object*/ eOpts)
    {
      var me = this;
      
        Comic.new_comic_id = record.get('Id');
        Comic.context = {};
        Comic.context.source = 'comiclistview';
        Comic.context.index = index;
        Comic.context.record = record;
        
        me.getMainview().push(me.getComicview());
    },

    onShowList: function(id, name)
    {
      var me = this,
          params = Comic.RemoteApi.CreateStoreParams_ListComics(id);
          
      me.SetStore(params, name);
    },
    
    
    onShowSeries: function(id, name)
    {
      var me = this,
          params = Comic.RemoteApi.CreateStoreParams_SerieComics(id);
          
      me.SetStore(params, name);
    },
    
    onSearch: function(values)
    {
      var me = this,
          params = Comic.RemoteApi.CreateStoreParams_SearchComics(values);
          
      me.SetStore(params, 'Search results');
    },
    
    SetStore: function(params, title)
    {
      var me = this,
          oldstore = me.getComiclistview().getStore(),
          store = Ext.create('Comic.store.ComicList', { storeId : me.storeName + me.storeCount++ }),
          url = params.url;
          
      if (params.filter)
      {
        url += '?$filter=' + params.filter;
      }
      
      store.getProxy().setUrl(url);
      store.setPageSize(250);
      store.setRemoteSort(true);
      store.setRemoteFilter(true);
      store.setRemoteGroup(true);

      me.title = title;
      me.getComiclisttitlebar().setTitle(title);
      me.getComiclistview().setStore(store);
      
      if (oldstore)
      {
        oldstore.destroy();
      }
			
      me.onRefreshButton();
    },
    
    
    onDoSort: function ()
    {
      var me = this;
         
      Comic.ordersettings.set('orderby_1' ,me.getOrder_orderby_1().getValue());
      Comic.ordersettings.set('direction_1', me.getOrder_direction_1().getValue());
      Comic.ordersettings.set('orderby_2', me.getOrder_orderby_2().getValue());
      Comic.ordersettings.set('direction_2', me.getOrder_direction_2().getValue());

      if (Comic.ordersettings.get('orderby_2') == Comic.ordersettings.get('orderby_1'))
        Comic.ordersettings.set('orderby_2', 0);

      Comic.ordersettings.save();

      me.onRefreshButton();
    }
});