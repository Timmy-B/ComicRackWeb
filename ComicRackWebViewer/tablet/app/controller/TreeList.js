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

/*
  The TreeList view show a list of all the lists in ComicRack and uses drill down navigation.
  When a leaf is clicked, the 'showlist' event is fired.
  The ComicList view listen for this event and shows the selected list.
*/

Ext.define('Comic.controller.TreeList', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
          mainview: 'mainview',
          treelistview: 'treelistview',
          refreshbutton: 'treelistview #refreshbutton',
          pullrefresh: 'treelistview #pullrefresh'
        },
        
        control: {
          treelistview: {
            
            show: 'onTreeListShow',
            activate: 'onTreeListActivate', // fired when the view is activated (by the tab panel)
            initialize: 'onTreeListInitialize',
            leafitemtap: 'onTreeListLeafItemTap',
            itemtap: 'onTreeListItemTap', // also get comic list for folder items, because that's also what ComicRack does.
            load: 'onTreeListLoad'
            
          },
          refreshbutton: {
            tap: 'onRefreshButton'
          },
          pullrefresh: {
            refresh: 'onRefreshButton'
          }
        }
    },
    
    init: function() 
    {
      var me = this;
      me.storeName = 'TreeList-';
      me.storeCount = 0;
    },
    
    onRefreshButton: function()
    {
      var me = this,
          treelistview = me.getTreelistview(),
          oldstore = treelistview.getStore(),
          store = Ext.create('Comic.store.TreeList', { storeId : me.storeName + me.storeCount++ });
      
      treelistview.setMasked({
            xtype: 'loadmask',
            message: 'Loading...'
        });
        
      
      store.setPageSize(null);
      treelistview.setStore(store);
      oldstore.destroy();
      
      /*  
      var store = treelistview.getStore();
      var root = store.getRoot();
      store.load({node: root});
      */
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
      {
        return; // onTreeListLeafItemTap will follow...
      }
      
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
          treelistview = me.getTreelistview(),
          root = store.getRoot(),
          library = root.findChild('Type', 'ComicLibraryListItem');
      
      treelistview.goToNode(root);
      treelistview.setMasked(false);    
      
      if (library)
      {
        list = treelistview.getActiveItem();
        list.select(library);
        Comic.RemoteApi.library_id = library.data.Id;
        me.onTreeListLeafItemTap(null, null, 0, null, library);
      }
    }
    
});
