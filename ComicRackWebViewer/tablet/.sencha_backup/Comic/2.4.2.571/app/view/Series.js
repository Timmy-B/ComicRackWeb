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
  
// Use one template instance for all list items instead of creating one for each list item separately.....
var TheSeriesItemTemplate = new Ext.XTemplate(
    '{Title} {Volume}',
    {
      // XTemplate configuration:
      disableFormats: true
      // member functions:
      
    }
); 

var TheSeriesItemTemplate = new Ext.XTemplate(
    '{[this.getTitleText(values)]}',
    {
      // XTemplate configuration:
      disableFormats: true,
      // member functions:
      getTitleText: function(series)
      {
        return Comic.model.Series.getDisplayText(series);
      }
    }
); 


Ext.define('Comic.view.Series', {
    extend: 'Ext.dataview.List',
    xtype: 'seriesview',
    
    requires: [ 
      'Comic.store.Series',
      'Ext.plugin.PullRefresh',
      'Ext.dataview.List',
      'Ext.field.Search'
    ],
    
    config: {
      //itemTpl: TheRecentItemTemplate,
      //baseCls: 'filesystem-list',
      title: 'Series',
      //displayField: 'name',
      store: 'Series',
      emptyText: '<center>No series found.</center>',
      infinite: true,
      
      grouped     : true,
      
      indexBar    : {
                        letters: ["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].sort()
      },
      
      itemTpl: TheSeriesItemTemplate,

      items: [
        {
          xtype: 'titlebar',
          docked: 'top',
          ui: 'light',
          title: 'Series',
          
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
        {
          xtype: 'searchfield',
          docked: 'top',
          placeHolder: 'Filter...'
        }

      ],
      
      plugins: [
          {
              xclass: 'Ext.plugin.PullRefresh',
              itemId: 'pullrefresh',
              pullText: 'Pull down to refresh...',
              refreshFn: function(plugin) {
                    plugin.fireEvent('refresh', plugin);
                }
          }
        ]
        
    }
});