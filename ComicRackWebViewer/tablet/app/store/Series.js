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

Ext.define('Comic.store.Series', {
    extend: 'Ext.data.Store',
    requires: [
        'Comic.model.Series',
        'Comic.RestODataProxy'
        ],
    
    config: {
      model: 'Comic.model.Series',
      storeId: 'Series',
      autoLoad: false,
      pageSize: null,
      defaultRootProperty: 'items',
      //nodeParam: 'items',
      //defaultRootId: "bla",
      
      sorters: [
          {
              // Sort by title
              // NB: The use of toLowerCase may break sorting for unicode characters in the strings
              sorterFn: function(record1, record2) {
                  var title1 = record1.data.Title.toLowerCase(),
                      title2 = record2.data.Title.toLowerCase(),
                      n = title1.indexOf("the "); 
                      
                  if (n == 0)
                  {
                    title1 = title1.substr(4);
                  }
                  n = title2.indexOf("the "); 
                  if (n == 0)
                  {
                    title2 = title2.substr(4);
                  }

                  return title1 > title2 ? 1 : (title1 == title2 ? 0 : -1);
              },
              direction: 'ASC'
          }
      ],

      grouper: {
        groupFn: function(record) {
          var title = record.get('Title').toUpperCase(),
              n = title.indexOf("THE "); 
          if (n != 0)
          {
            return title[0];
          }
          else
          {
            return title[4];
          }
          
        }
      },

      proxy: {
            type: 'restodata',
            url: bcrBase + '/BCR/Series',
            format: 'json',
            reader: {
              type: 'json',
              rootProperty: 'items',
              totalProperty: 'totalCount'
            },
            listeners:{
              exception:function(proxy, response, orientation){
                  console.error('Failure Notification', response.responseText);
                  Ext.Msg.alert('Loading failed', response.statusText);
              }
            }
            
        }
    }    
});