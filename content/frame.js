/* globals Components, addEventListener, addMessageListener,
	removeEventListener, removeMessageListener, content */
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
const SVG_NS = 'http://www.w3.org/2000/svg';

/* globals Preferences, Services, BetterReader */
Cu.import('resource://gre/modules/Preferences.jsm');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('chrome://betterreader/content/betterreader.jsm');

let strings = Services.strings.createBundle('chrome://betterreader/locale/strings.properties');

let listener = {
	_events: [
		'AboutReaderContentLoaded'
	],
	_messages: [
		'BetterReader:disable'
	],
	init: function() {
		for (let e of this._events) {
			addEventListener(e, this, false, true);
		}
		for (let m of this._messages) {
			addMessageListener(m, this);
		}
	},
	destroy: function() {
		for (let e of this._events) {
			removeEventListener(e, this, false, true);
		}
		for (let m of this._messages) {
			removeMessageListener(m, this);
		}
	},
	handleEvent: function(event) {
		switch (event.type) {
		case 'AboutReaderContentLoaded':
			loaded();
			break;
		}
	},
	receiveMessage: function(message) {
		switch (message.name) {
		case 'BetterReader:disable':
			this.destroy();
			break;
		}
	}
};
listener.init();

function loaded() {
	if (!content || !isAboutReader()) {
		return;
	}

	let varNames = [
		'content-background', 'content-foreground', 'content-links',
		'controls-background', 'controls-foreground', 'controls-highlight'
	];
	for (let v of varNames) {
		content.document.documentElement.style.setProperty('--' + v, BetterReader.getColourVariable(v));
	}
	varNames.pop(); // remove controls-highlight

	let style = content.document.createElement('style');
	style.setAttribute('scoped', '');
	style.textContent = '@import url("chrome://betterreader/content/content.css");';
	content.document.body.insertBefore(style, content.document.body.firstChild);

	let toolbar = content.document.getElementById('reader-toolbar');
	style = content.document.createElement('style');
	style.setAttribute('scoped', '');
	style.textContent = '@import url("chrome://betterreader/content/controls.css");';
	toolbar.insertBefore(style, toolbar.children[1]);

	let dropdown = content.document.getElementById('style-dropdown');
	let popup = content.document.getElementById('reader-popup');
	let before = content.document.getElementById('font-size-buttons');

	let fontTypeButtons = content.document.getElementById('font-type-buttons');
	fontTypeButtons.style.display = fontTypeButtons.nextElementSibling.style.display = 'none';

	let div = content.document.createElement('div');
	div.id = 'font-choice';

	let select = content.document.createElement('select');
	select.id = 'font-choice-select';
	let fontEnumerator = Cc['@mozilla.org/gfx/fontenumerator;1'].createInstance(Ci.nsIFontEnumerator);
	let fonts = [for (f of fontEnumerator.EnumerateAllFonts({})) f].sort(function(a, b) {
		return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
	});
	for (let f of fonts) {
		let option = content.document.createElement('option');
		option.textContent = f;
		select.appendChild(option);
	}
	select.onchange = function() {
		if (dropdown.classList.contains('open')) {
			setFont(this.value);
		}
	};
	div.appendChild(select);

	popup.insertBefore(div, before);
	popup.insertBefore(content.document.createElement('hr'), before);

	div = content.document.createElement('div');
	div.id = 'container-width-buttons';

	let button = content.document.getElementById('close-button');
	button.appendChild(createSVG(
		'M 18.184,8.87 H 9.698 V 4.011 L 1,11.981 9.698,19.95 v -4.82 h 8.486 z M 23,20 ' +
		'V 4 H 11.992 v 2.551 h 8.485 V 17.449 H 11.992 V 20 Z'
	));
	button = dropdown.querySelector('.dropdown-toggle');
	button.appendChild(createSVG(
		'M8.23,18.748v-1.016l1.182-0.146c0.065-0.013,0.12-0.055,0.166-0.127s0.052-0.143,0.02-0.215' +
		'L8.513,14.07 H4.236l-1.104,3.096c-0.039,0.104-0.02,0.199,0.059,0.283s0.153,0.13,0.225,0.137' +
		'l1.123,0.146v1.016H0.232v-1.016l1.123-0.166 L5.837,5.008h2.275l4.443,12.197c0.052,0.124,' +
		'0.103,0.21,0.151,0.259s0.145,0.089,0.288,0.122l0.762,0.146v1.016H8.23z M6.296,8.084l-1.68,' +
		'4.805h3.398L6.296,8.084z M20.05,18.748l-0.264-0.996c-0.345,0.234-0.706,0.443-1.083,0.625' +
		'c-0.331,0.156-0.702,0.298-1.112,0.425 c-0.409,0.127-0.835,0.19-1.277,0.19c-0.364,0-0.704' +
		'-0.06-1.02-0.181s-0.592-0.293-0.829-0.518s-0.424-0.497-0.561-0.815 S13.7,16.801,13.7,16.404' +
		'c0-0.299,0.024-0.576,0.073-0.83s0.146-0.49,0.293-0.708s0.356-0.426,0.63-0.625s0.637-0.392,' +
		'1.089-0.581 s1.008-0.377,1.665-0.566s1.445-0.384,2.363-0.586v-0.244c0-0.098,0.003-0.186,0.01' +
		'-0.264c0-0.091,0.003-0.182,0.01-0.273 c0.007-0.189-0.013-0.392-0.059-0.61s-0.137-0.42-0.273' +
		'-0.605s-0.329-0.338-0.576-0.459s-0.569-0.181-0.967-0.181 c-0.137,0-0.259,0.003-0.366,0.01s' +
		'-0.197,0.016-0.269,0.029c-0.085,0.013-0.159,0.026-0.225,0.039v1.895h-2.061 c-0.169,0.013-0.319' +
		'-0.003-0.449-0.049c-0.11-0.039-0.213-0.107-0.308-0.205s-0.142-0.25-0.142-0.459 c0-0.371,0.132' +
		'-0.703,0.396-0.996c0.263-0.293,0.607-0.542,1.033-0.747s0.904-0.363,1.435-0.474 c0.529-0.111,' +
		'1.058-0.166,1.585-0.166c0.572,0,1.096,0.042,1.57,0.127s0.883,0.249,1.224,0.493c0.342,0.244,' +
		'0.604,0.587,0.79,1.03 s0.278,1.025,0.278,1.748v5.137c0,0.124,0.042,0.229,0.127,0.317s0.188,' +
		'0.138,0.312,0.151l0.879,0.059v0.938H20.05z M19.793,13.592 c-0.645,0.13-1.177,0.264-1.597,0.4s' +
		'-0.754,0.293-1.001,0.469s-0.42,0.376-0.518,0.601s-0.146,0.487-0.146,0.786 c0,0.208,0.034,0.402,' +
		'0.103,0.581s0.166,0.335,0.293,0.469s0.278,0.239,0.454,0.317s0.368,0.117,0.576,0.117 c0.215,0,' +
		'0.432-0.023,0.649-0.068s0.415-0.094,0.591-0.146c0.208-0.065,0.407-0.14,0.596-0.225V13.592z'
	));
	button = content.document.getElementById('font-size-minus');
	button.appendChild(createSVG('M0,13.5v-3h24v3H0z', 18));
	button = content.document.getElementById('font-size-plus');
	button.appendChild(createSVG('M24,13.5H13.5V24h-3V13.5H0v-3h10.5V0h3v10.5H24V13.5z', 18));

	button = content.document.createElement('button');
	button.className = 'narrower-button';
	button.appendChild(createSVG(
		'M 9 4 L 9 11.134766 L 0 5.9375 L 0 18.0625 L 9 12.865234 L 9 20 L 11 20 L 11 4 L 9 4 z ' +
		'M 13 4 L 13 20 L 15 20 L 15 12.865234 L 24 18.0625 L 24 5.9375 L 15 11.134766 L 15 4 L 13 4 z', 32
	));
	button.onclick = function() {
		changeWidth(-5);
	};
	div.appendChild(button);

	button = content.document.createElement('button');
	button.className = 'wider-button';
	button.appendChild(createSVG(
		'M 0 4 L 0 20 L 2 20 L 2 12.865234 L 11 18.0625 L 11 5.9375 L 2 11.134766 L 2 4 L 0 4 z ' +
		'M 22 4 L 22 11.134766 L 13 5.9375 L 13 18.0625 L 22 12.865234 L 22 20 L 24 20 L 24 4 L 22 4 z', 32
	));
	button.onclick = function() {
		changeWidth(5);
	};
	div.appendChild(button);

	before = content.document.getElementById('color-scheme-buttons');

	popup.insertBefore(div, before);
	popup.insertBefore(content.document.createElement('hr'), before);

	div = content.document.createElement('div');
	div.id = 'colour-choice-buttons';
	for (let v of varNames) {
		let stringName = strings.GetStringFromName('css.' + v.replace('-', '.'));
		div.appendChild(content.document.createTextNode(stringName + ' '));
		let input = content.document.createElement('input');
		input.type = 'color';
		input.name = v;
		input.value = BetterReader.toHex(BetterReader.getColourVariable(v));
		input.onchange = function() {
			setColourVariable(this.name, this.value);
		}; // jshint ignore:line
		div.appendChild(input);
		div.appendChild(content.document.createElement('br'));
	}
	popup.insertBefore(div, before);
	popup.insertBefore(content.document.createElement('hr'), before);

	button = content.document.createElement('button');
	button.onclick = function() {
		let values = [for (i of div.querySelectorAll('input[type="color"]')) i.value];
		let id = BetterReader.presets.add(values);
		div.insertBefore(makePresetRow(id, values), this.nextElementSibling);
	};
	div.appendChild(button);

	BetterReader.presets.get().then(function(presets) {
		for (let [id, p] of presets) {
			div.appendChild(makePresetRow(id, p));
		}
	});

	before.style.display = 'none';

	let arrow = dropdown.querySelector('.dropdown-arrow');
	let arrowSVG = createSVG(
		'M 16 1.0019531 L 5 12 L 16 23 L 16 21.585938 L 6.4160156 12 L 16 2.4160156 L 16 1.0019531 z'
	);
	arrowSVG.querySelector('path').classList.add('foreground');
	let arrowFill = content.document.createElementNS(SVG_NS, 'path');
	arrowFill.setAttribute('d', 'M 16,21.585938 6.4160156,12 16,2.4160156 Z');
	arrowFill.classList.add('background');
	arrowSVG.appendChild(arrowFill);
	arrow.appendChild(arrowSVG);

	button = content.document.getElementById('pocket-button');
	button.appendChild(createSVG(
		'M21.901,4.204C21.642,3.484,20.956,3,20.196,3h-0.01h-1.721H3.814C3.067,3,2.385,3.474,2.119,4.179 ' +
		'C2.04,4.388,2,4.606,2,4.828v6.082l0.069,1.21c0.29,2.751,1.707,5.155,3.899,6.832c0.039,0.03,0.079,' +
		'0.06,0.119,0.089l0.025,0.018 c1.175,0.866,2.491,1.452,3.91,1.741C10.677,20.932,11.347,21,12.013,' +
		'21c0.615,0,1.232-0.057,1.839-0.171 c0.073-0.014,0.145-0.028,0.219-0.044c0.02-0.004,0.042-0.012,' +
		'0.064-0.023c1.359-0.299,2.621-0.87,3.753-1.704l0.025-0.018 c0.04-0.029,0.08-0.059,0.119-0.089' +
		'c2.192-1.677,3.609-4.08,3.898-6.832L22,10.91V4.828C22,4.618,21.975,4.409,21.901,4.204z ' +
		'M17.667,10.539l-4.704,4.547c-0.266,0.256-0.608,0.385-0.949,0.385c-0.342,0-0.684-0.129-0.949-0.385' +
		'l-4.705-4.547 c-0.547-0.528-0.565-1.403-0.04-1.954c0.524-0.551,1.392-0.569,1.939-0.041l3.756,3.63' +
		'l3.755-3.63 c0.547-0.528,1.415-0.51,1.939,0.04C18.231,9.136,18.213,10.011,17.667,10.539z'
	));

	setFont(Preferences.get('extensions.betterreader.font'), false);
	setWidth(Preferences.get('extensions.betterreader.width'), false);
}

