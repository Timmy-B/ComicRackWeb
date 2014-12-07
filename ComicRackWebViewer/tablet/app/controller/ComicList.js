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
          'Comic.view.TabPanel',
          'Comic.view.ComicListSettings',
    ],
    
    config: {
        refs: {
          mainview: 'mainview',
          comiclistview: 'comiclistview',
          comiclisttitlebar: 'comiclistview #comiclisttitlebar',
          ordertoolbar: 'comiclistview #ordertoolbar',
          refreshbutton: 'comiclistview #refreshbutton',
          toggleLibraryButton: 'comiclistview #toggleLibrary',
          settingsbutton: 'comiclistview #settingsbutton',

          searchview: 'searchview',
          maintabpanel: 'maintabpanel',
          seriesview: 'seriesview',
          
          comicview: { selector: 'comicview', xtype: 'comicview', autoCreate: true },
          comicinfoview: { selector: 'comicinfoview', xtype: 'comicinfoview', autoCreate: true },

          order_orderby_1: '#ordertoolbar #orderby_1',
          order_direction_1: '#ordertoolbar #direction_1',
          order_orderby_2: '#ordertoolbar #orderby_2',
          order_direction_2: '#ordertoolbar #direction_2',
          order_refresh: '#ordertoolbar #refreshbutton',
          order_layout: '#ordertoolbar #layout',

          comiclistsettingsview: { selector: 'comiclistsettingsview', xtype: 'comiclistsettingsview', autoCreate: true }
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
          },
          order_layout: {
            change: 'onChangeLayout'
          },
          settingsbutton: {
            tap: 'onSettingsButton'
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

    onSettingsButton: function ()
    {
      var me = this;

      if (!me.overlay)
      {
        me.overlay = Ext.Viewport.add(me.getComiclistsettingsview());
      }

      me.overlay.show();
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
            property : Comic.sortfields[Comic.ordersettings.get('orderby_2')],
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
      
      comiclistview.setScrollToTopOnRefresh(true);
      store.load({
        callback: function (records, operation, success)
        {
            comiclistview.setMasked(false);
            me.getComiclisttitlebar().setTitle(me.title + ' [' + store.getTotalCount() + ' Comics]');
            
        },
        scope: me
      });
    },
    
    
    onComicListViewInitialize: function()
    {
      var me = this,
          apiToken = ApiToken.Get(),
          comiclistview = me.getComiclistview(),
          store = Ext.create('Ext.data.Store', { model: "Comic.model.OrderSettings" });
      

      //loads any existing Search data from localStorage
      store.load();

      var index = store.findExact('user', apiToken.Username);
      if (index == -1)
      {
        Comic.ordersettings = Ext.create('Comic.model.OrderSettings',
            {
              user: apiToken.Username
            });
        
        // Save to localStorage
        Comic.ordersettings.save();
      }
      else
      {
        Comic.ordersettings = store.getAt(index);
      }

      
      comiclistview.SetLayout(Comic.ordersettings.get('layout'));
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
      store.setPageSize(100);
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
    
    
    onSettingsChanged: function ()
    {
      var me = this,
          comiclistview = me.getComiclistview(),
          layout = Comic.ordersettings.get('layout');
         
      comiclistview.setItemTpl(ComicListItemTemplates[layout]);
      comiclistview.setItemCls(ComicListItemTemplates[layout].containerCls);

      me.onRefreshButton();
    }

});