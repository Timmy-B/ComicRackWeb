/*
Open Data Protocol Implementation for Ext Js 4Links:ExtJs 4 Server Proxy: http://docs.sencha.com/ext-js/4-0/source/Server.html#Ext-data-proxy-ServerExtJs 4 Ajax Proxy: http://docs.sencha.com/ext-js/4-0/#!/api/Ext.data.proxy.AjaxOData URI Conventions: http://www.odata.org/developers/protocols/uri-conventionsLicense: GNU General Public License v3 http://www.gnu.org/copyleft/gpl.htmlAuthor: Oleg Dolzhansky dolzhansky@gmail.com
Example:
Ext.define('Customer', {
	extend : 'Ext.data.Model',
	fields : [{
			name : 'id',
			type : 'int',
			defaultValue : 0
		}, {
			name : 'name',
			type : 'string'
		}
	],
	idProperty : 'id'
});
var CustomersStore = Ext.create('Ext.data.Store', {
		model : 'Customer',
		proxy : {
			type : 'odata',
			url : '/Service.svc/Customers'
		},
		autoLoad : true
	});
 */



Ext.define('Ext.ux.data.reader.OData', {
	extend : 'Ext.data.reader.Json',
	alternateClassName : 'Ext.ux.data.ReaderOData',
	alias : 'reader.odata',
	root : 'd',
	totalProperty : 'd.__count',
	buildExtractors : function () {
		var me = this;
		me.callParent(arguments);
		me.getRoot = function (root) {
			if (root.d) {
				if (root.d.results) {
					return root.d.results;
				} else {
					return root.d;
				}
			} else {
				return root;
			}
		};
	}
});
Ext.define('Ext.ux.data.proxy.OData', {
	extend : 'Ext.data.proxy.Ajax',
	alternateClassName : 'Ext.ux.data.ProxyOData',
	alias : 'proxy.odata',
	/* Builds URL in the form Entity(Id), for example http://localhost/Service.svc/Customers(5) */
	buildUrl : function (request) {
		var me = this,
		operation = request.operation,
		records = operation.records || [],
		record = records[0],
		url = me.getUrl(request),
		id = record ? record.getId() : operation.id;
		if (id) {
			if (url.match(/\/$/)) {
				url = url.substring(0, url.length - 1);
			}
			url = url + '(' + id + ')';
		}
		if (request.action == 'read') {
			request.params = Ext.apply(request.params, {
					'$inlinecount' : 'allpages'
				});
		}
		request.url = url;
		return me.callParent(arguments);
	},
	/* Returns a string of comma-separated fields from sortes with optional 'desc' directive */
	encodeSorters : function (sorters) {
		var min = [],
		length = sorters.length,
		i = 0;
		for (; i < length; i++) {
			min[i] = sorters[i].property;
			if (sorters[i].direction.toLowerCase() == 'desc') {
				min[i] += ' desc';
			}
		}
		return min.join(',');
	}
}, function () {
	Ext.apply(this.prototype, {
		actionMethods : {
			create : 'POST',
			read : 'GET',
			update : 'PUT',
			destroy : 'DELETE'
		},
		reader : {
			type : 'odata'
		},
		headers : {
			'Accept' : 'application/json'
		},
		pageParam : undefined,
		startParam : '$skip',
		limitParam : '$top',
		sortParam : '$orderby',
		noCache : false
	});
});
