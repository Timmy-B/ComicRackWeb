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


var LayoutFunctions = {
  // member functions:
  getProgressText: function (comic)
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
  getOpenedDate: function (comic)
  {
    return comic.UserOpenedTimeAsText === null ? 'Never' : Ext.Date.format(comic.UserOpenedTimeAsText, "Y/m/d");
  },
  getPublishedDate: function (comic)
  {
    return (comic.PublishedAsText === null || comic.PublishedAsText.getFullYear() == 1) ? '---' : Ext.Date.format(comic.PublishedAsText, "Y/m");
  }
};

var ComicListItemTemplates = [];

ComicListItemTemplates[EnumComicListLayout.LIST_SMALL] = new Ext.XTemplate(
      '<div class="comiclist-item layout-list-small"><img height="64px" class="cover" src="' + bcrBase + '/BCR/Comics/{Id}/Pages/0?height=64"/>\
      <span class="caption">{Caption}</span></br>\
      <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
      <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
      <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>\
      </div>',
      {
        // XTemplate configuration:
        disableFormats: true,
        containerCls: 'layout-style-list'
      }
    );

ComicListItemTemplates[EnumComicListLayout.LIST_MEDIUM] = new Ext.XTemplate(
      '<div class="comiclist-item layout-list-medium"><img height="128px" class="cover" src="' + bcrBase + '/BCR/Comics/{Id}/Pages/0?height=128"/>\
      <span class="caption">{Caption}</span></br>\
      <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
      <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
      <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>\
      </div>',
      {
        // XTemplate configuration:
        disableFormats: true,
        containerCls: 'layout-style-list'
      }
    );

ComicListItemTemplates[EnumComicListLayout.LIST_LARGE] = new Ext.XTemplate(
      '<div class="comiclist-item layout-list-large"><img height="256px" class="cover" src="' + bcrBase + '/BCR/Comics/{Id}/Pages/0?height=256"/>\
      <span class="caption">{Caption}</span></br>\
      <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
      <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
      <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>\
      </div>',
      {
        // XTemplate configuration:
        disableFormats: true,
        containerCls: 'layout-style-list'
      }
    );


// Use one template instance for all list items instead of creating one for each list item separately.....
ComicListItemTemplates[EnumComicListLayout.GRID_SMALL] = new Ext.XTemplate(
    '<div class="comiclist-item layout-grid-small">\
    <img class="cover" src="' + bcrBase + '/BCR/Comics/{Id}/Pages/0?height=64"/></br>\
    <span class="caption">{Caption}</span></br>\
    </div>',
    {
      // XTemplate configuration:
      disableFormats: true,
      containerCls: 'layout-style-grid'
    }
  );

ComicListItemTemplates[EnumComicListLayout.GRID_MEDIUM] = new Ext.XTemplate(
    '<div class="comiclist-item layout-grid-medium">\
    <img class="cover" src="' + bcrBase + '/BCR/Comics/{Id}/Pages/0?height=128"/></br>\
    <span class="caption">{Caption}</span></br>\
    <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
    <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
    <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>\
    </div>',
    {
      // XTemplate configuration:
      disableFormats: true,
      containerCls: 'layout-style-grid'
    }
  );

ComicListItemTemplates[EnumComicListLayout.GRID_LARGE] = new Ext.XTemplate(
    '<div class="comiclist-item layout-grid-large">\
    <img class="cover" src="' + bcrBase + '/BCR/Comics/{Id}/Pages/0?height=256"/></br>\
    <span class="caption">{Caption}</span></br>\
    <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
    <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
    <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>\
    </div>',
    {
      // XTemplate configuration:
      disableFormats: true,
      containerCls: 'layout-style-grid'
    }
  );


