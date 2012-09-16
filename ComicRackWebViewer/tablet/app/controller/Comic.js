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

Ext.define('Comic.controller.Comic', {
    extend: 'Ext.app.Controller',
    
    requires: [ 
      'Comic.view.Main',
      'Comic.view.Comic', 
      'Comic.view.ComicSettings',
      'Comic.view.ComicInfo',
      'Comic.RemoteApi',
      'Comic.store.ComicBook',
    ],

    config: {
        refs: {
          mainview: 'mainview',
          comicview: 'comicview',
          backbutton: 'comicview #backbutton',
          comictitle: 'comicview titlebar',
          toolbar: 'comicview toolbar',          
          slider: 'comicview #slider',
          progressbutton: 'comicview #progressbutton',
          nextbutton: 'comicview #nextbutton',
          previousbutton: 'comicview #previousbutton',
          settingsbutton: 'comicview #settingsbutton',
          infobutton: 'comicview #infobutton',
          nextPageIcon: 'comicview #nextPageIcon',
          prevPageIcon: 'comicview #prevPageIcon',
          loadingIndicator: 'comicview #loadingIndicator',
          imageviewer: 'comicview #imageviewer',
          comicsettingsview: { selector: 'comicsettingsview', xtype: 'comicsettingsview', autoCreate: true },
          comicinfoview: { selector: 'comicinfoview', xtype: 'comicinfoview', autoCreate: true },
        },
        
        control: {
          comicview: {
            show: 'onShow', // also triggered when the comic view is popped from the main navigation view.... so use active event instead
            hide: 'onHide',
            singletap: 'onTap',
            activate: 'onActivate',
          },
          
          slider: {
            change: 'onSliderChange'
          },
          progressbutton: {
            tap: 'onProgressButton'
          },
          nextbutton: {
            tap: 'onNextButton'
          },
          previousbutton: {
            tap: 'onPreviousButton'
          },
          settingsbutton: {
            tap: 'onSettingsButton'
          },
          infobutton: {
            tap: 'onInfoButton'
          },
          backbutton: {
            tap: 'onBackButton'
          },
                    
          imageviewer: {
            imageLoaded: 'onImageLoaded',
            imageError: 'onImageError',
            zoomByTap: 'onZoomByTap',
            initDone: 'onImageViewerInitDone',
            singletap: 'onSingleTap',
          },
          
          
        },
    },
    
    init : function()
    {
        
      // called before application.launch()
      var me = this;
            
      me.preload_count = 0; // number of pages to preload before and after the current page.
                            // if 0, preloading is disabled.
      
      me.cache = []; // cache of preloaded page info
      me.waiting_for_page = -1; // page that must be displayed once loaded.

      Ext.Viewport.on("orientationchange", function() { 
        //alert("orientationchange"); 
        var imageviewer = me.getImageviewer();
        imageviewer.resize(); 
      });
      /*
        if (Ext.Viewport.supportsOrientation()) 
        {
          alert('supportsOrientation()');
        }
        else 
        {
          alert('NOT supportsOrientation()');
        }  
      */
      
      
    },
    
    UpdateSettings: function()
    {
      var me = this;
      var imageviewer = me.getImageviewer();
      // 1: Fit width, 2: Full page
      if (Comic.settings.page_fit_mode == 2)
      {
        imageviewer.setAutoFitWidth(true);
        imageviewer.setAutoFitHeight(true);
      }
      else
      {
        // fit width
        imageviewer.setAutoFitWidth(true);
        imageviewer.setAutoFitHeight(false);
      }
      
      imageviewer.setZoomOnSingleTap(Comic.settings.zoom_on_tap == 1);
      imageviewer.setZoomOnDoubleTap(Comic.settings.zoom_on_tap == 2);
      
      imageviewer.resize();
    },
    
    onImageViewerInitDone: function()
    {
      var me = this;
      var imageviewer = me.getImageviewer();
      
      imageviewer.setResizeOnLoad(true);
      imageviewer.setErrorImage('resources/no_image_available.jpg');
      
      // 1: Fit width, 2: Full page
      if (Comic.settings.page_fit_mode == 2)
      {
        imageviewer.setAutoFitWidth(true);
        imageviewer.setAutoFitHeight(true);
      }
      else
      {
        // fit width
        imageviewer.setAutoFitWidth(true);
        imageviewer.setAutoFitHeight(false);
      }
      
      imageviewer.setZoomOnSingleTap(Comic.settings.zoom_on_tap == 1);
      imageviewer.setZoomOnDoubleTap(Comic.settings.zoom_on_tap == 2);
      
      // For some reason, I can't access the figure element via the controller refs and control options....
      imageviewer.figEl.addListener({
          scope: me,
          singletap: me.onSingleTap,
          doubletap: me.onDoubleTap,
          drag: me.onDrag,
          dragend: me.onDragEnd,
      });  
    },
    
    onHide: function()
    {
      
    },

    onShow: function() 
    {
      // useless event, gets triggered when the view is popped from a navigation view.....
    },

    
    onActivate: function()
    {
      var me = this,
          titlebar = me.getComictitle(),
          imageviewer = me.getImageviewer();
      
      me.cache.length = 0;
      me.waiting_for_page = -1;
      imageviewer.setLoadingMask(false);
      
      if (Comic.new_comic_id == 0)
      {
        titlebar.setTitle('No comic selected');
        
        imageviewer.loadImage('resources/no_image_available.jpg');
      }
      else
      {
        titlebar.setTitle('Opening comic...');
        Comic.viewstate.current_comic_id = Comic.new_comic_id;
        // Get new comic from server
        Comic.RemoteApi.GetComicInfo(Comic.viewstate.current_comic_id, function(success, record) {
          if (success)
          {
            // process response
            me.current_comic = record.getData();
            me.comic_title = Comic.RemoteApi.GetComicTitle(me.current_comic);

            Comic.viewstate.current_comic_opened_from_type = 'folder';
            Comic.viewstate.current_comic_opened_from_id = Comic.context.id;

            /*
            Comic.RemoteApi.SetViewState({ current_comic_id: Comic.viewstate.current_comic_id, 
                                        current_comic_opened_from_type: Comic.viewstate.current_comic_opened_from_type,
                                        current_comic_opened_from_id: Comic.viewstate.current_comic_opened_from_id });
            */
                        
            me.current_page_nr = me.current_comic.LastPageRead | 0;
            // use defer so control initialization can finish first
            Ext.defer(function() { me.ShowPage(me.current_page_nr); } , 10);
          }
          else
          {
            Ext.Msg.alert('Loading failed');
          }
        });
      }
    },
    
    onDrag: function(/*Ext.event.Event*/ event, /*HTMLElement*/ node, /*Object*/ options, /*Object*/ eOpts) 
    { 
      var me = this;
          imageviewer = me.getImageviewer(),
          scroller = imageviewer.getScrollable().getScroller(),
          nextPageIcon = me.getNextPageIcon(),
          prevPageIcon = me.getPrevPageIcon();
      
      if ((scroller.position.x < scroller.getMinPosition().x - Comic.settings.page_turn_drag_threshold) || 
          (scroller.position.y < scroller.getMinPosition().y - Comic.settings.page_turn_drag_threshold))
      {
        prevPageIcon.show();
      }
      else
      if ((scroller.position.x > scroller.getMaxPosition().x + Comic.settings.page_turn_drag_threshold) || 
          (scroller.position.y > scroller.getMaxPosition().y + Comic.settings.page_turn_drag_threshold))
      {
        nextPageIcon.show();
      }
      else
      {
        prevPageIcon.hide();
        nextPageIcon.hide();
      }
        
    },
    
    onDragEnd: function(/*Ext.event.Event*/ event, /*HTMLElement*/ node, /*Object*/ options, /*Object*/ eOpts) 
    { 
      var me = this;
      var imageviewer = me.getImageviewer();
      var scroller = imageviewer.getScrollable().getScroller();
      
      if ((scroller.position.x < scroller.getMinPosition().x - Comic.settings.page_turn_drag_threshold) || 
          (scroller.position.y < scroller.getMinPosition().y - Comic.settings.page_turn_drag_threshold))
        this.onPreviousButton();
      else
      if ((scroller.position.x > scroller.getMaxPosition().x + Comic.settings.page_turn_drag_threshold) || 
          (scroller.position.y > scroller.getMaxPosition().y + Comic.settings.page_turn_drag_threshold))
        this.onNextButton();
    },
    
    onSliderChange: function(slider) 
    {
      var me = this;
      me.current_page_nr = Math.round((me.current_comic.PageCount-1) * slider.getValue() / SLIDER_RANGE);
      me.ShowPage(me.current_page_nr);
    },
              
    onProgressButton: function() 
    {
    /*
      var me = this;
      delete me.cache[me.current_page_nr];
      me.ShowPage(me.current_page_nr);
    */
    },
    
    onNextButton: function() 
    {
      var me = this,
          nextPageIcon = me.getNextPageIcon();
          
      if (me.current_page_nr < (me.current_comic.PageCount-1))
      {
        
        nextPageIcon.show();
        //Ext.defer(function() { this.hide(); }, 500, nextPageIcon);
        Ext.defer(function() { me.ShowPage(++me.current_page_nr); }, 150);
        //me.ShowPage(++me.current_page_nr);
        
      }
      else
      {
        /*
        if (Comic.settings.open_next_comic == 1)
        {
          // TODO: need a way to determine what is the next comic...
        }
        else
        */
        {
          me.onBackButton();
        }
      }
    },
    
    onPreviousButton: function() 
    {
      var me = this,
          prevPageIcon = me.getPrevPageIcon();
          
      if (me.current_page_nr > 0)
      {
        prevPageIcon.show();
        Ext.defer(function() { this.hide(); }, 500, prevPageIcon);
        Ext.defer(function() { me.ShowPage(--me.current_page_nr); }, 150);
        //me.ShowPage(--me.current_page_nr);
      }
      else
      {
        me.onBackButton();
      }
    },   
    
    
    onBackButton: function() 
    {
      Comic.viewstate.current_comic_id = null;
      Comic.viewstate.current_comic_opened_from_type = null;
      Comic.viewstate.current_comic_opened_from_id = null;
      Comic.RemoteApi.SetViewState({ current_comic_id: Comic.viewstate.current_comic_id, 
                                    current_comic_opened_from_type: Comic.viewstate.current_comic_opened_from_type,
                                    current_comic_opened_from_id: Comic.viewstate.current_comic_opened_from_id });
      
      var me = this;
      var d=new Date();
      var n=d.toJSON(); 
      Comic.context.record.beginEdit();
      Comic.context.record.set("Opened", n);
      Comic.context.record.set("OpenCount", 1);
      Comic.context.record.set("CurrentPage", me.current_page_nr);
      Comic.context.record.set("LastPageRead", me.current_page_nr);
      Comic.context.record.endEdit();
      Comic.context.record.commit();
      this.getMainview().pop(1);
    },   
   
    onSingleTap: function(/*Ext.event.Event*/ event, /*HTMLElement*/ node, /*Object*/ options, /*Object*/ eOpts)
    {
      // This handler is called for both the figure and its image element, because of event bubbling.
      // If clicked in the image, then the event for the image comes before the event of the figure.
      // In order to prevent double page turns, stop event propagation here.
      var me = this;
      if (event.pageX < Comic.settings.page_change_area_width)
      {
        me.onPreviousButton();
        event.stopPropagation();
        return true;
      }
      else
      if (event.pageX > window.outerWidth - Comic.settings.page_change_area_width)
      {
        me.onNextButton();
        event.stopPropagation();
        return true;
      }
      else
      {
        if (Comic.settings.toggle_paging_bar == 1)
        {
          me.onToggleToolbars();
        }
        
        event.stopPropagation();
        return false;
      }
    },
    
    onDoubleTap: function(/*Ext.event.Event*/ event, /*HTMLElement*/ node, /*Object*/ options, /*Object*/ eOpts)
    {
      // This handler is called for both the figure and its image element, because of event bubbling.
      // If clicked in the image, then the event for the image comes before the event of the figure.
      // In order to prevent double page turns, stop event propagation here.
      var me = this;
      
      if (Comic.settings.toggle_paging_bar == 2)
      {
        me.onToggleToolbars();
      }
      
      event.stopPropagation();
      return false;
    },
    
    onToggleToolbars: function(ev, t)
    {
      var titlebar = this.getComictitle();
      var toolbar = this.getToolbar();
            
      if (titlebar.isHidden())
      {
        titlebar.show();
        toolbar.show();
      }
      else
      {
        titlebar.hide();
        toolbar.hide();
      }
        
      // no further processing
      return false;
    },
    
    onZoomByTap: function(ev, t)
    {
      return true;
    },
    
    onImageError: function()
    {
      var me = this;
      console.log('Error while loading the image.');
    },
    
    onImageLoaded: function()
    {
      var me = this,
          imageviewer = me.getImageviewer(),
          scroller = imageviewer.getScrollable().getScroller(),
          nextPageIcon = me.getNextPageIcon(),
          previousPageIcon = me.getPrevPageIcon();
          
      
      console.log('comic onImageLoaded');
      //scroller.stopAnimation();
      me.getLoadingIndicator().hide();
            
      nextPageIcon.hide();
      previousPageIcon.hide();
      
      scroller.scrollTo(0,0,false);
      me.getSlider().setValue((me.current_page_nr / (me.current_comic.PageCount-1)) * SLIDER_RANGE);
      
      if (me.preload_count > 0)
        Ext.defer(function() { 
          //me.PreloadPages(); 
          me.PreloadPage(me.current_page_nr+1);
        }, 10 );

      
      if (me.current_comic)
      {
        
      }
    },
   
    onInfoButton: function()
    {
      var me = this,
          view = me.getComicinfoview();
        
      view.comic = me.current_comic;
      me.getMainview().push(view);
    },
    
    onSettingsButton: function()
    {
      var me = this;
      
      if (!me.overlay) 
      {
        me.overlay = Ext.Viewport.add(me.getComicsettingsview());
      }

      me.overlay.show();
    },
   
    ShowPage: function(pagenr)
    {
      var me = this,
         imageviewer = me.getImageviewer(),
         scroller = imageviewer.getScrollable().getScroller(),
         titlebar = me.getComictitle(),
         progressbutton = me.getProgressbutton();
         
      
      if (pagenr < 0 || pagenr >= me.current_comic.PageCount)
      {
        console.log("pagenr " + pagenr + " out of bounds [0.."+(me.current_comic.PageCount-1)+"]");
        return;
      }
      
      titlebar.setTitle(me.comic_title + " " + (pagenr + 1)+ "/" + me.current_comic.PageCount);
      // todo: show loading indicator in toolbar and remove it when image is loaded.
      
      progressbutton.setText("" + (pagenr + 1)+ "/" + me.current_comic.PageCount);
      
      var now = (new Date()).toJSON(); 

      Comic.RemoteApi.SetComicInfo(Comic.viewstate.current_comic_id, { OpenedTime: now, OpenedCount: 1, CurrentPage: me.current_page_nr, LastPageRead: me.current_page_nr },
      function() {
      
        scroller.scrollTo(0,0,false);

        me.getSlider().setValue((pagenr / (me.current_comic.PageCount-1)) * SLIDER_RANGE);
        
        if ((me.preload_count > 0) && me.cache[pagenr] && me.cache[pagenr].img)
        { 
          console.log("showpage from cache");
          
          imageviewer.loadImage(me.cache[pagenr].src);
          /*
          imageviewer.setImage(me.cache[pagenr].img);
          me.cache[pagenr].img = null;
          delete me.cache[pagenr].img;
          */
        }
        else
        {
          console.log("showpage loadimage");
         
          me.waiting_for_page = pagenr;
          me.getLoadingIndicator().show();
          
          imageviewer.loadImage(Comic.RemoteApi.GetImageUrl(me.current_comic.Id, pagenr));
        }
      });
    }, 
    
   
    PreloadPage: function(pagenr)
    {
      var me = this;
      if (pagenr < 0 || pagenr >= me.current_comic.PageCount)
        return;
        
      if (me.cache[pagenr])
      {
        if (!me.cache[pagenr].img)
          me.PreloadImage(pagenr);
          
        return;
      }

      me.cache[pagenr] = {};
      me.cache[pagenr].src = Comic.RemoteApi.GetImageUrl(me.current_comic.Id, pagenr);
      me.PreloadImage(pagenr);
    },
    
    PreloadImage: function(pagenr)
    {
      var me = this,
          pagenr = pagenr;
      
      if (pagenr < 0 || pagenr >= me.current_comic.PageCount)
        return;
        
      if (!me.cache[pagenr])
      {
        console.log("PreloadImage called with no cache entry for page " + pagenr);
        return;
      }
      
      console.log("cache preload");
      
      me.cache[pagenr].img = Ext.dom.Element.get(new Image());
      me.cache[pagenr].img.dom.src = me.cache[pagenr].src;
      me.cache[pagenr].img.dom.onload = function()
              {
                console.log("cache onload");
              };
      me.cache[pagenr].img.dom.onerror = function()
              {
                //Ext.Msg.alert('Error while loading image ' + image.getSrc());
                console.log('Error while loading image ' );
                //me.cache[pagenr].img.destroy();
                //delete me.cache[pagenr].img;
              };
      
      
      
      //me.cache[pagenr].img = Ext.create('Ext.Img', {
      //    src: me.cache[pagenr].src,
      //    mode: 'element', // create <img> instead of <div>
      //    listeners: {
      //      load: function( /*Ext.Img*/ image, /*Ext.EventObject*/ e, /*Object*/ eOpts )
      //        {
      //          console.log("cache onload");
      //        },
      //      error: function( /*Ext.Img*/ image, /*Ext.EventObject*/ e, /*Object*/ eOpts )
      //        {
      //          Ext.Msg.alert('Error while loading image ' + image.getSrc());
      //          console.log('Error while loading image ' + image.getSrc());
      //          me.cache[pagenr].img.destroy();
      //          delete me.cache[pagenr].img;
      //        },
      //    }
      //});
    },

    PreloadPages: function()
    {
      var me = this,
          i = 0;
      // Clear old cache images, not the page info.
      for (i = 0; i <= me.current_page_nr - me.preload_count - 1; i++)
      {
        if (me.cache[i] && me.cache[i].img)
        {
          me.cache[i].img.destroy();
          delete me.cache[i].img;
        }
      }
      
      for (i = me.current_page_nr + me.preload_count + 1; i < me.current_comic.PageCount; i++)
      {
        if (me.cache[i] && me.cache[i].img)
        {
          me.cache[i].img.destroy();
          delete me.cache[i].img;
        }
      }
      
      // Preload the next and previous pages.
      for (i = me.current_page_nr+1; i <= me.current_page_nr + me.preload_count; i++)
        me.PreloadPage(i);
        
      for (i = me.current_page_nr - 1; i >= me.current_page_nr - me.preload_count; i--)
        me.PreloadPage(i);
    },


});