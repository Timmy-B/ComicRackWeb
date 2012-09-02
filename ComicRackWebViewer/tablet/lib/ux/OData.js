/**
 * Class for construction the OData proxy for ExtJS 4.1.
 * @extends Ext.data.proxy.Ajax
 * @author Maicon Schelter
 * @example
 * Ext.create('Ext.data.Store',{
 *      autoLoad  : true
 *     ,autoSync  : true
 *     ,proxy : {
 *        type  : 'odata'
 *       ,url  : 'DTE/services/ListCars'
 *       ,params : {
 *         type : 'DTE.Model.Cars'
 *       }
 *     }
 *   });
 */
Ext.define('Ext.data.proxy.OData',{
   extend        : 'Ext.data.proxy.Rest'
  ,alternateClassName  : 'Ext.data.OData'
  ,alias        : 'proxy.odata'
  ,config : {
  /**
   * @cfg {Boolean} appendId
   * Indicate if concat ID at URL request.
   */
    appendId      : true
   ,format: 'json'
  
  /**
   * @cfg {Boolean} batchActions
   * Indicate if execute the batch action of request.
   */
   ,batchActions    : false
  }
  /**
   * Method using with create the url of Ajax.
   * @method buildUrl
   * @param {Object} request Request options.
   * @private
   */
  ,buildUrl: function(request) {
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

        if (me.getAppendId() && id) {
        // See http://www.odata.org/documentation/uri-conventions#AddressingEntries
        // Use OData KeyPredicate.
        // id can be single KeyValue or a string in the form of 
        // multiple comma-separated Property=KeyValue pairs.
        
        /*
            if (!url.match(/\/$/)) {
                url += '/';
            }
            url += id;
        */
            if (id) {
              if (url.match(/\/$/)) {
                url = url.substring(0, url.length - 1);
              }
              url = url + '(' + id + ')';
            }
            
            if (request.action == 'read') {
              params = Ext.apply(params, {
              '$inlinecount' : 'allpages'
              });
            }
                        
            delete params[idProperty];
        }

        if (format) {
        // http://www.odata.org/documentation/uri-conventions#FormatSystemQueryOption
        // Use OData $format option
        /*
            if (!url.match(/\.$/)) {
                url += '.';
            }

            url += format;
        */    
        /*
            if (!url.match(/\/$/)) {
                url += '/';
            }
        */  
            url = Ext.urlAppend(url, '$format=' + format);
        }

        request.setUrl(url);

        //return me.callParent([request]);
    }
  /*
  ,buildRequest : function(operation, callback, scope)
  {
    if (operation.getScope())
    {
      this.setSortParam(operation.getScope().remoteSort ? '$orderby' : null);
      this.setFilterParam(operation.getScope().remoteFilter ? '$filter' : null);
    }
    
    return Ext.data.proxy.Rest.superclass.buildRequest.apply(this, arguments);
  }
  
  
  buildRequest: function(operation) {
        var me = this,
            params = Ext.applyIf(operation.getParams() || {}, me.getExtraParams() || {}),
            request;

        //copy any sorters, filters etc into the params so they can be sent over the wire
        params = Ext.applyIf(params, me.getParams(operation));

        request = Ext.create('Ext.data.Request', {
            params   : params,
            action   : operation.getAction(),
            records  : operation.getRecords(),
            url      : operation.getUrl(),
            operation: operation,
            proxy    : me
        });

        request.setUrl(me.buildUrl(request));
        operation.setRequest(request);

        return request;
    },
  */
  
  
  /**
   * Method using with create of sorters.
   * @method encodeSorters
   * @param {Array} sorters Request sorters.
   * @private
   */
  ,encodeSorters : function(sorters)
  {
    var  min  = []
      ,length  = sorters.length
      ,i    = 0;
    
    for(; i<length; i++)
    {
      min[i] = sorters[i].getProperty();
      
      if(sorters[i].getDirection().toLowerCase() == 'desc')
      {
        min[i] += ' desc';
      }
    }
    
    return min.join(',');
  }
  
  /**
   * Method using with create of filters.
   * @method encodeFilters
   * @param {Array} filters Request filters.
   * @private
   */
  ,encodeFilters : function(filters)
  {
    var  filter  = []
      ,length  = filters.length
      ,sq    = '\''
      ,type  = ''
      ,i;
    
    for(i=0; i<length; i++)
    {
      type = filters[i].getType() || '';
      
      switch(type)
      {
        case 'int':
          type  = '';
          sq    = '';
          break;
        case 'guid':
          type  = 'guid';
          sq    = '\'';
          break;
        default:
          type  = '';
          sq    = '\'';
          break;
      }
      
      filter[i] = filters[i].getProperty() + ' eq ' + type + sq + filters[i].getValue() + sq;
    }
    
    return filter.join(' and ');
  }
},function()
{
  /**
   * Override defaults property's of requests.
   */
    Ext.apply(this.prototype,{
        actionMethods : {
             create : 'POST'
            ,read   : 'GET'
            ,update : 'PUT'
            ,destroy: 'DELETE'
        }
    ,headers : {
      'Accept' : 'application/json'
    }
    ,config : {
     pageParam  : undefined
    ,startParam  : '$skip'
    ,limitParam  : '$top'
    ,sortParam  : '$orderby'
    ,filterParam : '$filter'
    ,noCache  : false
    }
    });
});


/**
 * Override of Ext.data.Connection.
 * @extends Ext.data.Connection
 * @author Maicon Schelter
 */
