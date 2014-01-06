function Record() {
	this.id = null;
}
Record.prototype = {
	toString : function() {
		return '(Record: id= ' + this.id + ')';
	}
};


function MemoryAdapter(config) {
	config = config | {};
	this.lastId = 0;
	this.nextIdFn = config.nextIdFn | null;
}
MemoryAdapter.prototype = {
	add : function(item, successFn, errorFn) {
		console.log('MemoryAdapter.add: item= ', item);
		try {
			item.id = this.getNextId();
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
		console.log('MemoryAdapter.load: options= ', options);
		this.lastId = 0;
		var items = [];
		try {
			if (options && options.data) {
				for (var i = 0; i < options.data.length; i++) {
					items.push(options.data[i]);
					if (!this.nextIdFn && options.data[i].id > this.lastId) {
						this.lastId = options.data[i].id;
					}
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
		console.log('MemoryAdapter.remove: item= ', item);
		setTimeout(function() {
			successFn(item);
		}, 0);
	},
	
	toString : function() {
		return '(MemoryAdapter: nextId= ' + this.nextId + ')';
	},
	
	update : function(item, successFn, errorFn) {
		console.log('MemoryAdapter.update: item= ', item);
		setTimeout(function() {
			successFn(item);
		}, 0);
	}
};


function Model(config) {
	config = config || {};
	this.dbAdapter = config.dbAdapter || new MemoryAdapter();
	this.identityFn = config.identityFn || function(item1, item2) {
		var result;
		if (!item1 && !item2 || item1 === item2) {
			result = 0;
		} else if (!item1) {
			result = -1;
		} else if (!item2) {
			result = 1;
		} else {
			result = item1.id - item2.id;
		}
		return result;
	};
	this.orderByFn = config.orderByFn || this.identityFn;
	this.records = [];
}
Model.prototype = {
	add : function(item, successFn, errorFn) {
		console.log('Model.add: item= ', item);
		var me = this;
		errorFn = errorFn || me.getDefaultErrorHandler('add');
		if (me.indexOf(item) >= 0) {
			setTimeout(function() {
				errorFn(item, 'That item already exists.');
			}, 0);
		} else {
			me.dbAdapter.add(item, 
				function(record) {
					me.records.push(record);
					if (!me.isInOrder(me.records.length - 1)) {
						me.sort();
					}
					if (successFn) {
						successFn(record);
					}
				},
				function(error) {
					errorFn(item, error);
				}
			);
		}
	},

	getById : function(id) {
		//console.log('Model.getById: id= ', id);
		var result = null;
		for (var i = 0; i < this.records.length; i++) {
			if (this.records[i].id === id) {
				result = this.records[i];
				break;
			}
		}
		return result;
	},
	
	getDefaultErrorHandler : function(action) {
		return function(item, error) {
			console.log('Could not ' + action + ' the ' + item + ' item: error= ' + error);
		};
	},

	indexOf : function(record) {
		//console.log('Model.indexOf: record= ', record);
		var result = -1;
		for (var i = 0; i < this.records.length; i++) {
			if (this.identityFn(record, this.records[i]) === 0) {
				result = i;
				break;
			}
		}
		return result;
	},
	
	isInOrder : function(idx) {
		//console.log('Model.isInOrder: idx= ', idx);
		return (idx === 0 || this.orderByFn(this.records[idx - 1], this.records[idx]) <= 0)
				&& (idx === (this.records.length - 1)
						|| this.orderByFn(this.records[idx], this.records[idx + 1]) <= 0);
	},
	
	load : function(options, successFn, errorFn) {
		console.log('Model.load: options= ', options);
		var me = this;
		me.dbAdapter.load(options, 
			function(records) {
				me.records = records;
				me.sort();
				if (successFn) {
					successFn(records);
				}
			},
			function(error) {
				me.records = [];
				if (errorFn) {
					errorFn(options, error);
				} else {
					console.log('Could not load the records: options= ' + options
							+ ', error= ' + error);
				}
			}
		);
	},
	
	loadAll : function(successFn, errorFn) {
		console.log('Model.loadAll');
		this.load(null, successFn, 
			function(options, error) {
				if (errorFn) {
					errorFn(error);
				} else {
					console.log('Could not load the records: error= ' + error);
				}
			}
		);
	},
	
	remove : function(item, successFn, errorFn) {
		console.log('Model.remove: item= ', item);
		var me = this;
		errorFn = errorFn || me.getDefaultErrorHandler('remove');
		var idx = me.indexOf(item);
		if (idx < 0) {
			setTimeout(function() {
				errorFn(item, 'The item does not exist.');
			}, 0);
		} else {
			me.dbAdapter.remove(item, 
				function(record) {
					var idx = me.indexOf(record);
					if (idx >= 0) {
						me.records.splice(idx, 1);
					}
					if (successFn) {
						successFn(record);
					}
				},
				function(error) {
					errorFn(item, error);
				}
			);
		}
	},

	sort : function(compareFn) {
		console.log('Model.sort');
		if (compareFn) {
			this.orderByFn = compareFn;
		}
		this.records.sort(this.orderByFn);
	},
	
	toString : function() {
		return '(Model: dbAdapter= ' + this.dbAdapter + ', records.length= ' 
				+ this.records.length + ')';
	},
	
	update : function(item, successFn, errorFn) {
		console.log('Model.update: item= ', item);
		var me = this;
		errorFn = errorFn || me.getDefaultErrorHandler('update');
		var idx = me.indexOf(item);
		if (idx < 0) {
			setTimeout(function() {
				errorFn(item, 'The item does not exist.');
			}, 0);
		} else {
			me.dbAdapter.update(item, 
				function(record) {
					me.records[idx] = record;
					if (!me.isInOrder(idx)) {
						me.sort();
					}
					if (successFn) {
						successFn(record);
					}
				},
				function(error) {
					errorFn(item, error);
				}
			);
		}
	}
};
