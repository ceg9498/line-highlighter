const bgToggle = document.getElementById('background-toggle');
const topToggle = document.getElementById('top-border');
const botToggle = document.getElementById('bottom-border');

const options = document.getElementById('options');
const bgSettings = document.getElementById('highlight-extra-settings');
const topSettings = document.getElementById('top-border-extra-settings');
const botSettings = document.getElementById('bottom-border-extra-settings');

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
	toUpdateValue(document.getElementById('highlight-height'), 'backgroundHeight');
	toUpdateValue(document.getElementById('highlight-color'), 'backgroundColor');
	toggleDisable(bgSettings, options.background);

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
	toggleDisable(topSettings, options.topBorder);

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
	toggleDisable(botSettings, options.bottomBorder);
});

bgToggle.onchange = () => {
	updateSetting('background', bgToggle.checked);
	toggleDisable(bgSettings, bgToggle.checked);
}

topToggle.onchange = () => {
	updateSetting('topBorder', topToggle.checked);
	toggleDisable(topSettings, topToggle.checked);
}

botToggle.onchange = () => {
	updateSetting('bottomBorder', botToggle.checked);
	toggleDisable(botSettings, botToggle.checked);
}

function setContent(element, content) {
	element.innerHTML = content;
}

function toggleDisable(element, status) {
	const children = element.getElementsByTagName('input');
	if(status){
		element.classList.remove('disabled');
		for(let i = 0; i < children.length; i++) {
			children[i].removeAttribute('disabled');
			console.log(children[i]);
		}
	} else {
		element.classList.add('disabled');
		for(let i = 0; i < children.length; i++) {
			children[i].setAttribute('disabled', "");
			console.log(children[i]);
		}
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