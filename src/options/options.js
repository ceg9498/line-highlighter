const bgToggle = document.getElementById('background-toggle');
const topToggle = document.getElementById('top-border');
const botToggle = document.getElementById('bottom-border');

const options = document.getElementById('options');
const bgSettings = document.getElementById('highlight-extra-settings');
const topSettings = document.getElementById('top-border-extra-settings');
const botSettings = document.getElementById('bottom-border-extra-settings');

const bgCurrent = document.getElementById('background-current');
const topCurrent = document.getElementById('top-border-current');
const botCurrent = document.getElementById('bottom-border-current');
const currentInfo = 'Currently: ';

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

chrome.storage.local.get('settings', ({settings}) => {
	const options = settings ?? defaultSettings;
	if(!settings) {
		chrome.storage.local.set({
			settings: defaultSettings,
		});
	}

	// background settings
	bgToggle.checked = options.background;
	setContent(bgSettings, `
	<label>Color:&nbsp;
		<input type='color' id='highlight-color' value='${options.backgroundColor}' />
	</label>
	`);
	document.getElementById('highlight-height').value = options.backgroundHeight;
	toUpdateValue(document.getElementById('highlight-height'), 'backgroundHeight');
	toUpdateValue(document.getElementById('highlight-color'), 'backgroundColor');
	toggleDisable(bgSettings, options.background, bgCurrent);

	// top border
	topToggle.checked = options.topBorder;
	setContent(topSettings, `
	<label>Height:&nbsp;
		<input type='range'
			id='top-height'
			value='${options.topWidth}'
			min='1' max='40' />
	</label>
	<label>Color:&nbsp;
		<input type='color' id='top-color' value='${options.topColor}' />
	</label>
	`);
	toUpdateValue(document.getElementById('top-height'), 'topWidth');
	toUpdateValue(document.getElementById('top-color'), 'topColor');
	toggleDisable(topSettings, options.topBorder, topCurrent);

	// bottom border
	botToggle.checked = options.bottomBorder;
	setContent(botSettings, `
	<label>Height:&nbsp;
		<input type='range'
			id='bottom-height'
			value='${options.bottomWidth}'
			min='1' max='40' />
	</label>
	<label>Color:&nbsp;
		<input type='color' id='bottom-color' value='${options.bottomColor}' />
	</label>
	`);
	toUpdateValue(document.getElementById('bottom-height'), 'bottomWidth');
	toUpdateValue(document.getElementById('bottom-color'), 'bottomColor');
	toggleDisable(botSettings, options.bottomBorder, botCurrent);
});

bgToggle.onchange = () => {
	updateSetting('background', bgToggle.checked);
	toggleDisable(bgSettings, bgToggle.checked, bgCurrent);
}

topToggle.onchange = () => {
	updateSetting('topBorder', topToggle.checked);
	toggleDisable(topSettings, topToggle.checked, topCurrent);
}

botToggle.onchange = () => {
	updateSetting('bottomBorder', botToggle.checked);
	toggleDisable(botSettings, botToggle.checked, botCurrent);
}

function setContent(element, content) {
	element.innerHTML = content;
}

function toggleDisable(element, status, textElement) {
	const children = element.getElementsByTagName('input');
	if(status){
		element.classList.remove('disabled');
		for(let i = 0; i < children.length; i++) {
			children[i].removeAttribute('disabled');
		}
		textElement.innerHTML = currentInfo + 'on';
	} else {
		element.classList.add('disabled');
		for(let i = 0; i < children.length; i++) {
			children[i].setAttribute('disabled', "");
		}
		textElement.innerHTML = currentInfo + 'off';
	}
}

function toUpdateValue(element, setting) {
	element.onchange = (event) => {
		updateSetting(setting, event.target.value);
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
	document.getElementById('highlight-height').value = defaultSettings.backgroundHeight;
	// background
	bgToggle.checked = defaultSettings.background;
	toggleDisable(bgSettings, bgToggle.checked);
	document.getElementById('highlight-color').value = defaultSettings.backgroundColor;
	// top border
	topToggle.checked = defaultSettings.topBorder;
	toggleDisable(topSettings, topToggle.checked);
	document.getElementById('top-height').value = defaultSettings.topWidth;
	document.getElementById('top-color').value = defaultSettings.topColor;
	// bottom border
	botToggle.checked = defaultSettings.bottomBorder;
	toggleDisable(botSettings, botToggle.checked);
	document.getElementById('bottom-height').value = defaultSettings.bottomWidth;
	document.getElementById('bottom-color').value = defaultSettings.bottomColor;
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