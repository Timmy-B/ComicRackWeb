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

Ext.define('Comic.view.Search', {
  extend: 'Ext.form.Panel',
  xtype: 'searchview',
  requires: [
        'Ext.form.FieldSet',
        'Ext.field.Select',
        'Ext.ux.IconSpinner'
    ],

  config: {
    submitOnAction: true,
    items: [
      {
        xtype: 'toolbar',
        docked: 'top',
        ui: 'light',
        title: 'Search All'
      },
      {
        xtype: 'fieldset',
        items: [
          {
            xtype: 'selectfield',
            label: 'Search in',
            name: 'type',
            value: 1,
            options: [
              {
                text: 'All',
                value: 1
              },
              {
                text: 'Caption',
                value: 2
              },
              {
                text: 'Series',
                value: 3
              },
              {
                text: 'Title',
                value: 4
              },
              {
                text: 'Writer',
                value: 5
              },
              {
                text: 'Artists',
                value: 6
              },
              {
                text: 'Descriptive',
                value: 7
              },
              {
                text: 'File path',
                value: 8
              }
            ]
          },          
          {
            xtype: 'textfield',
            name : 'value',
            label: 'For'
          }
        ]
      },
      {
        xtype: 'button',
        itemId: 'submitbutton',
        text: 'Go',
        ui: 'action',
        iconCls: 'search',
        iconMask: true,
        margin: '.5em .5em'
      }
    ]
  }

});