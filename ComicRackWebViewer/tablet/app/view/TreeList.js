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
    '<img src="{[this.getIcon(values)]}" height="64"/>{Name}',
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
      'Ext.ux.BufferedList',
    ],
    
    config: {
      
      title: 'List',
      toolbar: {
        docked: "top", 
        xtype: "titlebar", 
        ui: "light", 
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
      onItemDisclosure: true,
      listConfig : {
        xtype: 'bufferedlist',
        itemTpl: TheTreeListItemTemplate,
        baseCls: 'filesystem-list',
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
        /*
        listeners: [
        {
          itemtaphold: function(list) {
            list.getParent().onItemTapHold(list)
          }
        }
          //{ event: 'itemtaphold', fn: 'onItemTapHold', scope: me },
        ],
        */
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