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

Ext.define('Comic.model.OrderSettings', {
  extend: 'Ext.data.Model',
  requires: ['Comic.Enums'],
  config: {
    fields: [
        { name: 'user', type: 'string', defaultValue: '' },
        { name: 'orderby_1', type: 'int', defaultValue: Comic.Enums.OrderBy.CAPTION },
        { name: 'direction_1', type: 'int', defaultValue: Comic.Enums.Direction.ASCENDING },
        { name: 'orderby_2', type: 'int', defaultValue: Comic.Enums.OrderBy.NONE },
        { name: 'direction_2', type: 'int', defaultValue: Comic.Enums.Direction.ASCENDING },
        { name: 'layout', type: 'int', defaultValue: Comic.Enums.ComicListLayout.GRID_MEDIUM },
    ],
    proxy: {
        // IE is stupid, doesn't allow localstorage for local addresses......
        type: Ext.browser.is.IE ? 'sessionstorage' : 'localstorage',
        id  : 'bcr-OrderSettings'
    }
  }
});