Ext.define('Comic.view.ComicList', {
    //extend: 'Ext.ux.BufferedList',
  //extend: 'Ext.dataview.List',
  extend: 'Ext.DataView',
    xtype: 'comiclistview',
    
    requires: [ 
      'Comic.plugin.DataViewPaging',
      'Ext.DataView',
      'Ext.dataview.List',
      'Comic.view.ComicListSort'
    ],


    config: {
      title: 'Comics',
      //itemTpl: TheComicListItemTemplate,
      cls: 'comiclist',
      //cls: 'list',
      //itemCls: 'comiclist-item',

      plugins: [
        {
          xclass: 'plugin.dataviewpaging',
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
              },
              {
                xtype: 'button',
                align: 'right',
                itemId: 'refreshbutton',
                iconCls: 'refresh',
                iconMask: true,
              },
              {
                xtype: 'button',
                align: 'right',
                itemId: 'settingsbutton',
                //icon: 'resources/images/settings.png',
                iconCls: 'settings',
                iconMask: true
              }
            ]
        }

        //,
        //{
        //  docked: 'top',
        //  xtype: 'toolbar',
        //  ui: 'light',
        //  //title: 'Filter',
        //  //align: 'left',
        //  itemId: 'ordertoolbar',
        //  inline: true,
        //  items: [
        //    {
        //      xtype: 'label',
        //      html: '1st order',
        //      style: {
        //        fontSize: '12px'
        //      }
        //    },
        //    {
        //      xtype: 'selectfield',
        //      //label: '1st Sort by',
        //      //labelWidth: '60%',
        //      defaultTabletPickerConfig: {
        //        height: '90%'
        //      },
        //      maxWidth: '100px',
        //      name: 'orderby_1',
        //      itemId: 'orderby_1',
        //      value: EnumOrderBy.CAPTION,
        //      style: {
        //        fontSize: '12px'
        //      },
        //      options: [
        //        {
        //          text: 'Caption',
        //          value: EnumOrderBy.CAPTION
        //        },
        //        {
        //          text: 'Series',
        //          value: EnumOrderBy.SERIES
        //        },
        //        {
        //          text: 'Volume',
        //          value: EnumOrderBy.VOLUME
        //        },
        //        {
        //          text: 'Title',
        //          value: EnumOrderBy.TITLE
        //        },
        //        {
        //          text: 'Number',
        //          value: EnumOrderBy.NUMBER
        //        },
        //        {
        //          text: 'Year',
        //          value: EnumOrderBy.YEAR
        //        },
        //        {
        //          text: 'File',
        //          value: EnumOrderBy.FILE
        //        },
        //        {
        //          text: 'Last Opened',
        //          value: EnumOrderBy.LAST_OPENED
        //        },
        //        {
        //          text: 'Publish date',
        //          value: EnumOrderBy.PUBLISH_DATE
        //        }

        //      ]
        //    },          
        //    {
        //      xtype: 'selectfield',
        //      //label: 'Direction',
        //      //labelWidth: '60%',
        //      maxWidth: '100px',
        //      name: 'direction_1',
        //      itemId: 'direction_1',
        //      value: EnumDirection.ASCENDING,
        //      style: {
        //        fontSize: '12px'
        //      },
        //      options: [
        //        {
        //          text: 'Ascending',
        //          value: EnumDirection.ASCENDING
        //        },
        //        {
        //          text: 'Descending',
        //          value: EnumDirection.DESCENDING
        //        }
        //      ]
        //    },
        //    {
        //      xtype: 'label',
        //      html: '2nd order',
        //      style: {
        //        fontSize: '12px'
        //      }
        //    },
        //    {
        //      xtype: 'selectfield',
        //      //label: '2nd Sort by',
        //      //labelWidth: '60%',
        //      defaultTabletPickerConfig: {
        //        height: '90%'
        //      },
        //      style: {
        //        fontSize: '12px'
        //      },
        //      maxWidth: '100px',
        //      name: 'orderby_2',
        //      itemId: 'orderby_2',
        //      value: EnumOrderBy.NONE,
        //      options: [
        //        {
        //          text: '[none]',
        //          value: EnumOrderBy.NONE
        //        },
        //        {
        //          text: 'Caption',
        //          value: EnumOrderBy.CAPTION
        //        },
        //        {
        //          text: 'Series',
        //          value: EnumOrderBy.SERIES
        //        },
        //        {
        //          text: 'Volume',
        //          value: EnumOrderBy.VOLUME
        //        },
        //        {
        //          text: 'Title',
        //          value: EnumOrderBy.TITLE
        //        },
        //        {
        //          text: 'Number',
        //          value: EnumOrderBy.NUMBER
        //        },
        //        {
        //          text: 'Year',
        //          value: EnumOrderBy.YEAR
        //        },
        //        {
        //          text: 'File',
        //          value: EnumOrderBy.FILE
        //        },
        //        {
        //          text: 'Last Opened',
        //          value: EnumOrderBy.LAST_OPENED
        //        },
        //        {
        //          text: 'Publish date',
        //          value: EnumOrderBy.PUBLISH_DATE
        //        }
        //      ]
        //    },          
        //    {
        //      xtype: 'selectfield',
        //      //label: 'Direction',
        //      //labelWidth: '60%',
        //      name: 'direction_2',
        //      itemId: 'direction_2',
        //      value: EnumDirection.ASCENDING,
        //      maxWidth: '100px',
        //      style: {
        //        fontSize: '12px'
        //      },
        //      options: [
        //        {
        //          text: 'Ascending',
        //          value: EnumDirection.ASCENDING
        //        },
        //        {
        //          text: 'Descending',
        //          value: EnumDirection.DESCENDING
        //        }
        //      ]
        //    },
        //    //{
        //    //  xtype: 'button',
        //    //  itemId: 'refreshbutton',
        //    //  align: 'right',
        //    //  iconCls: 'refresh',
        //    //  iconMask: true,
        //    //  style: {
        //    //    fontSize: '12px'
        //    //  }
        //    //},
        //    {
        //      xtype: 'selectfield',
        //      //label: 'Layout',
        //      //labelWidth: '60%',
        //      //maxWidth: '100px',
        //      name: 'layout',
        //      itemId: 'layout',
        //      value: 2,
        //      style: {
        //        fontSize: '12px'
        //      },
        //      options: [
        //        {
        //          text: 'List small',
        //          value: EnumComicListLayout.LIST_SMALL
        //        },
        //        {
        //          text: 'List medium',
        //          value: EnumComicListLayout.LIST_MEDIUM
        //        },
        //        {
        //          text: 'List large',
        //          value: EnumComicListLayout.LIST_LARGE
        //        },
        //        {
        //          text: 'Grid small',
        //          value: EnumComicListLayout.GRID_SMALL
        //        },
        //        {
        //          text: 'Grid medium',
        //          value: EnumComicListLayout.GRID_MEDIUM
        //        },
        //        {
        //          text: 'Grid large',
        //          value: EnumComicListLayout.GRID_LARGE
        //        }
        //      ]
        //    }
        //  ]
        //}
        
      ]
    }
});