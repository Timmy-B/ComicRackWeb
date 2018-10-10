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
Ext.define('Comic.controller.Search', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
          searchview: 'searchview',
          submitbutton: 'searchview #submitbutton'
        },
        
        control: {
          searchview: {
            show: 'onSearchViewShow',
            activate: 'onSearchViewActivate', // fired when the view is activated (by the tab panel)
            initialize: 'onSearchViewInitialize',
            beforesubmit: 'onSearchBeforeSubmit'
          },
          submitbutton: {
            tap: 'onSubmitButtonTap'
          }
        }
    },
        
    onSearchViewActivate: function()
    {
      //alert('onActivate');
    },
  
    onSearchViewShow: function()
    {
      //alert('onShow');
    },
    
    onSearchViewInitialize: function(list, opts) {
          //alert('onInit');
          
    },
      
    onSearchBeforeSubmit: function( /*Ext.form.Panel*/ form, /*Objec*/ values, /*Object*/ options, /*Object*/ eOpts )
    {
      Ext.defer(this.onSubmitButtonTap, 100, this);
      return false; // prevent default form submit
    },
    
    onSubmitButtonTap: function(/*Ext.Button*/ button, /*Ext.EventObject*/ e, /*Object*/ eOpts )
    {
      var me = this,  
          values = me.getSearchview().getValues();
      
      me.getSearchview().fireEvent('search', values);
    }
});
