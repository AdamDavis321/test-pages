function TreeList(listCollection, options) {
	"use strict";
	jQuery.extend(this, this.defaults, options);
	this.listCollection = listCollection;
	listCollection.addClass(this.primaryClass);
	this.categories = listCollection.find('li:has(ul)');
	this.categories.addClass(this.categoryClass);
	if (this.startCollapsed) {
		this.categories.children().hide();
	} else {
		this.categories.addClass(this.openClass);
	}
	var me = this;
	if (me.categoryIdPrefix) {
		this.categories.each(function(index, element) {
			element.id = me.categoryIdPrefix + index;
		});
	}
	this.categories.bind('click.treeList', function(event) {
		if (this === event.target) {
			var category = jQuery(this);
			me.toggle(category);
			return false;
		}
	});
	this.items = listCollection.find('li:not(:has(ul))');
	this.items.addClass(this.itemClass);
}

TreeList.prototype.defaults = {
	primaryClass: 'treeList',
	categoryClass: 'treeList-category',
	openClass: 'treeList-open',
	itemClass: 'treeList-item',
	enabled: true,
	fireEvents: true,
	startCollapsed: true,
	onOpen: null,
	onClose: null
};

TreeList.prototype.close = function(categories) {
	"use strict";
	if (this.enabled) {
		categories.removeClass(this.openClass);
		categories.children().slideUp();
		if (this.fireEvents && this.onClose) {
			var me = this;
			categories.each(function(index, element) {
				me.onClose(element);
			});
		}
	}
};

TreeList.prototype.closeAll = function() {
	"use strict";
	this.close(this.categories);
};

TreeList.prototype.open = function(categories) {
	"use strict";
	if (this.enabled) {
		categories.addClass(this.openClass);
		categories.children().slideDown();
		if (this.fireEvents && this.onOpen) {
			var me = this;
			categories.each(function(index, element) {
				me.onOpen(element);
			});
		}
	}
};

TreeList.prototype.openAll = function() {
	"use strict";
	this.open(this.categories);
};

TreeList.prototype.toggle = function(categories) {
	"use strict";
	if (categories.children().is(':hidden')) {
		this.open(categories);
	} else {
		this.close(categories);
	}
};
