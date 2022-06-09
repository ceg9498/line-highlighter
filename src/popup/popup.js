const onoffToggle = document.getElementById('onoff-toggle');
const onoffText = document.getElementById('onoff-text');
const settings = document.getElementById('settings');

const defaultSettings = Object.freeze({
	on: false,
	background: true,
	backgroundColor: '#4045ed',
	backgroundAlpha: '40',
	backgroundHeight: '20',
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

	// fill settings
	// on/off switch
	onoffToggle.checked = options.on;
	setContent(onoffText, onoffToggle.checked ? 'on' : 'off');
});

onoffToggle.onchange = () => {
	updateSetting('on', onoffToggle.checked);
	setContent(onoffText, onoffToggle.checked ? 'on' : 'off');
}

settings.onclick = () => {
	chrome.runtime.openOptionsPage();
}

function setContent(element, content) {
	element.innerHTML = content;
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