// Create a dummy console object if one doesn't exist
if (!window.console) {
	window.console = {};
}

// Create dummy console methods if they don't exist
if (!window.console.dir) {
	window.console.dir = function() {};
}
if (!window.console.error) {
	window.console.error = function() {};
}
if (!window.console.group) {
	window.console.group = function() {};
}
if (!window.console.groupCollapsed) {
	window.console.groupCollapsed = function() {};
}
if (!window.console.groupEnd) {
	window.console.groupEnd = function() {};
}
if (!window.console.info) {
	window.console.info = function() {};
}
if (!window.console.log) {
	window.console.log = function() {};
}
if (!window.console.time) {
	window.console.time = function() {};
}
if (!window.console.timeEnd) {
	window.console.timeEnd = function() {};
}
if (!window.console.trace) {
	window.console.trace = function() {};
}
if (!window.console.warn) {
	window.console.warn = function() {};
}

// Create non-standard methods if they don't exist
if (!window.console.assert) {
	window.console.assert = function(expression, message) {
		if (!expression) {
			window.warn(message);
		}
	};
}
if (!window.console.debug) {
	window.console.debug = window.console.log;
}
