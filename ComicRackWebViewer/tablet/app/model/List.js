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


function isListLeaf(v, record) {
  if (record.data.Type == null)
  {
    return false; // root item
  }
  else 
  {
    return record.data.Type != 'ComicListItemFolder';
  }
}


Ext.define('Comic.model.List', {
    extend: 'Ext.data.Model',
        
    config: {
      fields: [ 
        { name: 'Id', type: 'string' },
        { name: 'Name', type: 'string' },
        { name: 'Type', type: 'string' },
        { name: 'BookCount', type: 'int' },
        { name: 'UnreadBookCount', type: 'int' },
        { name: 'NewBookCount', type: 'int' },
        { name: 'NewBookCountDate', type: 'string' },
        { name: 'Lists', type: 'object' },
        { name: 'leaf', convert: isListLeaf },
        { name: 'items', mapping: 'Lists' }
      ],
      idProperty: 'Id'
      
      
    }
 });
