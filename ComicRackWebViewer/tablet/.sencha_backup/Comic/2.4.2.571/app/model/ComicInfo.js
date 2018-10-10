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


Ext.define('Comic.model.ComicInfo', {
  extend: 'Ext.data.Model',
  requires: ['Comic.RestODataProxy'],
  config: {
    fields: [
        { name: 'store_index', type: 'int' },

        { name: 'Id', type: 'string' },
        { name: 'FilePath', type: 'string' },

        { name: 'Caption', type: 'string' },

        { name: 'ShadowTitle', type: 'string' },
        { name: 'ShadowSeries', type: 'string' },
        { name: 'ShadowNumber', type: 'string' },
        { name: 'ShadowCount', type: 'int' },
        { name: 'ShadowVolume', type: 'int' },
        { name: 'ShadowYear', type: 'int' },
        { name: 'ShadowFormat', type: 'string' },

        { name: 'Title', type: 'string' },
        { name: 'Series', type: 'string' },
        { name: 'Number', type: 'string' },
        { name: 'Count', type: 'int' },
        { name: 'Volume', type: 'int' },
        { name: 'AlternateSeries', type: 'string' },
        { name: 'AlternateNumber', type: 'string' },
        { name: 'AlternateCount', type: 'int' },
        { name: 'Summary', type: 'string' },
        { name: 'Notes', type: 'string' },
        { name: 'Year', type: 'int' },
        { name: 'Month', type: 'int' },
        { name: 'Writer', type: 'string' },
        { name: 'Penciller', type: 'string' },
        { name: 'Inker', type: 'string' },
        { name: 'Colorist', type: 'string' },
        { name: 'Letterer', type: 'string' },
        { name: 'CoverArtist', type: 'string' },
        { name: 'Editor', type: 'string' },
        { name: 'Publisher', type: 'string' },
        { name: 'Imprint', type: 'string' },
        { name: 'Genre', type: 'string' },
        { name: 'Web', type: 'string' },
        { name: 'PageCount', type: 'int' },
        { name: 'LanguageISO', type: 'string' },
        { name: 'Format', type: 'string' },
        { name: 'BlackAndWhite', type: 'string' },
        { name: 'Manga', type: 'string' },
        { name: 'Tags', type: 'string' },
        { name: 'Locations', type: 'string' },
        { name: 'Characters', type: 'string' },
        { name: 'StoryArc', type: 'string' },
        { name: 'SeriesGroup', type: 'string' },
        { name: 'AgeRating', type: 'string' },
        { name: 'Teams', type: 'string' },
        { name: 'ScanInformation', type: 'string' },
        { name: 'Added', type: 'string' },
        { name: 'LastOpenedFromListId', type: 'string' },
        { name: 'FileSize', type: 'int' },
        { name: 'Missing', type: 'boolean' },
        { name: 'FileModifiedTime', type: 'string' },
        { name: 'FileCreationTime', type: 'string' },
        { name: 'UserCurrentPage', type: 'int' },
        { name: 'UserLastPageRead', type: 'int' },
        { name: 'UserOpenedTimeAsText', type: 'date' },
        { name: 'PublishedAsText', type: 'date' }

    ],

    proxy: {
      type: 'restodata',
      url: BcrBaseUrl + '/BCR/Comics',
      listeners: {
        exception: function (proxy, response, orientation) {
          // empty list ?
          console.error('Failed to load Comic store for ' + proxy.getUrl(), response.responseText);
          //Ext.Msg.alert('Loading failed', response.statusText);
        }
      }
    }
  }
});