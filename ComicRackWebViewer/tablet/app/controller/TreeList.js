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
Ext.define('Comic.controller.TreeList', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
          mainview: 'mainview',
          treelistview: 'treelistview',
          refreshbutton: 'treelistview #refreshbutton',
          pullrefresh: 'treelistview #pullrefresh',
        },
        
        control: {
          treelistview: {
            
            show: 'onTreeListShow',
            activate: 'onTreeListActivate', // fired when the view is activated (by the tab panel)
            initialize: 'onTreeListInitialize',
            leafitemtap: 'onTreeListLeafItemTap',
            itemtap: 'onTreeListItemTap', // also get comic list for folder items, because that's also what ComicRack does.
            load: 'onTreeListLoad',
            
          },
          refreshbutton: {
            tap: 'onRefreshButton'
          },
          pullrefresh: {
            refresh: 'onPullRefresh',
          },
        },
    },
    
    onRefreshButton: function()
    {
      var me = this,
          treelistview = me.getTreelistview();
          
      treelistview.setMasked({
            xtype: 'loadmask',
            message: 'Loading...'
        });
        
      var oldstore = treelistview.getStore();
      var store = Ext.create('Comic.store.TreeList', { storeId : storeName + storeCount++ });
      store.setPageSize(null);
      treelistview.setStore(store);
      oldstore.destroy();
      
      /*  
      var store = treelistview.getStore();
      var root = store.getRoot();
      store.load({node: root});
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
    onTreeListLeafItemTap: function(/*Ext.dataview.NestedList*/ nestedlist, /*Ext.List*/ list, /*Number*/ index, /*Ext.dom.Element*/ target, /*Ext.data.Record*/ record, /*Ext.event.Event*/ e, /*Object*/ eOpts)
    {
      var me = this;
      me.getTreelistview().fireEvent('showlist', record.data.Id, record.data.Name);
    },
    
    onTreeListItemTap: function(/*Ext.dataview.NestedList*/ nestedlist, /*Ext.List*/ list, /*Number*/ index, /*Ext.dom.Element*/ target, /*Ext.data.Record*/ record, /*Ext.event.Event*/ e, /*Object*/ eOpts)
    {
      var me = this;
      
      if (record.data.leaf)
        return; // onTreeListLeafItemTap will follow...
      
      me.getTreelistview().fireEvent('showlist', record.data.Id, record.data.Name);
    },
   
   
    onTreeListActivate: function()
    {
      //alert('onActivate');
    },
  
    onTreeListShow: function()
    {
      //alert('onShow');
      
    },
    
    onTreeListInitialize: function(list, opts) 
    {
      //alert('onTreeListInitialize');
    },
    
    onTreeListLoad: function( /*Ext.dataview.NestedList*/ nestedlist, /*Ext.data.Store*/ store, /*Ext.util.Grouper[]*/ records, /*Boolean*/ successful, /*Ext.data.Operation*/ operation, /*Object*/ eOpts ) 
    {
      var me = this,
          treelistview = me.getTreelistview();
      
      treelistview.goToNode(store.getRoot());
      treelistview.setMasked(false);    
      
            
      var library = store.findRecord('Type', 'ComicLibraryListItem');
      if (library)
      {
        var list = treelistview.getActiveItem();
        list.select(library);
        Comic.RemoteApi.library_id = library.data.Id;
        me.onTreeListLeafItemTap(null, null, 0, null, library);
      }
    },
      
    
});
