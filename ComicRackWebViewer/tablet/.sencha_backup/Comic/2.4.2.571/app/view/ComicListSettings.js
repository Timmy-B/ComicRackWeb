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

Ext.define('Comic.view.ComicListSettings', {
  extend: 'Ext.form.Panel',
  xtype: 'comiclistsettingsview',
  requires: [
    'Ext.ux.IconSpinner',
    'Ext.field.Select'
  ],
  config: {
    centered: true,
    hideOnMaskTap: true,
    modal: true,
    padding: '0 10 10 10',
    
    
    width: '90%',
    height: '90%',
    
    items: [
      {
        xtype: 'fieldset',
        items: [
            {
              xtype: 'titlebar',
              title: 'Comic List Order',
              ui: 'yellow',
              items: [
                {
                  xtype: 'button',
                  iconCls: 'delete',
                  align: 'right',
                  style: 'background-image:none; background-color: rgb(255, 99, 30);',
                  name: 'closeButton'
                }
              ]
            },
            {
              xtype: 'selectfield',
              label: 'Sort by',
              name: 'orderby_1',
              itemId: 'orderby_1',
              value: Comic.Enums.OrderBy.CAPTION,
              options: [
                {
                  text: 'Caption',
                  value: Comic.Enums.OrderBy.CAPTION
                },
                {
                  text: 'Series',
                  value: Comic.Enums.OrderBy.SERIES
                },
                {
                  text: 'Volume',
                  value: Comic.Enums.OrderBy.VOLUME
                },
                {
                  text: 'Title',
                  value: Comic.Enums.OrderBy.TITLE
                },
                {
                  text: 'Number',
                  value: Comic.Enums.OrderBy.NUMBER
                },
                {
                  text: 'Year',
                  value: Comic.Enums.OrderBy.YEAR
                },
                {
                  text: 'File',
                  value: Comic.Enums.OrderBy.FILE
                },
                {
                  text: 'Last Opened',
                  value: Comic.Enums.OrderBy.LAST_OPENED
                },
                {
                  text: 'Publish date',
                  value: Comic.Enums.OrderBy.PUBLISH_DATE
                }
              ]
            },
            {
              xtype: 'selectfield',
              label: 'Direction',
              name: 'direction_1',
              itemId: 'direction_1',
              value: Comic.Enums.Direction.ASCENDING,
              options: [
                {
                  text: 'Ascending',
                  value: Comic.Enums.Direction.ASCENDING
                },
                {
                  text: 'Descending',
                  value: Comic.Enums.Direction.DESCENDING
                }
              ]
            },
            {
              xtype: 'selectfield',
              label: 'Then sort by',
              defaultTabletPickerConfig: {
                height: '90%'
              },
              name: 'orderby_2',
              itemId: 'orderby_2',
              value: Comic.Enums.OrderBy.NONE,
              options: [
                {
                  text: '[none]',
                  value: Comic.Enums.OrderBy.NONE
                },
                {
                  text: 'Caption',
                  value: Comic.Enums.OrderBy.CAPTION
                },
                {
                  text: 'Series',
                  value: Comic.Enums.OrderBy.SERIES
                },
                {
                  text: 'Volume',
                  value: Comic.Enums.OrderBy.VOLUME
                },
                {
                  text: 'Title',
                  value: Comic.Enums.OrderBy.TITLE
                },
                {
                  text: 'Number',
                  value: Comic.Enums.OrderBy.NUMBER
                },
                {
                  text: 'Year',
                  value: Comic.Enums.OrderBy.YEAR
                },
                {
                  text: 'File',
                  value: Comic.Enums.OrderBy.FILE
                },
                {
                  text: 'Last Opened',
                  value: Comic.Enums.OrderBy.LAST_OPENED
                },
                {
                  text: 'Publish date',
                  value: Comic.Enums.OrderBy.PUBLISH_DATE
                }
              ]
            },
            {
              xtype: 'selectfield',
              label: 'Direction',
              name: 'direction_2',
              itemId: 'direction_2',
              value: Comic.Enums.Direction.ASCENDING,
              options: [
                {
                  text: 'Ascending',
                  value: Comic.Enums.Direction.ASCENDING
                },
                {
                  text: 'Descending',
                  value: Comic.Enums.Direction.DESCENDING
                }
              ]
            }
        ]},
        {
          xtype: 'fieldset',
          items: [
            {
              xtype: 'titlebar',
              title: 'Comic List Layout',
              ui: 'yellow'
            },
            {
              xtype: 'selectfield',
              label: 'Theme',
              name: 'theme',
              itemId: 'theme',
              value: Comic.Enums.Theme.NORMAL,
              options: [
                {
                  text: 'Normal',
                  value: Comic.Enums.Theme.NORMAL
                },
                {
                  text: 'Lite',
                  value: Comic.Enums.Theme.LITE
                }
                
              ]
            },
            {
              xtype: 'selectfield',
              label: 'Layout',
              name: 'layout',
              itemId: 'layout',
              value: Comic.Enums.ComicListLayout.LIST_MEDIUM,
              options: [
                {
                  text: 'List small',
                  value: Comic.Enums.ComicListLayout.LIST_SMALL
                },
                {
                  text: 'List medium',
                  value: Comic.Enums.ComicListLayout.LIST_MEDIUM
                },
                {
                  text: 'List large',
                  value: Comic.Enums.ComicListLayout.LIST_LARGE
                },
                {
                  text: 'Grid small',
                  value: Comic.Enums.ComicListLayout.GRID_SMALL
                },
                {
                  text: 'Grid medium',
                  value: Comic.Enums.ComicListLayout.GRID_MEDIUM
                },
                {
                  text: 'Grid large',
                  value: Comic.Enums.ComicListLayout.GRID_LARGE
                }
              ]
            }
        ]
      }
    ]
  }

});

