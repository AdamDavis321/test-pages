/*
 * Defines a DataTable object to display records from a Model object in an HTML table. 
 * 
 * Uses:
 * - miscUtils.js
 * - jQuery 1.10
 * - model.js
 */

/**
 * Create a ColumnDefinition object with the specified information.
 * 
 * @param  name  the column name
 * @param  options  (Object)
 * @return the new ColumnDefinition object
 */
function ColumnDefinition(name, options) {
	this.name = name;
	options = options || {};
	this.heading = options.heading || name;
	this.columnClass = options.columnClass || name + 'Column';
	this.unsortable = (options.unsortable)? true : false;
	this.sorted = (options.sorted)? true : false;
	if (this.sorted) {
		this.descending = (options.descending)? true : false;
	}
	else {
		/* Default to true because it will be toggled when this column is selected. */
		this.descending = true; 
	}
	this.onGetCellClass = options.onGetCellClass || null;
	this.onGetCellValue = options.onGetCellValue || null;
}

ColumnDefinition.prototype= {
	toString: function() {
		return this.name;
	}
};

/**
 * Create a DataTable object with the specified information.
 * 
 * @param  element  (HTMLElement or jQuery selector string)
 * @param  options  (Object)
 * @return the new DataTable object
 */
function DataTable(element, options) {
	options = options || {};
	this.showHeadings = options.showHeadings || true;
	this.columnDefinitions = options.columnDefinitions || [];
	this.model = options.model || null;
	this.showCaption = options.showCaption || false;
	this.captionText = options.captionText || null;
	this.onGetCaptionValue = options.onGetCaptionValue || null;
	this.tableClass = options.tableClass || 'DataTable';
	this.stripeRows = options.stripeRows || true;
	this.oddRowClass = options.oddRowClass || 'Odd';
	this.evenRowClass = options.evenRowClass || 'Even';
	this.clickToSelect = options.clickToSelect || false;
	this.rowSelectedClass = options.rowSelectedClass || 'Selected';
	this.onRowClick = options.onRowClick || null;
	this.headingSortedAscClass = options.headingSortedAscClass || 'SortedAscending';
	this.headingSortedDescClass = options.headingSortedDescClass || 'SortedDescending';
	this.showNullUndefined = options.showNullUndefined || false;

	var $element = $(element);
	this.table = ($element.prop('tagName') === 'TABLE')? $element : $element.find('table');
	this.thead = this.table.children('thead');
	if (this.thead.length === 0 && this.showHeadings) {
		this.thead = $('<thead></thead>');
		this.table.append(this.thead);
	}
	this.tbody = this.table.children('tbody');
	if (this.tbody.length === 0) {
		this.tbody = $('<tbody></tbody>');
		this.table.append(this.tbody);
	}
	this.caption= this.table.children('caption');
	if (this.caption.length === 0 && this.showCaption) {
		this.caption = $('<caption></caption>');
		this.table.append(this.caption);
	}
	
	var dataTable = this;
	if (this.showHeadings) {
		dataTable.thead.on('click', 'th', function(event) {
			dataTable.headingClick(event);
		});
	}
	if (this.clickToSelect) {
		dataTable.tbody.on('click', 'tr', function(event) {
			dataTable.rowClick(event);
		});
	}
}

