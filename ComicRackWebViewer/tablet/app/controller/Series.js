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
Ext.define('Comic.controller.Series', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
          mainview: 'mainview',
          seriesview: 'seriesview',
          comiclistview: 'comiclistview',
          comiclisttoolbar: '#comiclisttoolbar',
          refreshbutton: 'seriesview #refreshbutton',
          pullrefresh: 'seriesview #pullrefresh',
        },
        
        control: {
          seriesview: {
            //itemtap: 'onTreeListItemTap',
            show: 'onSeriesViewShow',
            activate: 'onSeriesViewActivate', // fired when the view is activated (by the tab panel)
            initialize: 'onSeriesViewInitialize',
            itemtap: 'onSeriesViewItemTap',
          },
          
          refreshbutton: {
            tap: 'onRefreshButton'
          },
          pullrefresh: {
            refresh: 'onPullRefresh',
          },
        },
    },
    
    onSeriesViewItemTap: function(/*Ext.List*/ list, /*Number*/ index, /*Ext.dom.Element*/ target, /*Ext.data.Record*/ record, /*Ext.event.Event*/ e, /*Object*/ eOpts)
    {
      var me = this;
      me.getSeriesview().fireEvent('showseries', record.data.Id, record.data.Title + " " + record.data.Volume);
    },

    onSeriesViewActivate: function()
    {
    },
  
    onSeriesViewShow: function()
    {
      var me = this;
      
      if (!me.getSeriesview().getStore().isLoaded())
      {
        // Give the sliding animation time to finish before locking up the UI with the store load...
        Ext.defer(function() { me.onRefreshButton();}, 500);
      }
      
    },
    
    onSeriesViewInitialize: function(list, opts) {
          //alert('onInit');
          
    },
      
    onRefreshButton: function()
    {
      var me = this,
          seriesview = me.getSeriesview();
          
      seriesview.setMasked({
            xtype: 'loadmask',
            message: 'Loading...'
        });
        
      
      var oldstore = seriesview.getStore();
      var store = Ext.create('Comic.store.Series', { storeId : storeName + storeCount++ });
      store.setPageSize(null);
      store.load();
      seriesview.setStore(store);
      oldstore.destroy();
      
      /*
      var store = seriesview.getStore();
      store.setPageSize(null);
      console.log(store.getPageSize());
      store.load({
        // select causes the plugin to hang :(
        //select: ['Id','Series','Volume','Title','Number','FilePath','Year','Month','PageCount','LastPageRead','Opened'],
        
        callback: function(records, operation, success) {
        // the operation object contains all of the details of the load operation
        //console.log(records);
        //seriesview.doRefresh();
          },
          scope: this
      });
      */
      
    },
    
    onPullRefresh: function(plugin)
    {
      //alert("onPullRefresh");
      // reloading the list's store doesn't work, because the treestore doesn't assign a proxy to its substores....
      //plugin.getList().getStore().load();
      
      // just reload the complete tree
      this.onRefreshButton();
    },
});
