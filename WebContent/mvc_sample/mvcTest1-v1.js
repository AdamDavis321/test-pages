function View() {
	this.editForm = $('#editForm');
	this.idInput = $('#idInput');
	this.categoryInput = $('#categoryInput');
	this.titleInput = $('#titleInput');
	this.saveButton = $('#saveButton');
	this.resetButton = $('#resetButton');
	this.deleteButton = $('#deleteButton');
	this.displayTableBody = $('#displayTable>tbody');
}
View.prototype = {
	clearForm : function() {
		this.editForm.find('input, select').val('').removeClass('InError');
		this.saveButton.prop('disabled', true);
		this.deleteButton.prop('disabled', true);
	},

	deselectRows : function() {
		this.displayTableBody.children('tr').removeClass('Selected');
	},

	getCellsFromItem : function(item) {
		//console.log('View.getCellsFromItem: item= ', item);
		var id = escapeHTML(item.id);
		var category = escapeHTML(item.category);
		var title = escapeHTML(item.title);
		return '<td>' + id + '</td><td>' + category + '</td><td>' + title + '</td>';
	},

	getIdFromRow : function(row) {
		console.log('View.getIdFromRow: row= ', row);
		return row.data('id');
	},

	getItemFromForm : function() {
		console.log('View.getItemFromForm');
		var idStr = unescapeHTML(this.idInput.val());
		var id = idStr && !isNaN(idStr)? Number(idStr) : null;
		var category = unescapeHTML(this.categoryInput.val());
		var title = unescapeHTML(this.titleInput.val());
		return {
			"id": id,
			"category": category,
			"title": title
		};
	},

	loadForm : function(item) {
		if (item) {
			console.log('View.loadForm: item= ', item);
			var id = escapeHTML(item.id);
			var category = escapeHTML(item.category);
			var title = escapeHTML(item.title);
			this.idInput.val(id).removeClass('InError');
			this.categoryInput.val(category).removeClass('InError');
			this.titleInput.val(title).removeClass('InError');
			this.saveButton.prop('disabled', true);
			this.deleteButton.prop('disabled', false);
		} else {
			this.clearForm();
		}
	},
	
	loadTable : function(items) {
		console.log('View.loadTable: items= ', items);
		var rows = [];
		for (var i = 0; i < items.length; i++) {
			var row = $('<tr>' + this.getCellsFromItem(items[i]) + '</tr>');
			row.data('id', items[i].id);
			rows.push(row);
		}
		this.displayTableBody.empty().append(rows);
	},

	selectRow : function(row) {
		row.addClass('Selected');
	},
	
	showErrorStatus : function(input, message) {
		if (message) {
			input.addClass('InError');
			input.attr('title', message);
		} else {
			input.removeClass('InError');
			input.removeAttr('title');
		}
	},

	toString : function() {
		return '{View: editForm= ' + this.editForm
				+ ', displayTableBody= ' + this.displayTableBody + '}';
	}
};


function Controller(model, view) {
	this.model = model;
	this.view = view;
	this.handlersSet = false;
	this.keyTimeoutId = 0;
	this.keyTimeoutWait = 500;
}
Controller.prototype = {
	add : function(button, item) {
		console.log('Controller.add: item= ', item);
		var me = this;
		me.model.add(item, function(record) {
			me.view.clearForm();
			me.view.loadTable(me.model.records);
		}, function(record, error) {
			alert('An error occurred while adding: ' + error);
			button.prop('disabled', false);
		});
	},
	
	inputKeyPressed : function(event) {
		var me = this;
		if (me.keyTimeoutId) {
			window.clearTimeout(me.keyTimeoutId);
		}
		window.setTimeout(function() {
			me.keyTimeoutId = 0;
			var okay = me.validateForm();
			me.view.saveButton.prop('disabled', !okay);
		}, me.keyTimeoutWait);
	},

	loadAll : function() {
		console.log('Controller.loadAll');
		var me = this;
		me.model.load({"data": defaultItems}, function(records) {
			me.view.clearForm();
			me.view.loadTable(me.model.records);
			me.setEventHandlers();
		}, function(error) {
			alert('An error occurred while loading: ' + error);
		});
	},

	remove : function(event) {
		console.log('Controller.remove: event= ', event);
		var me = this;
		var button = $(event.target);
		var item = me.view.getItemFromForm();
		if (confirm('Do you want to delete "' + item.title + '"?')) {
			button.prop('disabled', true);
			me.model.remove(item, function(record) {
				me.view.clearForm();
				me.view.loadTable(me.model.records);
			}, function(record, error) {
				alert('An error occurred while deleting: ' + error);
				button.prop('disabled', false);
			});
		}
	},

	reset : function(event) {
		console.log('Controller.reset: event= ', event);
		var me = this;
		me.view.clearForm();
		me.view.deselectRows();
	},

	save : function(event) {
		console.log('Controller.save: event= ', event);
		var me = this;
		var button = $(event.target);
		button.prop('disabled', true);
		var item = me.view.getItemFromForm();
		if (item.id) {
			me.update(button, item);
		} else {
			me.add(button, item);
		}
	},

	select : function(event) {
		console.log('Controller.select: event= ', event);
		var me = this;
		var row = $(event.currentTarget);
		me.view.deselectRows();
		me.view.selectRow(row);
		var id = me.view.getIdFromRow(row);
		var item = me.model.getById(id);
		me.view.loadForm(item);
	},

	selectChanged : function(event) {
		var okay = this.validateForm();
		this.view.saveButton.prop('disabled', !okay);
	},
	
	setEventHandlers : function() {
		var me = this;
		if (!me.handlersSet) {
			console.log('Controller.setEventHandlers');
			me.handlersSet = true;
			me.view.saveButton.on('click', function(e) {
				me.save(e);
			});
			me.view.resetButton.on('click', function(e) {
				me.reset(e);
			});
			me.view.deleteButton.on('click', function(e) {
				me.remove(e);
			});
			me.view.editForm.find('input').on('keypress', function(e) {
				me.inputKeyPressed(e);
			});
			me.view.editForm.find('select').on('change', function(e) {
				me.selectChanged(e);
			});
			me.view.displayTableBody.on('click', 'tr', function(e) {
				me.select(e);
			});
		}
	},

	toString : function() {
		return '{Controller: model= ' + this.model + ', view= ' + this.view + '}';
	},

	update : function(button, item) {
		console.log('Controller.update: item= ', item);
		var me = this;
		me.model.update(item, function(record) {
			me.view.clearForm();
			me.view.loadTable(me.model.records);
		}, function(record, error) {
			alert('An error occurred while adding: ' + error);
			button.prop('disabled', false);
		});
	},

	validateFieldRequired : function(input, message) {
		var me = this;
		var value = input.val();
		var okay = (value && $.trim(value));
		me.view.showErrorStatus(input, (!okay? message : ''));
		return okay;
	},

	validateForm : function() {
		//console.log('Controller.validateForm');
		var me = this;
		var okay1 = true;
		okay1 = me.validateFieldRequired(me.view.titleInput, 'Title is required.');
		return okay1;
	}
};

$(document).ready(function() {
	var controller = new Controller(new Model(), new View());
	controller.loadAll();
});
