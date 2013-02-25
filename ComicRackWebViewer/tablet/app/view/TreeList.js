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

var ComicListItemIcons = { ComicLibraryListItem : 'resources/images/ComicLibraryListItem.png',
                           ComicListItemFolder : 'resources/images/ComicListItemFolder.png',
                           ComicSmartListItem : 'resources/images/ComicSmartListItem.png',
                           ComicIdListItem : 'resources/images/ComicIdListItem.png',
                         };

// Use one template instance for all list items instead of creating one for each list item separately.....
var TheTreeListItemTemplate = new Ext.XTemplate(
    '<img src="{[this.getIcon(values)]}" height="64px"/>{Name}',
    {
      // XTemplate configuration:
      disableFormats: true,
      // member functions:
      getIcon: function(item)
      {
        if (ComicListItemIcons[item.Type])
          return ComicListItemIcons[item.Type];
        else
          return 'resources/images/ComicListItemUnknown.png';
      },
    }
); 


     
Ext.define('Comic.view.TreeList', {
    extend: 'Ext.dataview.NestedList',
    xtype: 'treelistview',
    
    requires: [ 
      'Comic.store.TreeList',
      'Ext.plugin.PullRefresh',
      'Ext.dataview.List',
    ],
    
    config: {
      
      title: 'List',
      toolbar: {
        docked: "top", 
        xtype: "titlebar", 
        //ui: "light", 
        inline: true, 
        items: [ 
          {
            xtype: 'button', 
            itemId: 'refreshbutton',
            align: 'right',
            iconCls: 'refresh',
            iconMask: true,
          }
        ] 
      },
      displayField: 'Name',
      store: 'TreeList',
      onItemDisclosure: false,
      //baseCls: 'filesystem',
      //itemCls: 'filesystem',
      //itemHeight: 100,
      
      
      listConfig : {
        xtype: 'list',
        itemTpl: TheTreeListItemTemplate,
        
        itemHeight: 85,
        variableHeights: true,
        //cls: 'filesystem-list',
        //baseCls: 'filesystem-list',
        //itemCls: 'filesystem-list-item',
                
        plugins: [
          {
              xclass: 'Ext.plugin.PullRefresh',
              itemId: 'pullrefresh',
              pullRefreshText: 'Pull down to refresh...',
              refreshFn: function(plugin) {
                    plugin.fireEvent('refresh', plugin);
                },
          }
        ],
        
      },
      
    },
    
    onItemTapHold: function(list, index, target, record, e) {
      alert('onItemTapHold');
      return;
        var me = this,
            store = list.getStore(),
            node = store.getAt(index);

        me.fireEvent('itemtaphold', this, list, index, target, record, e);
        if (node.isLeaf()) {
            me.fireEvent('leafitemtaphold', this, list, index, target, record, e);
        }

    },
    
    getTitleTextTpl: function() {
      return '{' + this.getDisplayField() + '}';
    },
});