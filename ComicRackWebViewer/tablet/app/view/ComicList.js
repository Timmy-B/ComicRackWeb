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
var TheComicListItemTemplate = new Ext.XTemplate(
    '<div class="comiclist-item-inner"><img height="64px" class="cl-img" src="/BCR/Comics/{Id}/Pages/0?height=64"/>{Caption}</br>{[this.getPublishedDate(values)]}<span class="progress">{[this.getProgressText(values)]}</span><span class="date_last_read">{[this.getOpenedDate(values)]}</span></div>',
    {
      // XTemplate configuration:
      disableFormats: true,
      // member functions:
      getProgressText: function(comic)
      {
        if (comic.PageCount == 0)
        {
          return "no pages"; // BUG: This comic should never have been added to the database.....
        }
        
        if ((comic.UserLastPageRead + 1) == comic.PageCount)
        {
          return "finished";
        }
        else
        {
          return (comic.UserLastPageRead + 1) + "/" + comic.PageCount;
        }
      },
      getOpenedDate: function(comic)
      {
        return comic.UserOpenedTimeAsText === null ? 'Never' : Ext.Date.format(comic.UserOpenedTimeAsText, "Y/m/d");
      }
      , getPublishedDate: function (comic)
      {
        return (comic.PublishedAsText === null || comic.PublishedAsText.getFullYear() == 1) ? '---' : Ext.Date.format(comic.PublishedAsText, "Y/m");
      }
    }
); 



Ext.define('Comic.view.ComicList', {
    //extend: 'Ext.ux.BufferedList',
    extend: 'Ext.dataview.List',
    xtype: 'comiclistview',
    
    requires: [ 
      'Ext.plugin.ListPaging',
      'Ext.dataview.List',
      'Comic.view.ComicListSort'
    ],
    
        
    config: {
      title: 'List',
      itemTpl: TheComicListItemTemplate,
      cls: 'comiclist',
      itemCls: 'comiclist-item',
      itemHeight: 88,
      variableHeights: false,
      infinite: true,
      
      displayField: 'Caption',
        
      plugins: [
        {
          xclass: 'Ext.plugin.ListPaging',
          autoPaging: true
        }
      ],
      items: [
        {
          docked: 'top', 
          xtype: 'titlebar', 
          ui: 'light', 
          title: 'Comics',
          itemId: 'comiclisttitlebar',
          inline: true,
          items: [
            {
              xtype: 'button',
              itemId: 'toggleLibrary',
              align: 'left',
              //iconCls: 'arrow_left',
              //iconMask: true,
              text: 'Lists',
              style: {
              //  fontSize: '12px'
              }
            }
            ]
        },
        {
          docked: 'top',
          xtype: 'toolbar',
          ui: 'light',
          //title: 'Filter',
          //align: 'left',
          itemId: 'ordertoolbar',
          inline: true,
          items: [
            {
              xtype: 'label',
              html: '1st order',
              style: {
                fontSize: '12px'
              }
            },
            {
              xtype: 'selectfield',
              //label: '1st Sort by',
              //labelWidth: '60%',
              defaultTabletPickerConfig: {
                height: '90%'
              },
              maxWidth: '100px',
              name: 'orderby_1',
              itemId: 'orderby_1',
              value: 1,
              style: {
                fontSize: '12px'
              },
              options: [
                {
                  text: 'Caption',
                  value: 1
                },
                {
                  text: 'Series',
                  value: 2
                },
                {
                  text: 'Volume',
                  value: 3
                },
                {
                  text: 'Title',
                  value: 4
                },
                {
                  text: 'Number',
                  value: 5
                },
                {
                  text: 'Year',
                  value: 6
                },
                {
                  text: 'File',
                  value: 7
                },
                {
                  text: 'Last Opened',
                  value: 8
                },
                {
                  text: 'Publish date',
                  value: 9
                }

              ]
            },          
            {
              xtype: 'selectfield',
              //label: 'Direction',
              //labelWidth: '60%',
              maxWidth: '100px',
              name: 'direction_1',
              itemId: 'direction_1',
              value: 2,
              style: {
                fontSize: '12px'
              },
              options: [
                {
                  text: 'Ascending',
                  value: 0
                },
                {
                  text: 'Descending',
                  value: 1
                }
              ]
            },
            {
              xtype: 'label',
              html: '2nd order',
              style: {
                fontSize: '12px'
              }
            },
            {
              xtype: 'selectfield',
              //label: '2nd Sort by',
              //labelWidth: '60%',
              defaultTabletPickerConfig: {
                height: '90%'
              },
              style: {
                fontSize: '12px'
              },
              maxWidth: '100px',
              name: 'orderby_2',
              itemId: 'orderby_2',
              value: 1,
              options: [
                {
                  text: '[none]',
                  value: 0
                },
                {
                  text: 'Caption',
                  value: 1
                },
                {
                  text: 'Series',
                  value: 2
                },
                {
                  text: 'Volume',
                  value: 3
                },
                {
                  text: 'Title',
                  value: 4
                },
                {
                  text: 'Volume',
                  value: 5
                },
                {
                  text: 'Year',
                  value: 6
                },
                {
                  text: 'File',
                  value: 7
                },
                {
                  text: 'Last Opened',
                  value: 8
                },
                {
                  text: 'Publish date',
                  value: 9
                }
              ]
            },          
            {
              xtype: 'selectfield',
              //label: 'Direction',
              //labelWidth: '60%',
              name: 'direction_2',
              itemId: 'direction_2',
              value: 2,
              maxWidth: '100px',
              style: {
                fontSize: '12px'
              },
              options: [
                {
                  text: 'Ascending',
                  value: 0
                },
                {
                  text: 'Descending',
                  value: 1
                }
              ]
            },
            /*
            {
              xtype: 'searchfield',
              //label: 'Search',
              name: 'query',
              style: {
                fontSize: '12px'
              },
            },
            */
            {
              xtype: 'button',
              itemId: 'refreshbutton',
              align: 'right',
              iconCls: 'refresh',
              iconMask: true,
              style: {
                fontSize: '12px'
              }
            }
          ]
        }
        
      ]
    }
});