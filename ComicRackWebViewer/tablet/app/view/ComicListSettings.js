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
        title: 'Comic List Order',
        items: [
            
            {
              xtype: 'selectfield',
              label: 'Sort by',
              //labelWidth: '60%',
              defaultTabletPickerConfig: {
                height: '90%'
              },
              //maxWidth: '100px',
              name: 'orderby_1',
              itemId: 'orderby_1',
              value: EnumOrderBy.CAPTION,
              //style: {
              //  fontSize: '12px'
              //},
              options: [
                {
                  text: 'Caption',
                  value: EnumOrderBy.CAPTION
                },
                {
                  text: 'Series',
                  value: EnumOrderBy.SERIES
                },
                {
                  text: 'Volume',
                  value: EnumOrderBy.VOLUME
                },
                {
                  text: 'Title',
                  value: EnumOrderBy.TITLE
                },
                {
                  text: 'Number',
                  value: EnumOrderBy.NUMBER
                },
                {
                  text: 'Year',
                  value: EnumOrderBy.YEAR
                },
                {
                  text: 'File',
                  value: EnumOrderBy.FILE
                },
                {
                  text: 'Last Opened',
                  value: EnumOrderBy.LAST_OPENED
                },
                {
                  text: 'Publish date',
                  value: EnumOrderBy.PUBLISH_DATE
                }

              ]
            },
            {
              xtype: 'selectfield',
              label: 'Direction',
              //labelWidth: '60%',
              
              name: 'direction_1',
              itemId: 'direction_1',
              value: EnumDirection.ASCENDING,
              
              options: [
                {
                  text: 'Ascending',
                  value: EnumDirection.ASCENDING
                },
                {
                  text: 'Descending',
                  value: EnumDirection.DESCENDING
                }
              ]
            },
           
            {
              xtype: 'selectfield',
              label: 'Then sort by',
              //labelWidth: '60%',
              defaultTabletPickerConfig: {
                height: '90%'
              },
              
              
              name: 'orderby_2',
              itemId: 'orderby_2',
              value: EnumOrderBy.NONE,
              options: [
                {
                  text: '[none]',
                  value: EnumOrderBy.NONE
                },
                {
                  text: 'Caption',
                  value: EnumOrderBy.CAPTION
                },
                {
                  text: 'Series',
                  value: EnumOrderBy.SERIES
                },
                {
                  text: 'Volume',
                  value: EnumOrderBy.VOLUME
                },
                {
                  text: 'Title',
                  value: EnumOrderBy.TITLE
                },
                {
                  text: 'Number',
                  value: EnumOrderBy.NUMBER
                },
                {
                  text: 'Year',
                  value: EnumOrderBy.YEAR
                },
                {
                  text: 'File',
                  value: EnumOrderBy.FILE
                },
                {
                  text: 'Last Opened',
                  value: EnumOrderBy.LAST_OPENED
                },
                {
                  text: 'Publish date',
                  value: EnumOrderBy.PUBLISH_DATE
                }
              ]
            },
            {
              xtype: 'selectfield',
              label: 'Direction',
              //labelWidth: '60%',
              name: 'direction_2',
              itemId: 'direction_2',
              value: EnumDirection.ASCENDING,
              
              options: [
                {
                  text: 'Ascending',
                  value: EnumDirection.ASCENDING
                },
                {
                  text: 'Descending',
                  value: EnumDirection.DESCENDING
                }
              ]
            }
        ]},
        {
          xtype: 'fieldset',
          title: 'Comic List Layout',
          items: [
            
            {
              xtype: 'selectfield',
              label: 'Layout',
              //labelWidth: '60%',
              
              name: 'layout',
              itemId: 'layout',
              value: EnumComicListLayout.LIST_MEDIUM,
              
              options: [
                {
                  text: 'List small',
                  value: EnumComicListLayout.LIST_SMALL
                },
                {
                  text: 'List medium',
                  value: EnumComicListLayout.LIST_MEDIUM
                },
                {
                  text: 'List large',
                  value: EnumComicListLayout.LIST_LARGE
                },
                {
                  text: 'Grid small',
                  value: EnumComicListLayout.GRID_SMALL
                },
                {
                  text: 'Grid medium',
                  value: EnumComicListLayout.GRID_MEDIUM
                },
                {
                  text: 'Grid large',
                  value: EnumComicListLayout.GRID_LARGE
                }
              ]
            }
        ]
      }
      
    ]
  }

});

