function View() {
	this.editForm = $('#editForm');
	this.idInput = $('#idInput');
	this.categoryInput = $('#categoryInput');
	this.titleInput = $('#titleInput');
	this.budgetInput = $('#budgetInput');
	this.startDateInput = $('#startDateInput');
	this.saveButton = $('#saveButton');
	this.resetButton = $('#resetButton');
	this.deleteButton = $('#deleteButton');
	this.displayTable = $('#displayTable');
}
View.prototype = {
	clearForm : function() {
		this.editForm.find('input, select').val('').removeClass('InError');
		this.saveButton.prop('disabled', true);
		this.deleteButton.prop('disabled', true);
	},

	getItemFromForm : function() {
		console.log('View.getItemFromForm');
		var idStr = unescapeHTML(this.idInput.val());
		var id = idStr && !isNaN(idStr)? Number(idStr) : null;
		var category = unescapeHTML(this.categoryInput.val());
		var title = unescapeHTML(this.titleInput.val());
		var budget = unescapeHTML(this.budgetInput.val());
		if (budget === '') {
			budget = null;
		}
		var startDate = parseDateTimeUSA(unescapeHTML(this.startDateInput.val()));
		return {
			"id": id,
			"category": category,
			"title": title,
			"budget": budget,
			"startDate": startDate
		};
	},

	loadForm : function(item) {
		if (item) {
			console.log('View.loadForm: item= ', item);
			var id = escapeHTML(item.id);
			var category = escapeHTML(item.category);
			var title = escapeHTML(item.title);
			var budget = escapeHTML(isAssigned(item.budget)? formatNumber(item.budget, 1, 2) : '');
			var startDate = escapeHTML(formatDateTimeUSA(item.startDate));
			this.idInput.val(id).removeClass('InError');
			this.categoryInput.val(category).removeClass('InError');
			this.titleInput.val(title).removeClass('InError');
			this.budgetInput.val(budget).removeClass('InError');
			this.startDateInput.val(startDate).removeClass('InError');
			this.saveButton.prop('disabled', true);
			this.deleteButton.prop('disabled', false);
		} else {
			this.clearForm();
		}
	},

	toString : function() {
		return '{View: editForm= ' + this.editForm + ', displayTable= ' + this.displayTable + '}';
	}
};


function Controller(model, view) {
	this.model = model;
	this.view = view;
	this.validator = new Validator();
	this.dataTable = new DataTable(this.view.displayTable, {
		columnDefinitions: [
			new ColumnDefinition('id', {
				heading: 'ID', 
				sorted: true
			}),
			new ColumnDefinition('category', {
				heading: 'Category'
			}),
			new ColumnDefinition('title', {
				heading: 'Title'
			}),
			new ColumnDefinition('budget', {
				heading: 'Budget',
				onGetCellValue: formatAmountDollars
			}),
			new ColumnDefinition('startDate', {
				heading: 'Start Date',
				onGetCellValue: formatDateTimeUSA
			})
		],
		clickToSelect: true
	});
	this.handlersSet = false;
	this.keyTimeoutId = 0;
	this.keyTimeoutWait = 500;
}
Controller.prototype = {
	add : function(button, item) {
		console.log('Controller.add: item= ', item);
		var me = this;
		me.model.add(item, function(record) {
			me.dataTable.refresh(me.model);
			me.dataTable.selectRecord(record);
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
			me.dataTable.refresh(me.model);
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
				me.dataTable.refresh(me.model);
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
		me.dataTable.deselectRows();
	},

	save : function(event) {
		console.log('Controller.save: event= ', event);
		var me = this;
		if (me.validateForm()) {
			var button = $(event.target);
			button.prop('disabled', true);
			var item = me.view.getItemFromForm();
			if (item.id) {
				me.update(button, item);
			} else {
				me.add(button, item);
			}
		}
	},

	rowSelected : function(row, record) {
		console.log('Controller.rowSelected: record= ', record);
		this.view.loadForm(record);
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
			me.dataTable.onRowClick = function(row, record) {
				me.rowSelected(row, record);
			};
		}
	},

	toString : function() {
		return '{Controller: model= ' + this.model + ', view= ' + this.view + '}';
	},

	update : function(button, item) {
		console.log('Controller.update: item= ', item);
		var me = this;
		me.model.update(item, function(record) {
			me.dataTable.refresh(me.model);
		}, function(record, error) {
			alert('An error occurred while adding: ' + error);
			button.prop('disabled', false);
		});
	},

	validateForm : function() {
		//console.log('Controller.validateForm');
		var me = this;
		var okay1 = me.validator.verifyRequired(me.view.titleInput, 'Title is required.');
		var okay2 = me.validator.verifyNumeric(me.view.budgetInput, 'Budget must be numeric.');
		var okay3 = me.validator.verifyDateTime(me.view.startDateInput, 
				'Start Date is not a valid date/time value (use MM/DD/YYYY HH:MM format).');
		return okay1 && okay2 && okay3;
	}
};

$(document).ready(function() {
	var controller = new Controller(new Model(), new View());
	controller.loadAll();
});
