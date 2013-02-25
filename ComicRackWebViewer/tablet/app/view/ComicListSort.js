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

Ext.define('Comic.view.ComicListSort', {
  extend: 'Ext.form.Panel',
  xtype: 'comiclistsortview',
  requires: [
    //'Ext.ux.IOS5Toggle',
    //'Ext.ux.IconSpinner',
    'Ext.field.Select',
    'Ext.field.Search',
  ],
  config: {
  
    centered: true,
    hideOnMaskTap: true,
    modal: true,
    
    padding: '0 10 10 10',
    /*
    showAnimation: {
        type: 'popIn',
        duration: 250,
        easing: 'ease-out'
    },
    hideAnimation: {
        type: 'popOut',
        duration: 250,
        easing: 'ease-out'
    },
    */
    width: Ext.os.deviceType == 'Phone' ? 260 : 600,
    height: Ext.os.deviceType == 'Phone' ? 220 : 500,    
    
    items: [
    /* doesn't work correctly when in Search tab.
      {
          xtype: 'fieldset',
          title: 'Filter',
          items: [
            {
              xtype: 'searchfield',
              label: 'Caption',
              name: 'filter'
            }
          ]
      },
    */
      {
        xtype: 'fieldset',
        title: '1st Sort field',
        items: [
          {
            xtype: 'selectfield',
            label: 'Sort by',
            labelWidth: '60%',
            name: 'orderby_1',
            value: 1,
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
            ]
          },          
          {
            xtype: 'selectfield',
            label: 'Direction',
            labelWidth: '60%',
            name: 'direction_1',
            value: 2,
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
        ],
      },
      {
        xtype: 'fieldset',
        title: '2nd Sort field',
        items: [
          {
            xtype: 'selectfield',
            label: 'Sort by',
            labelWidth: '60%',
            name: 'orderby_2',
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
            ]
          },          
          {
            xtype: 'selectfield',
            label: 'Direction',
            labelWidth: '60%',
            name: 'direction_2',
            value: 2,
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
          
        ]
      },
      
    ]
  }

});

