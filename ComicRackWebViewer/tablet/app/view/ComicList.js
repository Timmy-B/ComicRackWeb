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
  
// Use one template instance for all list items instead of creating one for each list item separately.....
var TheComicListItemTemplate = new Ext.XTemplate(
    '<img class="cl-img" src="/BCR/Comics/{Id}/Pages/0?height=64"/>{[this.getTitleText(values)]}</br><span class="progress">{[this.getProgressText(values)]}</span><span class="date_last_read">{[this.getOpenedDate(values)]}</span>',
    {
      // XTemplate configuration:
      disableFormats: true,
      // member functions:
      getTitleText: function(comic)
      {
        return comic.Caption;
      },
      getProgressText: function(comic)
      {
        if (comic.PageCount == 0)
          return "no pages"; // BUG: This comic should never have been added to the database.....
        
        if ((comic.LastPageRead + 1) == comic.PageCount)
          return "finished";
        else
          return (comic.LastPageRead + 1) + "/" + comic.PageCount;
      },
      getOpenedDate: function(comic)
      {
        return comic.Opened === null ? 'Never' : comic.Opened;
      },
    }
); 


Ext.define('Comic.view.ComicList', {
    extend: 'Ext.ux.BufferedList',
    xtype: 'comiclistview',
    
    requires: [ 
      'Ext.plugin.ListPaging',
      'Ext.ux.BufferedList',
      'Comic.view.ComicListSort',
    ],
    
        
    config: {
      title: 'List',
      itemTpl: TheComicListItemTemplate,
      baseCls: 'comiclist',
        
      plugins: [
        {
          xclass: 'Ext.plugin.ListPaging',
          autoPaging: true
        }
      ],
      items: [
        {
          docked: 'top', 
          xtype: 'titlebar', 
          ui: 'light', 
          title: 'Comics',
          itemId: 'comiclisttoolbar',
          inline: true, 
          items: [ 
            {
              xtype: 'button', 
              itemId: 'sortbutton',
              align: 'right',
              text: 'Sort',
            },
            {
              xtype: 'button', 
              itemId: 'refreshbutton',
              align: 'right',
              iconCls: 'refresh',
              iconMask: true,
            }
          ] 
        },
        
      ],
    }
});