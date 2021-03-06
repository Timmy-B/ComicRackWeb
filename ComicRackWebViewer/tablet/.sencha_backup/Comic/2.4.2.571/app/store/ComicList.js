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



Ext.define('Comic.store.ComicList', {
    extend: 'Ext.data.Store',
    requires: [
        'Comic.model.ComicInfo'
        ],
    
    config: {
      model: 'Comic.model.ComicInfo',
      storeId: 'ComicList',
      autoLoad: false,
      proxy: {
        type: 'restodata',
        
        reader: {
              type: 'json',
              rootProperty: 'items',
              totalProperty: 'totalCount'
            },
        
        // Only request those fields from ComicInfo that we want to show in a list of comics:
        extraParams: { $select: 'Id,Caption,Series,Volume,Number,Title,Year,Month,FilePath,PageCount,UserCurrentPage,UserLastPageRead,UserOpenedTimeAsText,PublishedAsText' },
        listeners:{
          exception:function(proxy, response, orientation){
              // empty list ?
              console.error('Failed to load Comic store for ' + proxy.getUrl(), response.responseText);
              //Ext.Msg.alert('Loading failed', response.statusText);
          }
        }
      }
    }    
});