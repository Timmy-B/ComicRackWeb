/*
  This file is part of Badaap Comic Reader.
  
  Copyright (c) 2014 Jeroen Walter
  
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


Ext.define('Comic.Enums', {
  extend: 'Ext.Base',
  singleton: true,
  config: {
  },
  
  
  Theme: {
    NORMAL: 0,
    LITE: 1
  },

  OrderBy: {
    NONE: 0,
    CAPTION: 1,
    SERIES: 2,
    VOLUME: 3,
    TITLE: 4,
    NUMBER: 5,
    YEAR: 6,
    FILE: 7,
    LAST_OPENED: 8,
    PUBLISH_DATE: 9
  },

  Direction: {
    ASCENDING: 0,
    DESCENDING: 1
  },

  ComicListLayout: {
    LIST_SMALL: 0,
    LIST_MEDIUM: 1,
    LIST_LARGE: 2,
    GRID_SMALL: 3,
    GRID_MEDIUM: 4,
    GRID_LARGE: 5
  }

});


