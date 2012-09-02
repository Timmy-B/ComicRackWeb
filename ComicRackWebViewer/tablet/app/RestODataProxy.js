/**
 
  Copy of the Rest Proxy, but with a modified buildUrl method.
  
 */
 


Ext.define('Comic.RestODataProxy', {
    extend: 'Ext.data.proxy.Ajax',
    alias : 'proxy.restodata',
    
    config: {
        /**
         * @cfg {Boolean} appendId
         * True to automatically append the ID of a Model instance when performing a request based on that single instance.
         * See Rest proxy intro docs for more details. Defaults to true.
         */
        appendId: true,

        /**
         * @cfg {String} format
         * Optional data format to send to the server when making any request (e.g. 'json'). See the Rest proxy intro docs
         * for full details. Defaults to null.
         */
        format: null,

        /**
         * @cfg {Boolean} batchActions
         * True to batch actions of a particular type when synchronizing the store. Defaults to false.
         */
        batchActions: false,

        actionMethods: {
            create : 'POST',
            read   : 'GET',
            update : 'PUT',
            destroy: 'DELETE'
        },
        
        url: '',
        format: 'json',
        pageParam: '$page',
        startParam: '$skip',
        limitParam: '$top',
        sortParam  : '$orderby',
        filterParam : '$filter',
        // TODO: add select param support
        selectParam : '$select' // store has no default support for select
    },

    /**
     * Specialized version of buildUrl that incorporates the {@link #appendId} and {@link #format} options into the
     * generated url. Override this to provide further customizations, but remember to call the superclass buildUrl so
     * that additional parameters like the cache buster string are appended.
     * @param {Object} request
     */
    buildUrl: function(request) {
        var me        = this,
            operation = request.getOperation(),
            records   = operation.getRecords() || [],
            record    = records[0],
            model     = me.getModel(),
            idProperty= model.getIdProperty(),
            format    = me.getFormat(),
            url       = me.getUrl(request),
            params    = request.getParams() || {},
            id        = (record && !record.phantom) ? record.getId() : params[idProperty];

        if (operation.config.select)
          params.$select = operation.config.select;
    
        params.entity = url;
        url = me.buildODataUrl(params);
        
        
        request.setParams(params);
        request.setUrl(url);

        return me.callParent([request]);
    },
    
    buildODataUrl: function(params) {
    if (typeof params == 'string')
      return params;
      
    if ('url' in params)
      return params.url;
      
    var me = this,
        url = '';
    
    if ('entity' in params)
    {
      url += params.entity;
      if ('id' in params)
      {
        url += '/' + encodeURIComponent(params.id);
        delete params.id;
      }
      
      delete params.entity;
    }
    
    url = Ext.String.urlAppend(url, '$format=json');
    url = Ext.String.urlAppend(url, '$inlinecount=allpages');
    if ('$top' in params)
    {
      url = Ext.String.urlAppend(url, '$top='+params.$top);
      delete params.$top;
    
      if ('$skip' in params)
      {
        url = Ext.String.urlAppend(url, '$skip='+params.$skip);
        delete params.$skip;
      }
      if ('$skiptoken' in params)
      {
        url = Ext.String.urlAppend(url, '$skiptoken='+params.$skiptoken);
        delete params.$skiptoken;
      }
      if ('$page' in params)
      {
        url = Ext.String.urlAppend(url, '$page='+params.$page);
        delete params.$page;
      }
    } // else paging is disabled.
    
    if ('$filter' in params)
    {
      url = Ext.String.urlAppend(url, '$filter='+encodeURIComponent(params.$filter));
      delete params.$filter;
    }
    if ('$expand' in params)
    {
      url = Ext.String.urlAppend(url, '$expand='+encodeURIComponent(params.$expand));
      delete params.$expand;
    }
    if ('$orderby' in params)
    {
      url = Ext.String.urlAppend(url, '$orderby='+encodeURIComponent(params.$orderby));
      
      delete params.$orderby;
    }
    if ('$select' in params)
    {
      url = Ext.String.urlAppend(url, '$select='+me.encodeSelect(params.$select));
      delete params.$select;
    }
    
    return url;
    },
    /*
    getParams: function(operation)
    {
      var params = this.callParent(operation);
      
    }
    */
    
    
    encodeSelect : function(selectParam)
    {
      return selectParam.join(',');
    },
    
    encodeSorters : function(sorters)
    {
      var  min  = []
        ,length  = sorters.length
        ,i    = 0;
      
      for(; i<length; i++)
      {
        min[i] = sorters[i].getProperty();
        
        if (sorters[i].getDirection().toLowerCase() == 'desc')
        {
          min[i] += ' desc';
        }
      }
      
      return min.join(',');
    },
    
    encodeFilters : function(filters)
    {
      var  filter  = []
        ,length  = filters.length
        ,sq    = '\''
        ,type  = ''
        ,i;
      
      for(i=0; i<length; i++)
      {
        type = filters[i].config.type || '';
        
        switch(type)
        {
          case 'use':
            filter[i] = filters[i].getProperty();
            break;
            
          case 'int':
            type  = '';
            sq    = '';
            filter[i] = filters[i].getProperty() + ' eq ' + type + sq + filters[i].getValue() + sq;
            break;
          case 'guid':
            type  = 'guid';
            sq    = '\'';
            filter[i] = filters[i].getProperty() + ' eq ' + type + sq + filters[i].getValue() + sq;
            break;
          default:
            type  = '';
            sq    = '\'';
            filter[i] = filters[i].getProperty() + ' eq ' + type + sq + filters[i].getValue() + sq;
            break;
        }
        
        
      }
      
      return filter.join(' and ');
    }
    
});
