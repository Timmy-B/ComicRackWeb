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
Ext.define('Comic.controller.Series', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
          mainview: 'mainview',
          seriesview: 'seriesview',
          comiclistview: 'comiclistview',
          comiclisttitlebar: '#comiclisttitlebar',
          refreshbutton: 'seriesview #refreshbutton',
          pullrefresh: 'seriesview #pullrefresh',
          titlebar: 'seriesview titlebar',
          searchfield: 'seriesview searchfield'
        },
        
        control: {
          seriesview: {
            //itemtap: 'onTreeListItemTap',
            show: 'onSeriesViewShow',
            activate: 'onSeriesViewActivate', // fired when the view is activated (by the tab panel)
            initialize: 'onSeriesViewInitialize',
            itemtap: 'onSeriesViewItemTap'
          },
          
          refreshbutton: {
            tap: 'onRefreshButton'
          },
          pullrefresh: {
            refresh: 'onPullRefresh'
          },
          
          searchfield: {
            clearicontap: 'onSearchClearIconTap',
            keyup: 'onSearchKeyUp'
          }
        }
    },
    
    init: function()
    {
      var me = this;
      me.storeName = 'Series-';
      me.storeCount = 0;
    },
    
    onSeriesViewItemTap: function(/*Ext.List*/ list, /*Number*/ index, /*Ext.dom.Element*/ target, /*Ext.data.Record*/ record, /*Ext.event.Event*/ e, /*Object*/ eOpts)
    {
      var me = this;
      me.getSeriesview().fireEvent('showseries', record.data.Id, Comic.model.Series.getDisplayText(record.data)/*Title + " " + record.data.Volume*/);
    },

    onSeriesViewActivate: function()
    {
    },
  
    onSeriesViewShow: function()
    {
      var me = this;
      
      if (!me.getSeriesview().getStore().isLoaded())
      {
        // Give the sliding animation time to finish before locking up the UI with the store load...
        Ext.defer(function() { me.onRefreshButton();}, 500);
      }
      
    },
    
    onSeriesViewInitialize: function(list, opts) {
          //alert('onInit');
          
    },
      
    onRefreshButton: function()
    {
      var me = this,
          seriesview = me.getSeriesview(),
          titlebar = me.getTitlebar(),
          oldstore = seriesview.getStore(),
          store = Ext.create('Comic.store.Series', { storeId : me.storeName + me.storeCount++ });
          
      seriesview.setMasked({ xtype: 'loadmask', message: 'Loading...' });
      
      store.setPageSize(null);
      store.load(
        {
          callback: function(records, operation, success) 
          {
            titlebar.setTitle('Series [#: ' + store.getTotalCount() + ']');
          },
          scope: me
        }
      );
      
      seriesview.setStore(store);
      oldstore.destroy();
      
      /*
      var store = seriesview.getStore();
      store.setPageSize(null);
      console.log(store.getPageSize());
      store.load({
        // select causes the plugin to hang :(
        //select: ['Id','Series','Volume','Title','Number','FilePath','Year','Month','PageCount','LastPageRead','Opened'],
        
        callback: function(records, operation, success) {
        // the operation object contains all of the details of the load operation
        //console.log(records);
        //seriesview.doRefresh();
          },
          scope: this
      });
      */
      
    },
    
    onPullRefresh: function(plugin)
    {
      //alert("onPullRefresh");
      // reloading the list's store doesn't work, because the treestore doesn't assign a proxy to its substores....
      //plugin.getList().getStore().load();
      
      // just reload the complete tree
      this.onRefreshButton();
    },
    
    
    /**
    * Called when the search field has a keyup event.
    *
    * This will filter the store based on the fields content.
    */
    onSearchKeyUp: function(field, /*Ext.EventObject*/ e, /*Object*/ eOpts ) 
    {
      var me = this;
      
      if (me.filterTimer)
      {
        clearTimeout(me.filterTimer);
      }
        
      me.filterTimer = Ext.defer(function() {
        me.filterTimer = null;
        
        //get the store and the value of the field
        var store = this.getSeriesview().getStore(),
            value = field.getValue(),
            searches,
            regexps,
            i,
            scrollable;
            
        //first clear any current filters on the store
        store.clearFilter();

        //check if a value is set first, as if it isn't we dont have to do anything
        if (value) 
        {
          //the user could have entered spaces, so we must split them so we can loop through them all
          searches = value.split(' ');
          regexps = [];
             
          //loop them all
          for (i = 0; i < searches.length; i++) 
          {
            //if it is nothing, continue
            if (!searches[i]) 
            {
              continue;
            }

            //if found, create a new regular expression which is case insenstive
            regexps.push(new RegExp(searches[i], 'i'));
          }

          //now filter the store by passing a method
          //the passed method will be called for each record in the store
          store.filter(function(record) {

            //loop through each of the regular expressions
            for (i = 0; i < regexps.length; i++) 
            {
              var search = regexps[i];
              
              if (!Comic.model.Series.getDisplayText(record.data).match(search))
              {
                return false;
              }
            }

            return true;
          });
          
          scrollable = me.getSeriesview().getScrollable();
          if (scrollable)
          {
            scrollable.getScroller().scrollToTop();
          }

        }
      }, 300, me);
        
    },

    /**
     * Called when the user taps on the clear icon in the search field.
     * It simply removes the filter form the store
     */
    onSearchClearIconTap: function( /*Ext.field.Input*/ field, /*Ext.EventObject*/ e, /*Object*/ eOpts )
    {
      var me = this,
          store = me.getSeriesview().getStore();
      
      if (me.filterTimer)
      {
        clearTimeout(me.filterTimer);
        me.filterTimer = null;
      }
        
      store.clearFilter();
    }
    
});
