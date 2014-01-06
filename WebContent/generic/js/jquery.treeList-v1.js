(function($) {
	"use strict";
	
	$.fn.treeList = function(options) {
		var defaults = {
			categoryClass: 'treeList-category',
			openClass: 'treeList-open',
			itemClass: 'treeList-item',
			onOpen: null,
			onClose: null,
			startCollapsed: true
		};
		var settings = $.extend({}, defaults, options);
		this.addClass('treeList');
		var categories = this.find('li:has(ul)');
		categories.addClass(settings.categoryClass);
		if (settings.startCollapsed) {
			categories.children().hide();
		} else {
			categories.addClass(settings.openClass);
		}
		categories.bind('click.treeList', function(event) {
			if (this === event.target) {
				var li = $(this);
				if (li.children().is(':hidden')) {
					li.addClass(settings.openClass);
					li.children().slideDown();
					if (settings.onOpen) {
						settings.onOpen(this);
					}
				} else {
					li.removeClass(settings.openClass);
					li.children().slideUp();
					if (settings.onClose) {
						settings.onClose(this);
					}
				}
				return false;
			}
		});
		var items = this.find('li:not(:has(ul))');
		items.addClass(settings.itemClass);
		return this;
	};
}(jQuery));
