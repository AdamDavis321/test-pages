function LocalStorageAdapter(config) {
	config = config | {};
	this.keyPrefix = config.keyPrefix;
	this.lastId = 0;
	this.nextIdFn = config.nextIdFn | null;
}
LocalStorageAdapter.prototype = {
	add : function(item, successFn, errorFn) {
		try {
			item.id = this.getNextId();
			localStorage.setItem(this.keyPrefix + item.id, item);
			setTimeout(function() {
				successFn(item);
			}, 0);
		} catch (e) {
			setTimeout(function() {
				errorFn(item, e);
			}, 0);
		}
	},
	
	getNextId : function() {
		if (this.nextIdFn) {
			return this.nextIdFn();
		}
		this.lastId++;
		return this.lastId;
	},
	
	load : function(options, successFn, errorFn) {
		this.lastId = 0;
		var items = [];
		try {
			var keys = [];
			for (var i = 0; i < localStorage.length; i++) {
				var key = localStorage.key(i);
				if (key.indexOf(this.keyPrefix) === 0) {
					keys.push(key);
				}
			}
			for (var j = 0; j < keys.length; j++) {
				var obj = JSON.parse(localStorage.getItem(keys[j]));
				items.push(obj);
				if (!this.nextIdFn && obj.id > this.lastId) {
					this.lastId = obj.id;
				}
			}
			setTimeout(function() {
				successFn(items);
			}, 0);
		} catch (e) {
			setTimeout(function() {
				errorFn(options, e);
			}, 0);
		}
	},
	
	remove : function(item, successFn, errorFn) {
		try {
			localStorage.removeItem(this.keyPrefix + item.id);
			setTimeout(function() {
				successFn(item);
			}, 0);
		} catch (e) {
			setTimeout(function() {
				errorFn(item, e);
			}, 0);
		}
	},
	
	toString : function() {
		return '(LocalStorageAdapter: keyPrefix= ' + this.keyPrefix + ', lastId= ' 
				+ this.lastId + ')';
	},
	
	update : function(item, successFn, errorFn) {
		try {
			localStorage.setItem(this.keyPrefix + item.id, item);
			setTimeout(function() {
				successFn(item);
			}, 0);
		} catch (e) {
			setTimeout(function() {
				errorFn(item, e);
			}, 0);
		}
	}
};
