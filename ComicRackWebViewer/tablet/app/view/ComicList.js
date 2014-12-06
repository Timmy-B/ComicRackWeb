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

ComicListItemTemplates[Comic.Enums.ComicListLayout.LIST_SMALL] = new Ext.XTemplate(
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

ComicListItemTemplates[Comic.Enums.ComicListLayout.LIST_MEDIUM] = new Ext.XTemplate(
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

ComicListItemTemplates[Comic.Enums.ComicListLayout.LIST_LARGE] = new Ext.XTemplate(
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
ComicListItemTemplates[Comic.Enums.ComicListLayout.GRID_SMALL] = new Ext.XTemplate(
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

ComicListItemTemplates[Comic.Enums.ComicListLayout.GRID_MEDIUM] = new Ext.XTemplate(
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

ComicListItemTemplates[Comic.Enums.ComicListLayout.GRID_LARGE] = new Ext.XTemplate(
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
                text: 'Lists',
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
                iconCls: 'settings',
                iconMask: true
              }
            ]
        }
      ]
    }
});