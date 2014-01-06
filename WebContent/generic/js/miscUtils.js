/**
 * Compare 2 string values for sorting.
 *
 * @param  str1 the first string value (or null)
 * @param  str2 the second string value (or null)
 * @return -1 if str1 is less than str2, 0 if they're equal,
 *         or 1 if str1 is greater than str2
 */
function compareAlpha(str1, str2) {
	if (str1 < str2 || (!str1 && str2)) {
		return -1;
	}
	else if (str1 > str2 || (str1 && !str2)) {
		return 1;
	}
	else {
		return 0;
	}
}

/**
 * Compare 2 string values for sorting -- not case sensitive.
 *
 * @param  str1 the first string value (or null)
 * @param  str2 the second string value (or null)
 * @return -1 if str1 is less than str2, 0 if they're equal,
 *         or 1 if str1 is greater than str2
 */
function compareAlphaNC(str1, str2) {
	str1 = str1? str1.toString().toLowerCase() : str1;
	str2 = str2? str2.toString().toLowerCase() : str2;
	return compareAlpha(str1, str2);
}

/**
 * Compare 2 numeric values for sorting.
 *
 * @param  num1 the first numeric value (or null)
 * @param  num2 the second numeric value (or null)
 * @return a negative number (< 0) if num1 is less than num2, 0 if they're
 *         equal, or a positive number (> 0) if num1 is greater than num2
 */
function compareNumeric(num1, num2) {
	if (!num1 && num2) {
		return -1;
	}
	else if (num1 && !num2) {
		return 1;
	}
	else if (!num1 && !num2) {
		return 0;
	}
	else {
		return (num1 - num2);
	}
}

/**
 * Dump the name of the specified node and any contained nodes into a string.
 * 
 * @param  node  a DOM node, potentially containing other nodes
 * @param  level  a number indicating the nesting level of the node
 * @return a string containing an outline of the node's structure
 */
function dumpNodeStructure(node, level) {
	var result= '';
	if (node) {
		if (!level) {
			level= 0;
		}
		for (var i= 0; i < level; i++) {
			result += '  ';
		}
		result += (node.nodeName)? node.nodeName : '?';
		if (node.attributes && node.attributes.length) {
			var attrs= node.attributes;
			for (var j= 0; j < attrs.length; j++) {
				if (attrs[j] && attrs[j].nodeName) {
					result += ' ' + attrs[j].nodeName;
					if (attrs[j].nodeValue) {
						result += '=\"' + escapeHTML(attrs[j].nodeValue) + '\"';
					}
				}
			}
		}
		if (node.nodeType == 3) {
			if (node.nodeValue) {
				result += ' -- ';
				result += node.nodeValue;
			}
		}
		result += '\n';
		if (node.childNodes && node.childNodes.length) {
			for (var k= 0; k < node.childNodes.length; k++) {
				result += dumpNodeStructure(node.childNodes[k], (level + 1));
			}
		}
	}
	return result;
}

/**
 * @param  s  the string to check
 * @param  suffix  the suffix to check for
 * @return true if s ends with the suffix, false otherwise
 */
function endsWith(s, suffix) {
	var pos= s.indexOf(suffix);
	return (pos >= 0 && pos == (s.length - suffix.length));
}

/**
 * Escape the following characters which are reserved in HTML: &, >, <, ",
 * and '.
 *
 * @param  text  the input text
 * @return  the escaped text
 */
function escapeHTML(text) {
	return text? text.toString().replace(/&/g,'&amp;').replace(/>/g,'&gt;')
			.replace(/</g,'&lt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;') : '';
}

/**
 * Escape the following characters which are reserved in XML: &, >, <, ",
 * and '.
 *
 * @param  text  the input text
 * @return  the escaped text
 */
function escapeXML(text) {
	return text? text.toString().replace(/&/g,'&amp;').replace(/>/g,'&gt;')
			.replace(/</g,'&lt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;') : '';
}

/**
 * Take a number and format it as a dollar amount.
 * 
 * @param  number  the number to format
 */
function formatAmountDollars(number) {
	return isAssigned(number)? '$' + formatNumber(number, 1, 2) : '';
}

/**
 * Take a number and format it with a specified number of whole digits and 
 * decimal places.
 * 
 * @param  number  the number to format
 * @param  wholeDigits  the number of whole digits to display
 * @param  decimalPlaces  the number of decimal places to display
 * @return a numeric string ('0.33' for example)
 */
