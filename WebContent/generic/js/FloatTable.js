function FloatTable(pContainerId, pCellIdPrefix, pWidthToUse, pRowDividerClass) {
	this.containerId= (pContainerId)? pContainerId : 'pageContent';
	this.cellIdPrefix= (pCellIdPrefix)? pCellIdPrefix : 'floatCell';
	this.widthToUse= (pWidthToUse)? pWidthToUse : 89;
	this.rowDividerClass= (pRowDividerClass)? pRowDividerClass : 'FloatRowDivider';
	this.columnCount= 1;
	this.previousCount= -1;
	this.maxCellWidth= 0;
}

FloatTable.prototype= {
	calculateCellWidth: function() {
		this.maxCellWidth= 0;
		var c= 0;
		var cell= document.getElementById(this.cellIdPrefix + c);
		while (cell) {
			var node= cell.firstChild;
			while (node) {
				if (node.offsetWidth > this.maxCellWidth) {
					this.maxCellWidth= node.offsetWidth;
				}
				node= node.nextSibling;
			}
			c++;
			cell= document.getElementById(this.cellIdPrefix + c);
		}
		if (c == 0) {
			if (console && console.log) {
				console.log('FloatTable.calculateCellWidth - Error: No cells with a cellIdPrefix of "' 
						+ this.cellIdPrefix + '" could be found!');
			}
		}
	},

	calculateColumnCount: function(container) {
		this.columnCount= Math.floor(container.offsetWidth / this.maxCellWidth);
		this.columnCount= Math.max(1, this.columnCount);
		this.columnCount= Math.min(this.columnCount, this.widthToUse);
	},

	createRowDivider: function() {
		var rowDiv= document.createElement('div');
		rowDiv.className= this.rowDividerClass;
		rowDiv.style.clear= 'both';
		return rowDiv;
	},
	
	formatAsTable: function() {
		var container= document.getElementById(this.containerId);
		if (!container) {
			if (console && console.log) {
				console.log('FloatTable.formatAsTable - Error: The containerId (' 
						+ this.containerId + ') could not be found!');
			}
			return;
		}
		this.calculateColumnCount(container);
		if (this.columnCount != this.previousCount) {
			this.removeRowDividers(container);
		}
		var c= 0;
		var cell= document.getElementById(this.cellIdPrefix + c);
		while (cell) {
			if (this.columnCount != this.previousCount 
					&& (c % this.columnCount) == 0) {
				container.insertBefore(this.createRowDivider(), cell);
			}
			cell.style.width= Math.floor(this.widthToUse / this.columnCount) 
					+ '%';
			c++;
			cell= document.getElementById(this.cellIdPrefix + c);
		}
		if (this.columnCount != this.previousCount) {
			this.previousCount= this.columnCount;
			// Add final row divider (so the container surrounds the cells)
			container.appendChild(this.createRowDivider());
		}
	},
	
	removeRowDividers: function(container) {
		var divs= container.getElementsByTagName('div');
		for (var i= divs.length - 1; i >= 0; i--) {
			if (divs.item(i).className == this.rowDividerClass) {
				container.removeChild(divs.item(i));
			}
		}
	},
	
	toString: function() {
		var container= document.getElementById(this.containerId);
		var dimStr = (container)? ', container dimensions: {clientWidth=' + container.clientWidth
					+ ', offsetWidth=' + container.offsetWidth
					+ ', scrollWidth=' + container.scrollWidth + '}' : '';
		return 'FloatTable: {containerId=' + this.containerId 
				+ ', cellIdPrefix=' + this.cellIdPrefix 
				+ ', columnCount=' + this.columnCount 
				+ ', maxCellWidth=' + this.maxCellWidth + dimStr + '}';
	}
};