DataTable.prototype= {

	/**
	 * Build the body of the table - containing data from all records in the model.
	 * 
	 * @param  model  the Model object containing the data
	 * @param  colDefs  an array of ColumnDefinition objects
	 */
	buildTableBody: function(model, colDefs) {
		var row;
		var cell;
		var r;
		var c;
		var rows = [];
		for (r= 0; r < model.records.length; r++) {
			row= $('<tr></tr>');
			if (this.stripeRows) {
				row.addClass(((r + 1) % 2) == 1? this.oddRowClass : this.evenRowClass);
			}
			for (c= 0; c < colDefs.length; c++) {
				cell= $('<td></td>');
				cell.addClass(colDefs[c].columnClass);
				if (colDefs[c].onGetCellClass) {
					cell.addClass(colDefs[c].onGetCellClass(model.records[r], colDefs[c].name));
				}
				cell.html(this.getCellValue(model.records[r], colDefs[c]));
				row.append(cell);
			}
			row.data('record', model.records[r]);
			rows.push(row);
		}
		this.tbody.empty().append(rows);
	},

	/**
	 * Build the heading of the table - containing the column headings.
	 * 
	 * @param  model  the Model object containing the data
	 * @param  colDefs  an array of ColumnDefinition objects
	 */
	buildTableHeading: function(model, colDefs) {
		var row= $('<tr></tr>');
		var cell;
		var c;
		for (c= 0; c < colDefs.length; c++) {
			cell= $('<th></th>');
			cell.addClass(colDefs[c].columnClass);
			if (colDefs[c].sorted && !colDefs[c].unsortable) {
				cell.addClass(colDefs[c].descending? this.headingSortedDescClass 
						: this.headingSortedAscClass);
			}
			cell.html(colDefs[c].heading);
			cell.data('columnDefinition', colDefs[c]);
			row.append(cell);
		}
		this.thead.empty().append($(row));
	},

	/**
	 * Mark all rows as not selected.
	 */
	deselectRows : function() {
		this.tbody.children('tr').removeClass(this.rowSelectedClass);
	},

	/**
	 * Get the caption of the table.
	 * 
	 * @param  model  the Model object to be displayed in the table
	 * @return the caption text
	 */
	getCaptionValue: function(model) {
		var result;
		if (this.captionText) {
			result = this.captionText;
		} else if (this.onGetCaptionValue) {
			result = this.onGetCaptionValue(model);
		} else {
			result = model.name || '';
		}
		return result;
	},

	/**
	 * Get a node containing the value to display in the current cell.
	 * 
	 * @param  record  the record to be displayed in the current row
	 * @param  colDef  the ColumnDefinition object for the current cell
	 * @return a string containing the value of the current cell (may contain embedded HTML)
	 */
	getCellValue: function(record, colDef) {
		var attrValue = '';
		if (colDef.onGetCellValue) {
			attrValue = colDef.onGetCellValue(record[colDef.name], record, colDef);
		}
		else {
			attrValue = record[colDef.name];
			if (typeof(attrValue) === 'undefined' && this.showNullUndefined) {
				attrValue = '<i>undefined</i>';
			} else if (attrValue === null && this.showNullUndefined) {
				attrValue = '<i>null</i>';
			} else if ($.isArray(attrValue)) {
				attrValue = attrValue.join(', ');
			}
		}
		return attrValue;
	},

	/**
	 * Get the default set of column definitions for the specified model.
	 * 
	 * @param  model  the model to be displayed in the table
	 * @return the array of ColumnDefinition objects
	 */
	getColumnDefinitions: function(model) {
		var defs= new Array();
		if (model.records.length > 0) {
			$.each(model.records[0], function(key, value) {
				defs.push(new ColumnDefinition(key));
			});
		}
		return defs;
	},

	/**
	 * Get a comparison function for sorting the specified column.
	 * 
	 * @param colDef a ColumnDefinition object
	 * @return a comparison function
	 */
	getComparisonFn: function(colDef) {
		return function(record1, record2) {
			var result;
			var col1 = record1[colDef.name];
			var col2 = record2[colDef.name];
			if (!isAssigned(col1) && !isAssigned(col2)) {
				result = 0;
			} else if (!isAssigned(col1)) {
				result = -1;
			} else if (!isAssigned(col2)) {
				result = 1;
			} else if (!isNaN(col1) && !isNaN(col2)) {
				result = compareNumeric(col1, col2);
			} else {
				result = compareAlphaNC(col1, col2);
				if (result === 0) {
					result = compareAlpha(col1, col2);
				}
			}
			if (colDef.descending) {
				result = -result;
			}
			return result;
		};
	},

	/**
	 * @param row a jQuery collection holding the currently selected row (optional)
	 * @return a jQuery collection holding the data record from the currently selected row
	 */
	getSelectedRecord: function(row) {
		row = row || this.getSelectedRow();
		return row.data('record');
	},

	/**
	 * @return a jQuery collection holding the currently selected row
	 */
	getSelectedRow: function() {
		return this.tbody.children('tr.' + this.rowSelectedClass);
	},
	
	/**
	 * Handle a mouse click on a column heading of the table.
	 * 
	 * @param event the jQuery event object
	 */
	headingClick: function(event) {
		if (!event.altKey && !event.ctrlKey && !event.shiftKey) {
			var cell = event.target;
			var $cell = $(cell);
			var row = $cell.parent();
			var cells = row.children('th');
			var colDef = $cell.data('columnDefinition');
			if (!colDef.unsortable) {
				var dataTable = this;
				cells.each(function(i, elem) {
					if (elem === cell) {
						dataTable.columnDefinitions[i].sorted= true;
						dataTable.columnDefinitions[i].descending= !colDef.descending;
						$(elem).removeClass((colDef.descending)? 
										dataTable.headingSortedAscClass 
										: dataTable.headingSortedDescClass)
								.addClass((colDef.descending)? 
										dataTable.headingSortedDescClass 
										: dataTable.headingSortedAscClass);
					}
					else {
						dataTable.columnDefinitions[i].sorted= false;
						dataTable.columnDefinitions[i].descending= true;
						$(elem).removeClass(dataTable.headingSortedDescClass)
								.removeClass(dataTable.headingSortedAscClass);
					}
				});
				this.model.sort(this.getComparisonFn(colDef));
				this.refresh();
			}
		}
	},
	
	/**
	 * Rebuild the table with data from the model.
	 * 
	 * @param  model  the Model object to be displayed in the table
	 * @param  colDefs  an array of ColumnDefinition objects (optional)
	 */
	refresh: function(model, colDefs) {
		model = model || this.model;
		colDefs = colDefs || this.columnDefinitions|| this.getColumnDefinitions(model);
		if (model !== this.model || colDefs !== this.columnDefinitions) {
			this.restructure(model, colDefs);
		}
		this.table.attr('cellspacing', '0');
		this.table.addClass(this.tableClass);
		if (this.showCaption) {
			this.caption.html(this.getCaptionValue(model));
		}
		if (!model.records || model.records.length == 0) {
			this.showMessageInBody('There are no records in the model.');
		}
		else if ($.isEmptyObject(model.records[0])) {
			this.showMessageInBody('There are no attributes in the first record.');
		}
		else {
			var currentRecord = this.getSelectedRecord();
			if (this.showHeadings && this.thead.children('tr').length === 0) {
				this.buildTableHeading(model, colDefs);
			}
			this.buildTableBody(model, colDefs);
			if (currentRecord) {
				this.selectRecord(currentRecord);
			}
		}
	},

	/**
	 * Restructure the table with a new data model and/or column definitions.
	 * 
	 * @param  model  the Model object to be displayed in the table
	 * @param  colDefs  an array of ColumnDefinition objects
	 */
	restructure: function(model, colDefs) {
		this.model = model;
		this.columnDefinitions = colDefs;
		if (this.showHeadings) {
			this.buildTableHeading(model, colDefs);
		}
	},

	/**
	 * Handle a mouse click on a row of the table.
	 * 
	 * @param event the jQuery event object
	 */
	rowClick : function(event) {
		var row = $(event.currentTarget);
		this.deselectRows();
		this.selectRow(row);
		if (this.onRowClick) {
			this.onRowClick(row, this.getSelectedRecord(row));
		}
	},

	/**
	 * Select the row containing the specified record.
	 * 
	 * @param record the record to find
	 */
	selectRecord : function(record) {
		var row = null;
		var dataTable = this;
		this.tbody.children('tr').each(function(idx, elem) {
			if (dataTable.model.identityFn($(elem).data('record'), record) === 0) {
				row = elem;
			}
		});
		if (row) {
			this.selectRow(row);
		}
	},
	
	/**
	 * Mark a row as selected.
	 * 
	 * @param row the row to select
	 */
	selectRow : function(row) {
		$(row).addClass(this.rowSelectedClass);
	},

	/**
	 * Build a table body node containing the specified message.
	 * 
	 * @param  message  the message to display
	 */
	showMessageInBody: function(message) {
		var $row= $('<tr><td>' + message + '</td></tr>');
		this.tbody.empty().append($row);
	}
	
};
