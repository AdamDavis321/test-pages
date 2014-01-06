/*
 * Requires functions in the miscUtils.js file.
 */

function ServerInfo(pDescription, pLongDesc, pUrlPrefix, pWindowName) {
	if (arguments.length === 1 && typeof(arguments[0]) === 'object') {
		this.description= arguments[0].description;
		this.longDesc= arguments[0].longDesc;
		this.urlPrefix= arguments[0].urlPrefix;
		this.windowName= arguments[0].windowName;
	} else {
		this.description= pDescription;
		this.longDesc= pLongDesc;
		this.urlPrefix= pUrlPrefix;
		this.windowName= pWindowName;
	}
}

ServerInfo.prototype= {
	toString: function() {
		return 'ServerInfo: {description=' + this.description 
				+ ', longDesc=' + this.longDesc 
				+ ', urlPrefix=' + this.urlPrefix 
				+ ', windowName=' + this.windowName + '}';
	}
};

function LinkInfo(pDescription, pUrlSuffix) {
	if (arguments.length === 1 && typeof(arguments[0]) === 'object') {
		this.description= arguments[0].description;
		this.urlSuffix= arguments[0].urlSuffix;
	} else {
		this.description= pDescription;
		this.urlSuffix= pUrlSuffix;
	}
}

LinkInfo.prototype= {
	toString: function() {
		return 'LinkInfo: {description=' + this.description 
				+ ', urlSuffix=' + this.urlSuffix + '}';
	}
};

function ServerLinks(pServers, pLinks, pLinkAreaId, pBlockIdPrefix, 
		pBlockClass, pLinkClass) {
	this.servers= (pServers)? pServers : new Array();
	this.links= (pLinks)? pLinks : new Array();
	this.linkAreaId= (pLinkAreaId)? pLinkAreaId : 'pageContent';
	this.blockIdPrefix= (pBlockIdPrefix)? pBlockIdPrefix : 'server';
	this.blockClass= (pBlockClass)? pBlockClass : null;
	this.linkClass= (pLinkClass)? pLinkClass : null;
}

ServerLinks.prototype= { 
	createLink: function(serverInfo, linkInfo) {
		var a= document.createElement('a');
		a.setAttribute('href', serverInfo.urlPrefix + linkInfo.urlSuffix);
		if (this.linkClass) {
			a.className= this.linkClass;
		}
		if (serverInfo.windowName) {
			a.setAttribute('target', serverInfo.windowName);
		}
		a.innerHTML= linkInfo.description;
		return a;
	},
	
	createLinkBlock: function(s) {
		var div= document.createElement('div');
		div.id= this.blockIdPrefix + s;
		if (this.blockClass) {
			div.className= this.blockClass;
		}
		var h2= document.createElement('h2');
		h2.innerHTML= this.servers[s].description;
		div.appendChild(h2);
		if (this.servers[s].longDesc) {
			var para= document.createElement('p');
			para.innerHTML= this.servers[s].longDesc;
			div.appendChild(para);
		}
		var ul= document.createElement('ul');
		for (var l= 0; l < this.links.length; l++) {
			var li= document.createElement('li');
			li.appendChild(this.createLink(this.servers[s], this.links[l]));
			ul.appendChild(li);
		}
		div.appendChild(ul);
		return div;
	},
	
	initLinkArea: function() {
		var linkArea= document.getElementById(this.linkAreaId);
		if (linkArea) {
			for (var s= 0; s < this.servers.length; s++) {
				linkArea.appendChild(this.createLinkBlock(s));
			}
		}
		else {
			if (console && console.log) {
				console.log('ServerLinks.initLinkArea - Error: The linkAreaId (' + this.linkAreaId 
						+ ') could not be found!');
			}
		}
	},
	
	toString: function() {
		return 'ServerLinks: {servers=' + this.servers 
				+ ', links=' + this.links
				+ ', linkAreaId=' + this.linkAreaId
				+ ', blockIdPrefix=' + this.blockIdPrefix
				+ ', blockClass=' + this.blockClass
				+ ', linkClass=' + this.linkClass + '}';
	}
};
