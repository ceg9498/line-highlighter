const defaultSettings = Object.freeze({
	on: false,
	background: true,
	backgroundColor: '#22ff00',
	backgroundAlpha: '40',
	backgroundHeight: '30',
	topBorder: false,
	topWidth: '2',
	topColor: '#ff0000',
	bottomBorder: false,
	bottomWidth: '2',
	bottomColor: '#ff0000'
});

// get elements for background settings
const bgToggle = document.getElementById('background-toggle');
const bgCurrent = document.getElementById('background-current');
const bgColor = document.getElementById('highlight-color');
const bgHeight = document.getElementById('highlight-height');
const bgSettings = document.getElementById('bg-settings');
// set the toggle onchange
bgToggle.onchange = () => {
	updateSetting('background', bgToggle.checked);
	toggleDisable(bgSettings, bgToggle.checked, bgCurrent);
}

// get elements for top border settings
const topToggle = document.getElementById('top-border');
const topCurrent = document.getElementById('top-border-current');
const topHeight = document.getElementById('top-height');
const topColor = document.getElementById('top-color');
const topSettings = document.getElementById('top-settings');
// set the toggle onchange
topToggle.onchange = () => {
	updateSetting('topBorder', topToggle.checked);
	toggleDisable(topSettings, topToggle.checked, topCurrent);
}

// get elements for bottom border settings
const botToggle = document.getElementById('bottom-border');
const botCurrent = document.getElementById('bottom-border-current');
const botHeight = document.getElementById('bottom-height');
const botColor = document.getElementById('bottom-color');
const botSettings = document.getElementById('bot-settings');
// set the toggle onchange
botToggle.onchange = () => {
	updateSetting('bottomBorder', botToggle.checked);
	toggleDisable(botSettings, botToggle.checked, botCurrent);
}


chrome.storage.local.get('settings', ({settings}) => {
	const options = settings ?? defaultSettings;
	if(!settings) {
		chrome.storage.local.set({
			settings: defaultSettings,
		});
	}

	// background settings
	// set current options
	bgToggle.checked = options.background;
	bgColor.value = options.backgroundColor;
	bgHeight.value = options.backgroundHeight;
	// set updaters
	toUpdateValue(bgColor, 'backgroundColor');
	toUpdateValue(bgHeight,'backgroundHeight');
	// disable or enable based on current settings
	toggleDisable(bgSettings, options.background, bgCurrent);

	// top border
	// set current options
	topToggle.checked = options.topBorder;
	topHeight.value = options.topWidth;
	topColor.value = options.topColor;
	// set updaters
	toUpdateValue(topHeight, 'topWidth');
	toUpdateValue(topColor, 'topColor');
	// disable or enable based on current settings
	toggleDisable(topSettings, options.topBorder, topCurrent);

	// bottom border
	// set current options
	botToggle.checked = options.bottomBorder;
	botHeight.value = options.bottomWidth;
	botColor.value = options.bottomColor;
	// set updaters
	toUpdateValue(botHeight, 'bottomWidth');
	toUpdateValue(botColor, 'bottomColor');
	// disable or enable based on current settings
	toggleDisable(botSettings, options.bottomBorder, botCurrent);
});

function toggleDisable(element, status, textElement) {
	const children = element.getElementsByTagName('input');
	if(status){
		element.classList.remove('disabled');
		for(let i = 0; i < children.length; i++) {
			children[i].removeAttribute('disabled');
		}
		textElement.classList.add('on');
		textElement.classList.remove('off');
	} else {
		element.classList.add('disabled');
		for(let i = 0; i < children.length; i++) {
			children[i].setAttribute('disabled', "");
		}
		textElement.classList.add('off');
		textElement.classList.remove('on');
	}
}

function toUpdateValue(element, setting) {
	element.onchange = (event) => {
		updateSetting(setting, event.target.value);
	}
}

function toUpdateChecked(element, setting) {
	console.log('adding onchange for', setting);
	element.onchange = (event) => {
		console.log('changing:',setting);
		updateSetting(setting, event.target.checked);
	}
}

function updateSetting(key, value) {
	chrome.storage.local.get('settings', ({settings}) => {
		chrome.storage.local.set({
			settings: {
				...settings,
				[key]: value
			}
		});
	});
}

document.getElementById('restore-default').onclick = () => {
	chrome.storage.local.set({
		settings: defaultSettings
	});
	// height
	bgHeight.value = defaultSettings.backgroundHeight;
	// background
	bgToggle.checked = defaultSettings.background;
	toggleDisable(bgSettings, bgToggle.checked, bgCurrent);
	bgColor.value = defaultSettings.backgroundColor;
	// top border
	topToggle.checked = defaultSettings.topBorder;
	toggleDisable(topSettings, topToggle.checked, topCurrent);
	topHeight.value = defaultSettings.topWidth;
	topColor.value = defaultSettings.topColor;
	// bottom border
	botToggle.checked = defaultSettings.bottomBorder;
	toggleDisable(botSettings, botToggle.checked, botCurrent);
	botHeight.value = defaultSettings.bottomWidth;
	botColor.value = defaultSettings.bottomColor;
}

/**
 * Highlighter sample code; allows the user to know what the result of options
 * selected will look like on a web page.
 */

const container = document.getElementById('sample-view');
const highlight = document.getElementById('highlight-sample');
highlight.style.position = 'absolute';
highlight.style.width = '100%';
highlight.style.left = '0';
highlight.style.top = '0';
highlight.style['pointer-events'] = 'none';
highlight.style['border-top-style'] = 'solid';
highlight.style['border-bottom-style'] = 'solid';
highlight.style['z-index'] = '10';

// user-changable styles
chrome.storage.local.get('settings', ({settings}) => {
	setStyles(settings, null);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
	for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
		setStyles(newValue, oldValue);
	}
});

function setStyles(settings, prev) {
	let minusHeight = (settings.backgroundHeight/2);
	if(settings.topBorder) minusHeight += parseInt(settings.topWidth);
	highlight.style.height = settings.backgroundHeight + 'px';

	container.onmousemove = event => {
		const rect = event.currentTarget.getBoundingClientRect();
		highlight.style.top = (event.clientY-rect.top+window.scrollY-minusHeight)+"px";
	}

	if(settings.background) {
		highlight.style['background-color'] = settings.backgroundColor + settings.backgroundAlpha;
	} else {
		highlight.style['background-color'] = 'transparent';
	}
	if(settings.topBorder) {
		highlight.style['border-top-width'] = settings.topWidth + 'px';
		highlight.style['border-top-color'] = settings.topColor;
	} else {
		highlight.style['border-top-width'] = '0px';
	}
	if(settings.bottomBorder) {
		highlight.style['border-bottom-width'] = settings.bottomWidth + 'px';
		highlight.style['border-bottom-color'] = settings.bottomColor;
	} else {
		highlight.style['border-bottom-width'] = '0px';
	}
}