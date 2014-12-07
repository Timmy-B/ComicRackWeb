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
                           ComicIdListItem : 'resources/images/ComicIdListItem.png'
                         };

// Use one template instance for all list items instead of creating one for each list item separately.....
var TheTreeListItemTemplate = new Ext.XTemplate(
    '<img class="icon" src="{[this.getIcon(values)]}"/><span class="label">{Name}</span>',
    {
      // XTemplate configuration:
      disableFormats: true,
      // member functions:
      getIcon: function(item)
      {
        if (ComicListItemIcons[item.Type])
        {
          return ComicListItemIcons[item.Type];
        }
        else
        {
          return 'resources/images/ComicListItemUnknown.png';
        }
      }
    }
); 


     
Ext.define('Comic.view.TreeList', {
    extend: 'Ext.dataview.NestedList',
    xtype: 'treelistview',
    
    requires: [ 
      'Comic.store.TreeList',
      'Ext.dataview.List'
    ],
    
    config: {
      
      title: 'List',
      toolbar: {
        docked: "top", 
        xtype: "titlebar", 
        inline: true, 
        items: [ 
          {
            xtype: 'button', 
            itemId: 'refreshbutton',
            align: 'right',
            iconCls: 'refresh',
            iconMask: true
          }
        ] 
      },
      displayField: 'Name',
      store: 'TreeList',
      onItemDisclosure: false,
      baseCls: 'filesystem',
      //cls: 'lite',
      listConfig : {
        itemTpl: TheTreeListItemTemplate,
        baseCls: 'filesystem-list',
        //cls: 'lite'
      }
      
    },
    
    UpdateLayout: function ()
    {
      //var me = this;
      
      //switch (Comic.ordersettings.get('theme'))
      //{
      //  case Comic.Enums.Theme.LITE:
      //    me.setListConfig({
      //      itemTpl: TheTreeListItemTemplate,
      //      baseCls: 'filesystem-list',
      //      cls: 'lite'
      //    });
      //    break;
      //  case Comic.Enums.Theme.NORMAL:
      //  default:
      //    me.setListConfig({
      //      itemTpl: TheTreeListItemTemplate,
      //      baseCls: 'filesystem-list'
      //    });
      //    break;
      //}
      
      //me.getStore().load();
    }
});