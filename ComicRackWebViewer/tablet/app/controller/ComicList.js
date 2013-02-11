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

// Make sure each store has a unique, just to prevent bugs caused by name clashing.
var storeName = 'ComicList-';
var storeCount = 0;

Ext.define('Comic.controller.ComicList', {
    extend: 'Ext.app.Controller',
    requires: [ 
          'Comic.view.Comic',
          'Comic.view.Search',
          'Comic.view.Series',
          'Comic.view.TreeList',
          'Comic.store.ComicList',
          'Comic.view.ComicListSort',
    ],
    
    config: {
        refs: {
          mainview: 'mainview',
          comiclistview: 'comiclistview',
          comiclisttoolbar: 'comiclistview #comiclisttoolbar',
          refreshbutton: 'comiclistview #refreshbutton',
          sortbutton: 'comiclistview #sortbutton',
          searchview: 'searchview',
          treelistview: 'treelistview',
          seriesview: 'seriesview',
          comiclistsortview: { selector: 'comiclistsortview', xtype: 'comiclistsortview', autoCreate: true },
          
          comicview: { selector: 'comicview', xtype: 'comicview', autoCreate: true },
          comicinfoview: { selector: 'comicinfoview', xtype: 'comicinfoview', autoCreate: true },
        },
        
        control: {
        
          comiclistview: {
            initialize: 'onComicListViewInitialize',
            itemtap: 'onComicListViewItemTap',
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
          
          sortbutton: {
            tap: 'onSortButton'
          },
          
          comiclistsortview: {
            show: 'onSortShow',
            hide: 'onSortHide'
          },
          
        },
    },
    
    init : function()
    {
      // called before application.launch()
      var me = this;
      
      Comic.sortsettings = {};
      Comic.sortsettings.filter = "";
      Comic.sortsettings.orderby_1 = 1; // caption
      Comic.sortsettings.direction_1 = 0; // ascending
      Comic.sortsettings.orderby_2 = 0; // none
      Comic.sortsettings.direction_2 = 0; // ascending
      
      Comic.sortsettings.sortfields = { 
        0: '',
        1: 'Caption', 
        2: 'ShadowSeries', 
        3: 'ShadowVolume',
        4: 'ShadowTitle',
        5: 'ShadowNumber',
        6: 'ShadowYear', 
        7: 'FilePath',
        8: 'Opened',
      };
    },
     
    onRefreshButton: function()
    {
      var me = this,
          comiclistview = me.getComiclistview()
          store = comiclistview.getStore(),
          filter = '';

      comiclistview.setMasked({
            xtype: 'loadmask',
            message: 'Loading...'
        });
        
      sorters = [];
      sorters.push({
          property : Comic.sortsettings.sortfields[Comic.sortsettings.orderby_1],
          direction: Comic.sortsettings.direction_1 == 0 ? 'asc' : 'desc'
      });
      if (Comic.sortsettings.orderby_2 > 0)
      {
        sorters.push({
            property : Comic.sortsettings.sortfields[Comic.sortsettings.orderby_2],
            direction: Comic.sortsettings.direction_2 == 0 ? 'asc' : 'desc'
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
              scrollable.getScroller().scrollToTop();
              
            comiclistview.setMasked(false);
            me.getComiclisttoolbar().setTitle(me.title + ' [#: ' + store.getTotalCount() + ']');
            
        },
        scope: me
      });
    },
    
    
    onComicListViewInitialize: function()
    {
    /*
      var me = this;
      Comic.RemoteApi.GetComicsFromList('f3e6cc52-2f39-416c-afee-f84cad603033', function(success, result) {
          //console.log(result);
          me.getComiclistview().getStore().setData(result);
      });
    */
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
          store = Comic.RemoteApi.CreateComicStoreFromList(id);
          
      me.SetStore(store, name);
    },
    
    
    onShowSeries: function(id, name)
    {
      var me = this,
          store = Comic.RemoteApi.CreateComicStoreFromSeries(id);
          
      me.SetStore(store, name);
    },
    
    onSearch: function(values)
    {
      var me = this,
          store = Comic.RemoteApi.CreateComicStoreFromSearch(values);
          
      me.SetStore(store, 'Search results');
    },
    
    SetStore: function(params, title)
    {
      var me = this,
          oldstore = me.getComiclistview().getStore();
      
      var store = Ext.create('Comic.store.ComicList', { storeId : storeName + storeCount++ });
      var url = params.url;
      if (params.filter)
        url += '?$filter=' + params.filter;
      
      store.getProxy().setUrl(url);
      store.setPageSize(250);
      store.setRemoteSort(true);
      store.setRemoteFilter(true);
      store.setRemoteGroup(true);

      me.title = title;
			me.getComiclisttoolbar().setTitle(title);
      me.getComiclistview().setStore(store);
      
      if (oldstore)
        oldstore.destroy();
			
      me.onRefreshButton();
    },
    
    onSortButton: function()
    {
      var me = this;

      if (!me.sortview) 
      {
        me.sortview = Ext.Viewport.add(me.getComiclistsortview());
      }

      me.sortview.show();
    },
    
    onSortShow: function() {
      var me = this,
          view = me.getComiclistsortview();
             
      view.setValues({
        filter: Comic.sortsettings.filter,
        orderby_1: Comic.sortsettings.orderby_1,
        direction_1: Comic.sortsettings.direction_1,
        orderby_2: Comic.sortsettings.orderby_2,
        direction_2: Comic.sortsettings.direction_2,
      });
    },
    
    onSortHide: function() {
      var me = this,
          view = me.getComiclistsortview(),
          values = view.getValues();
        
      Comic.sortsettings.filter = values.filter;
      Comic.sortsettings.orderby_1 = values.orderby_1;
      Comic.sortsettings.direction_1 = values.direction_1;
      Comic.sortsettings.orderby_2 = values.orderby_2;
      Comic.sortsettings.direction_2 = values.direction_2;
      
      me.onRefreshButton();
    },
});