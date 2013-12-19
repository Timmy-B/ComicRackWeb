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
Ext.define('Comic.store.TreeList', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'Comic.model.List',
        'Comic.RestODataProxy'
        ],
    
    config: {
      model: 'Comic.model.List',
      storeId: 'TreeList',
      autoLoad: false,
      defaultRootProperty: 'Lists',

      proxy: {
            type: 'restodata',
            url: bcrBase + '/BCR/Lists',
            listeners:{
              exception:function(proxy, response, orientation){
                  console.error('Failure Notification', response.responseText);
                  Ext.Msg.alert('Loading failed', response.statusText);
              }
            }
            
        }
    }    
});