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
Ext.define('Comic.controller.ComicSettings', {
    extend: 'Ext.app.Controller',
    
    requires: [ 
      
      'Comic.view.Comic', 
      'Comic.view.ComicSettings',
      'Comic.RemoteApi'
      
    ],

    config: {
        refs: {
          comicview: 'comicview',
          comicsettingsview: 'comicsettingsview',
          zoomOnTap: 'comicsettingsview [name=zoom_on_tap]',
          togglePagingBar: 'comicsettingsview [name=toggle_paging_bar]',
          usePageTurnDrag: 'comicsettingsview [name=use_page_turn_drag]',
          pageTurnDragThreshold: 'comicsettingsview [name=page_turn_drag_threshold]',
          usePageChangeArea: 'comicsettingsview [name=use_page_change_area]',
          pageChangeAreaWidth: 'comicsettingsview [name=page_change_area_width]',
          openNextComic: 'comicsettingsview [name=open_next_comic]',
          //openCurrentComicAtLaunch: 'comicsettingsview [name=open_current_comic_at_launch]',
          pageFitMode: 'comicsettingsview [name=page_fit_mode]'
        },
        
        control: {
          comicsettingsview: {
            show: 'onShow',
            hide: 'onHide'
          },
          
          usePageTurnDrag: {
            change: 'onChangeUsePageTurnDrag'
          },
          usePageChangeArea: {
            change: 'onChangeUsePageChangeArea'
          }
          
          
        }
    },

    launch: function()
    {
      // called before application.launch()
    },
    
    init: function()
    {
      var me = this;
      
      Comic.settings = {};
      Comic.viewstate = {};
      Comic.viewstate.current_comic_id = 0;
      Comic.new_comic_id = 0;
      
      // called before application.launch()
      console.log('Initialized ComicViewer! This happens before the Application launch function is called');
      
      
    },
      
      
    onShow: function() {
      var me = this,
          comicsettingsview = me.getComicsettingsview(),
          pageTurnDragThreshold = me.getPageTurnDragThreshold(),
          pageChangeAreaWidth = me.getPageChangeAreaWidth();
             
      comicsettingsview.setValues({
        open_current_comic_at_launch: Comic.settings.open_current_comic_at_launch,
        open_next_comic: Comic.settings.open_next_comic,
        zoom_on_tap: Comic.settings.zoom_on_tap,
        page_fit_mode: Comic.settings.page_fit_mode,
        toggle_paging_bar: Comic.settings.toggle_paging_bar,
        use_page_turn_drag: (Comic.settings.page_turn_drag_threshold < 1000),
        page_turn_drag_threshold: (Comic.settings.page_turn_drag_threshold < 1000) ? Comic.settings.page_turn_drag_threshold : 50,
        use_page_change_area: (Comic.settings.page_change_area_width > 0),
        page_change_area_width: (Comic.settings.page_change_area_width > 0) ? Comic.settings.page_change_area_width : 75
      });
      

      if (Comic.settings.page_change_area_width > 0)
      {
        pageChangeAreaWidth.enable();
      }
      else
      {
        pageChangeAreaWidth.disable();
      }
        
      if (Comic.settings.page_turn_drag_threshold < 1000)
      {
        pageTurnDragThreshold.enable();
      }
      else
      {
        pageTurnDragThreshold.disable();
      }
      
    },
    
    onHide: function() {
      var me = this,
          comicsettingsview = me.getComicsettingsview(),
          values = comicsettingsview.getValues(),
          comicview = me.getComicview();
        
      Comic.settings.open_current_comic_at_launch = values.open_current_comic_at_launch ? true : false;
      Comic.settings.open_next_comic = values.open_next_comic ? true : false;;
      Comic.settings.zoom_on_tap = values.zoom_on_tap;
      Comic.settings.page_fit_mode = values.page_fit_mode;
      Comic.settings.toggle_paging_bar = values.toggle_paging_bar;
      Comic.settings.page_turn_drag_threshold = values.use_page_turn_drag ? values.page_turn_drag_threshold : 1000;
      Comic.settings.page_change_area_width = values.use_page_change_area ? values.page_change_area_width : 0;
      
      Comic.RemoteApi.SetSettings(Comic.settings, function(provider, response) 
        {
          console.log('Settings saved');
          var comiccontroller = me.getApplication().getController('Comic');
          comiccontroller.UpdateSettings();
        });
    },
    
    
    onChangeUsePageTurnDrag: function( checkbox, newValue, oldValue, eOpts  )
    {
      var pageTurnDragThreshold = this.getPageTurnDragThreshold();
      
      if (newValue == 1)
      {
        pageTurnDragThreshold.enable();
        //pageTurnDragThreshold.setValue(pageTurnDragThreshold.getMinValue());
      }
      else
      {
        pageTurnDragThreshold.disable();
        //pageTurnDragThreshold.setValue(pageTurnDragThreshold.getMinValue());
      }
    },
    onChangeUsePageChangeArea: function( checkbox, newValue, oldValue, eOpts )
    {
      var pageChangeAreaWidth = this.getPageChangeAreaWidth();
      
      if (newValue == 1)
      {
        pageChangeAreaWidth.enable();
      }
      else
      {
        pageChangeAreaWidth.disable();
      }
    }    
});