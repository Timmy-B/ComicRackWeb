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
      '<img height="64px" class="cover" src="' + BcrBaseUrl + '/BCR/Comics/{Id}/Pages/0?height=64"/>\
      <span class="caption">{Caption}</span></br>\
      <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
      <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
      <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>',
      {
        // XTemplate configuration:
        disableFormats: true,
        containerCls: 'layout-style-list small'
      }
    );

ComicListItemTemplates[Comic.Enums.ComicListLayout.LIST_MEDIUM] = new Ext.XTemplate(
      '<img height="128px" class="cover" src="' + BcrBaseUrl + '/BCR/Comics/{Id}/Pages/0?height=128"/>\
      <span class="caption">{Caption}</span></br>\
      <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
      <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
      <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>',
      {
        // XTemplate configuration:
        disableFormats: true,
        containerCls: 'layout-style-list medium'
      }
    );

ComicListItemTemplates[Comic.Enums.ComicListLayout.LIST_LARGE] = new Ext.XTemplate(
      '<img height="256px" class="cover" src="' + BcrBaseUrl + '/BCR/Comics/{Id}/Pages/0?height=256"/>\
      <span class="caption">{Caption}</span></br>\
      <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
      <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
      <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>',
      {
        // XTemplate configuration:
        disableFormats: true,
        containerCls: 'layout-style-list large'
      }
    );


// Use one template instance for all list items instead of creating one for each list item separately.....
ComicListItemTemplates[Comic.Enums.ComicListLayout.GRID_SMALL] = new Ext.XTemplate(
    '<img class="cover" src="' + BcrBaseUrl + '/BCR/Comics/{Id}/Pages/0?height=64"/></br>\
    <span class="caption">{Caption}</span></br>',
    {
      // XTemplate configuration:
      disableFormats: true,
      containerCls: 'layout-style-grid small'
    }
  );

ComicListItemTemplates[Comic.Enums.ComicListLayout.GRID_MEDIUM] = new Ext.XTemplate(
    '<img class="cover" src="' + BcrBaseUrl + '/BCR/Comics/{Id}/Pages/0?height=128"/></br>\
    <span class="caption">{Caption}</span></br>\
    <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
    <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
    <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>',
    {
      // XTemplate configuration:
      disableFormats: true,
      containerCls: 'layout-style-grid medium'
    }
  );

ComicListItemTemplates[Comic.Enums.ComicListLayout.GRID_LARGE] = new Ext.XTemplate(
    '<img class="cover" src="' + BcrBaseUrl + '/BCR/Comics/{Id}/Pages/0?height=256"/></br>\
    <span class="caption">{Caption}</span></br>\
    <span class="published">Published: {[LayoutFunctions.getPublishedDate(values)]}</span></br>\
    <span class="progress">Progress: {[LayoutFunctions.getProgressText(values)]}</span></br>\
    <span class="last_opened">Last opened: {[LayoutFunctions.getOpenedDate(values)]}</span>',
    {
      // XTemplate configuration:
      disableFormats: true,
      containerCls: 'layout-style-grid large'
    }
  );


Ext.define('Comic.view.ComicList', {
  extend: 'Ext.DataView',
    xtype: 'comiclistview',
    
    requires: [ 
      'Comic.plugin.DataViewPaging',
      'Ext.DataView'
    ],
    
    config: {
      title: 'Comics',
      cls: 'comiclist',
      //baseCls: 'comiclist',

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
    },

    UpdateLayout: function()
    {
      var me = this,
          layout = Comic.ordersettings.get('layout');

      me.setItemTpl(ComicListItemTemplates[layout]);
      me.setItemCls(ComicListItemTemplates[layout].containerCls);
      switch (Comic.ordersettings.get('theme'))
      {
        case Comic.Enums.Theme.LITE:
          me.setCls('comiclist lite');
          break;
        case Comic.Enums.Theme.NORMAL:
        default:
          me.setCls('comiclist');
          break;
      }
      
    }
});