function formatNumber(number, wholeDigits, decimalPlaces) {
	var numStr;
	if (number == null) {
		numStr= '';
	}
	else if (isNaN(number)) {
		numStr= number;
	}
	else {
		var f= Number(number);
		if (decimalPlaces > 0) {
			f= f * Math.pow(10, decimalPlaces);
		}
		f= Math.round(f);
		if (decimalPlaces > 0) {
			f= f / Math.pow(10, decimalPlaces);
		}
		numStr= '' + f;
		var wholeDecimal= numStr.split('.');
		var whole= wholeDecimal[0];
		var decimal= (wholeDecimal.length > 1)? wholeDecimal[1] : '';
		// Temporarily remove negative sign
		var negative= false;
		if (whole.length > 0 && whole.charAt(0) == '-') {
			negative= true;
			whole= whole.substring(1, whole.length);
		}
		while (whole.length < wholeDigits) {
			whole= '0' + whole;
		}
		if (decimalPlaces > 0) {
			while (decimal.length < decimalPlaces) {
				decimal= decimal + '0';
			}
			numStr= whole + '.' + decimal;
		}
		else {
			numStr= whole;
		}
		// Restore the negative sign
		if (negative) {
			numStr= '-' + numStr;
		}
	}
	return numStr;
}

/**
 * Get the event object for event handlers.
 * 
 * @param  e  potentially the event object (if using FireFox)
 * @return the event object (for either FireFox or IE)
 */
function getEvent(e) {
	if (!e) {
		e= window.event;
	}
	return e;
}

/**
 * Get the options text for a pop-up window. This function insures that pop-up
 * windows will not be too large to fit on the client's screen. It hardcodes
 * the 'scrollbars', 'resizable', and 'titlebar' options to 'yes'.
 *
 * @param  width  the preferred width of the window
 * @param  height  the preferred height of the window
 * @return  the options text
 */
function getWindowOptions(width, height) {
	var w= (width < screen.availWidth)? width : screen.availWidth;
	var h= (height < screen.availHeight)? height : screen.availHeight;
	return 'width=' + w + ',height=' + h
			+ ',scrollbars=yes,resizable=yes,titlebar=yes';
}

/**
 * Determine if the specified value is an array.
 * 
 * @param  value  the value to check
 * @return true if the value is an array, false otherwise
 */
function isArray(value) {
	return (Object.prototype.toString.apply(value) === '[object Array]');
}

/**
 * Determine if the specified value has been assigned (it's not null or undefined).
 * 
 * @param  value  the value to check
 * @return true if the value is assigned, false otherwise
 */
function isAssigned(value) {
	return (typeof value !== 'undefined' && value !== null);
}

/**
 * Convert some text to its 'proper' case (first letter of every word capitalized, other letters not).
 * 
 * @param text
 * @return
 */
function properCase(text) {
	return text.toString().toLowerCase().replace(/^(.)|\s(.)/g, 
	          function($1) { return $1.toUpperCase(); });
}

/**
 * Remove all children from an DOM node.
 * 
 * @param  node  the DOM node
 * @return the DOM node
 */
function removeChildren(node) {
	while (node.lastChild) {
		node.removeChild(node.lastChild);
	}
	return node;
}

/**
 * @param  s  the string to check
 * @param  prefix  the prefix to check for
 * @return true if s starts with the prefix, false otherwise
 */
function startsWith(s, prefix) {
	return (s.indexOf(prefix) == 0);
}

/**
 * @param  s  the string to trim
 * @return s with leading and trailing whitespace removed
 */
function trim(s) {
	return s.toString().replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Unescape the following HTML entities into their corresponding characters: &amp;, &gt;, 
 * &lt;, &quot;, and &#39;.
 *
 * @param  text  the input text
 * @return  the unescaped text
 */
function unescapeHTML(text) {
	return text? text.toString().replace(/&gt;/g,'>').replace(/&lt;/g,'<')
			.replace(/&quot;/g,'"').replace(/&#39;/g,'\'').replace(/&amp;/g,'&') : '';
}

/**
 * Unescape the following XML entities into their corresponding characters: &amp;, &gt;, 
 * &lt;, &quot;, and &apos;.
 *
 * @param  text  the input text
 * @return  the unescaped text
 */
function unescapeXML(text) {
	return text? text.toString().replace(/&gt;/g,'>').replace(/&lt;/g,'<')
			.replace(/&quot;/g,'"').replace(/&apos;/g,'\'').replace(/&#39;/g,'\'')
			.replace(/&amp;/g,'&') : '';
}