Ext.define('Ext.ux.data.Connection', {
  override: 'Ext.data.Connection',
  
  /**
   * Method using to send and request ajax data.
   * @method request
   * @param {Object} options Object request options.
   */
  request_old : function(options)
  {
    options = options || {};
    
    var  me      = this
      ,scope    = options.scope    || window
      ,username  = options.username  || me.username
      ,password  = options.password  || me.password || ''
      ,async
      ,requestOptions
      ,request
      ,headers
      ,xhr
      ,expandParam;
    
    if(options.proxy && options.proxy.params && options.proxy.params.expand)
    {
      expandParam = options.proxy.params.expand;
    }
    else if(options.params && options.params.expand)
    {
      expandParam = options.params.expand;
      delete options.params.expand;
    }
    
    if(expandParam && options.method !== 'DELETE' && options.method !== 'MERGE')
    {
      if(Ext.isArray(expandParam))
      {
        expandParam = expandParam.join(',');
      }
      
      options.url = Ext.urlAppend(options.url, ('$expand=' + expandParam));
    }
    
    if(me.fireEvent('beforerequest', me, options) !== false)
    {
      requestOptions = me.setOptions(options, scope);
      
      if(this.isFormUpload(options) === true)
      {
        this.upload(options.form, requestOptions.url, requestOptions.data, options);
        return null;
      }
      
      if(options.autoAbort === true || me.autoAbort)
      {
        me.abort();
      }
      
      if((options.cors === true || me.cors === true) && Ext.isIe && Ext.ieVersion >= 8)
      {
        xhr = new XDomainRequest();
      }
      else
      {
        xhr = this.getXhrInstance();
      }
      
      async = options.async !== false ? (options.async || me.async) : false;
      
      if(username)
      {
        xhr.open(requestOptions.method, requestOptions.url, async, username, password);
      }
      else
      {
        xhr.open(requestOptions.method, requestOptions.url, async);
      }
      
      if(options.withCredentials === true || me.withCredentials === true)
      {
        xhr.withCredentials = true;
      }
      
      if(options.headers)
      {
        Ext.apply(options.headers, {'Accept':'application/json','Content-Type':'application/json'});
        
        if(options.method !== 'DELETE' && options.method !== 'MERGE')
        {
          delete options.headers['If-Match'];
        }
      }
      else
      {
        Ext.apply(options, {headers:{'Accept':'application/json','Content-Type':'application/json'}});
      }
      
      try
      {
        requestOptions.data = Ext.decode(requestOptions.data);
      }
      catch(ex)
      {
        requestOptions.data = Ext.urlDecode(requestOptions.data);
      }
      finally
      {
        if(requestOptions.data)
        {
          var type;
          
          if(requestOptions.data.__metadata)
          {
            if(requestOptions.data.__metadata.etag)
            {
              Ext.apply(options.headers, {'If-Match':requestOptions.data.__metadata.etag});
            }
            
            if(requestOptions.data.__metadata.type)
            {
              type = requestOptions.data.__metadata.type;
            }
          }
          else if(requestOptions.data.type)
          {
            type = requestOptions.data.type;
            delete requestOptions.data.type;
          }
          else if(scope.params && scope.params.type)
          {
            type = scope.params.type;
          }
          
          delete requestOptions.data.__metadata;
          
          if(!Ext.isEmpty(type))
          {
            Ext.apply(requestOptions.data,{'__metadata':{'type':type}});
          }
        }
        
        requestOptions.data = Ext.encode(requestOptions.data);
      }
      
      headers = me.setupHeaders(xhr, options, requestOptions.data, requestOptions.params);
      
      request = {
         id    : ++Ext.data.Connection.requestId
        ,xhr  : xhr
        ,headers: headers
        ,options: options
        ,async  : async
        ,timeout: setTimeout(function()
        {
          request.timedout = true;
          me.abort(request);
        }, options.timeout || me.timeout)
      };
      
      me.requests[request.id]  = request;
      me.latestId        = request.id;
      
            if(async)
      {
        xhr.onreadystatechange = Ext.Function.bind(me.onStateChange, me, [request]);
      }
      
      xhr.send(requestOptions.data);
      
      if(!async)
      {
        return this.onComplete(request);
      }
      
      return request;
    }
    else
    {
      Ext.callback(options.callback, options.scope, [options, undefined, undefined]);
      return null;
    }
  }
  
  /**
   * Method using to treat ajax request returns.
   * @method onComplete
   * @param {Object} request Object request config.
   */
  ,onComplete : function(request)
  {
    var  me      = this
      ,options  = request.options
      ,result
      ,success
      ,response
      ,code
      ,etag;
    
        try
    {
      result = me.parseStatus(request.xhr.status);
    }
    catch(e)
    {
      result = {
         success    : false
        ,isException  : false
      };
        }
    
    success  = result.success;
    code  = request.xhr.status;
    etag  = request.xhr.getResponseHeader('Etag');
    
    if(success)
    {
      response = me.createResponse(request);
      me.fireEvent('requestcomplete', me, response, options);
      
      options.headers['If-Match'] = etag;
      Ext.callback(options.success, options.scope, [response, options]);
    }
    else
    {
      if(result.isException || request.aborted || request.timedout)
      {
        response = me.createException(request);
      }
      else
      {
        response = me.createResponse(request);
            }
      
      me.fireEvent('requestexception', me, response, options);
      Ext.callback(options.failure, options.scope, [response, options]);
    }
    
    Ext.callback(options.callback, options.scope, [options, success, response]);
    
    delete me.requests[request.id];
    return response;
  }
});