function isAboutReader() {
	if (!content) {
		return false;
	}
	return content.document.documentURI.startsWith('about:reader');
}

function createSVG(pathD, size = 24) {
	let svg = content.document.createElementNS(SVG_NS, 'svg');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('width', size);
	svg.setAttribute('height', size);
	let path = content.document.createElementNS(SVG_NS, 'path');
	path.setAttribute('d', pathD);
	svg.appendChild(path);
	return svg;
}

function setFont(font, setPref = true) {
	if (!isAboutReader()) { return; }
	if (setPref) {
		BetterReader.setPref('font', font);
	} else {
		// try {
		// 	let r = content.document.createRange();
		// 	r.selectNodeContents(content.document.querySelector("h1, #reader-message"));
		// 	let fonts = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils).getUsedFontFaces(r);
		// 	if (fonts.length) {
		// 		select.value = fonts.item(0).CSSFamilyName;
		// 	}
		// } catch(ex) {
		// 	Cu.reportError(ex);
		// }
		content.document.getElementById('font-choice-select').value = font;
	}
	let container = content.document.getElementById('container');
	container.style.fontFamily = font;
	content.document.getElementById('font-choice-select').style.fontFamily = font;
}

function changeWidth(change) {
	let container = content.document.getElementById('container');
	let style = content.getComputedStyle(container, null);
	let currentWidth = parseFloat(style.maxWidth, 10);
	let fontSize = parseFloat(style.fontSize, 10);
	let newWidth = (currentWidth / fontSize) + change;

	if (newWidth > 80 || newWidth < 20) {
		return;
	}

	setWidth(newWidth);
}

