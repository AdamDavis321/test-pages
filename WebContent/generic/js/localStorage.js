/*
 * Requires functions in the miscUtils.js file.
 */

/**
 * Get an array of items from localStorage.
 * 
 * @param key the key used to retrieve the items
 * @param ItemConstructor optional constructor function for each item
 * @returns {Array} items from localStorage
 */
function getItemsFromLocalStorage(key, ItemConstructor) {
	"use strict";
	var items = [];
	try {
		var s = localStorage[key];
		if (s) {
			var obj = JSON.parse(s);
			if (isArray(obj)) {
				for (var i = 0; i < obj.length; i++) {
					items.push(ItemConstructor? new ItemConstructor(obj[i]) : obj[i]);
				}
			} else {
				items.push(ItemConstructor? new ItemConstructor(obj) : obj);
			}
		}
	} catch (e) {
		if (window.console && window.console.error) {
			window.console.error('Error in getItemsFromLocalStorage: ' + e);
		}
	}
	return items;
}

/**
 * Get an object from localStorage.
 * 
 * @param key the key used to retrieve the object
 * @param ItemConstructor optional constructor function for the object
 * @returns the object from localStorage, or null if it couldn't be found
 */
function getObjectFromLocalStorage(key, ItemConstructor) {
	"use strict";
	var object = null;
	try {
		var s = localStorage[key];
		if (s) {
			object = JSON.parse(s);
			if (ItemConstructor) {
				object = new ItemConstructor(object);
			}
		}
	} catch (e) {
		if (window.console && window.console.error) {
			window.console.error('Error in getObjectFromLocalStorage: ' + e);
		}
	}
	return object;
}

/**
 * Get the keys defined in localStorage as an array.
 * 
 * @returns {Array} the keys defined in localStorage
 */
function getLocalStorageKeys() {
	"use strict";
	var keys = [];
	try {
		for (var i = 0; i < localStorage.length; i++) {
			keys.push(localStorage.key(i));
		}
	} catch (e) {
		if (window.console && window.console.error) {
			window.console.error('Error in getLocalStorageKeys: ' + e);
		}
	}
	return keys;
}

/**
 * Check if localStorage exists.
 * 
 * @returns {Boolean} true if localStorage exists, false otherwise
 */
function localStorageExists() {
	"use strict";
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

/**
 * Put an array of items into localStorage.
 * 
 * @param key the key used to store the items
 * @param items the items to store
 */
function putItemsInLocalStorage(key, items) {
	"use strict";
	try {
		localStorage[key] = JSON.stringify(isArray(items)? items : [items]);
	} catch (e) {
		if (window.console && window.console.error) {
			window.console.error('Error in putItemsInLocalStorage: ' + e);
		}
	}
}

/**
 * Put an object into localStorage.
 * 
 * @param key the key used to store the items
 * @param object the items to store
 */
function putObjectInLocalStorage(key, object) {
	"use strict";
	try {
		localStorage[key] = JSON.stringify(object);
	} catch (e) {
		if (window.console && window.console.error) {
			window.console.error('Error in putObjectInLocalStorage: ' + e);
		}
	}
}
