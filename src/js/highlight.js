const docs = document.getElementsByTagName('p');
const highlight = document.createElement('div');

let minusHeight;
let on;

highlight.style.position = 'absolute';
highlight.style.width = '100vw';
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
	on = settings.on;
	console.log("settings:",on ? 'on' : 'off');
	if(on && (!prev || !prev.on )) {
		console.log('add highlight');
		document.body.insertBefore(highlight, null);

		document.body.onmousemove = event => {
			highlight.style.top = (event.clientY+window.scrollY-minusHeight)+"px";
		};
	} else if(!on && (prev && prev.on)) {
		console.log('remove highlight');
		highlight.remove();
	}
	minusHeight = (settings.backgroundHeight/2);
	if(settings.topBorder) minusHeight += parseInt(settings.topWidth);
	highlight.style.height = settings.backgroundHeight + 'px';
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