function setWidth(width, setPref = true) {
	if (!isAboutReader()) { return; }
	if (setPref) {
		BetterReader.setPref('width', width);
	}
	let container = content.document.getElementById('container');
	container.style.maxWidth = width + 'em';
}

function setColourVariable(name, value, setPref = true) {
	if (!isAboutReader()) { return; }

	value = BetterReader.toHex(value);

	if (setPref) {
		BetterReader.setColourVariable(name, value);
	}
	content.document.querySelector('input[type="color"][name="' + name + '"]').value = value;
	content.document.documentElement.style.setProperty('--' + name, value);
	if (name == 'controls-foreground') {
		content.document.documentElement.style.setProperty(
			'--controls-highlight',
			BetterReader.toRGB(value, 0.25)
		);
	}
}

function makePresetRow(id, p) {
	if (!Array.isArray(p) || p.length != 5) {
		return;
	}
	let row = content.document.createElement('div');
	row.dataset.id = id;
	for (let c of p) {
		let cell = content.document.createElement('div');
		cell.classList.add('swatch');
		cell.style.backgroundColor = c;
		row.appendChild(cell);
	}
	row.appendChild(content.document.createElement('button'));
	row.onclick = presetOnClick;
	return row;
}

function presetOnClick(event) {
	if (event.originalTarget.localName == 'button') {
		BetterReader.presets.remove(this.dataset.id);
		content.setTimeout(() => this.remove(), 100);
		return;
	}
	setColourVariable('content-background', this.children[0].style.backgroundColor);
	setColourVariable('content-foreground', this.children[1].style.backgroundColor);
	setColourVariable('content-links', this.children[2].style.backgroundColor);
	setColourVariable('controls-background', this.children[3].style.backgroundColor);
	setColourVariable('controls-foreground', this.children[4].style.backgroundColor);
}
