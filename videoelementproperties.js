
const Node = {
	baseURI: '', // String
	childNodes: [], // NodeList
	firstChild: null, // Node
	lastChild: null, // Node
	nextSibling: null, // Node
	nodeName: '', // String
	nodeType: 1, // Number
	nodeValue: null, // Object
	ownerDocument: {}, // Document
	parentNode: null, // Node
	parentElement: null, // Element
	previousSibling: null, // Node
	textContent: null, // Object
};

const Element = Object.assign({}, Node, {
	attributes: [], // NamedNodeMap
	childElementCount: 0, // Number
	classList: [], // DOMTokenList
	className: '', // String
	id: '', // String
	innerHTML: '', // String
	localName: '', // String
	namespaceURI: null, // String
	nextElementSibling: null, // Element
	outerHTML: '', // String
	prefix: null, // String
	previousElementSibling: null, // Element
	tagName: '', // String

	// experimental
	clientHeight: 0, // Number
	clientLeft: 0, // Number
	clientTop: 0, // Number
	clientWidth: 0, // Number
	scrollHeight: 0, // Number
	scrollLeft: 0, // Number
	scrollTop: 0, // Number
	scrollWidth: 0, // Number
	shadowRoot: null, // ShadowRoot
	slot: '', // String
});

const HTMLElement = Object.assign({}, Element, {
	accessKey: '', // String
	accessKeyLabel: '', // String
	contentEditable: 'inherit', // String
	isContentEditable: false, // Boolean
	contextMenu: null, // HTMLMenuElement
	dataset: {}, // DOMStringMap
	dir: '', // String
	draggable: false, // Boolean
	hidden: false, // Boolean
	lang: '', // String
	style: {}, // CSSStyleDeclaration
	tabIndex: 0, // Number
	title: '', // String

	// experimental
	offsetHeight: 0, // Number
	offsetLeft: 0, // Number
	offsetParent: null, // Element
	offsetTop: 0, // Number
	offsetWidth: 0, // Number
	translate: true, // Boolean
});

const HTMLMediaElement = Object.assign({}, HTMLElement, {
	audioTracks: [], // AudioTrackList
	autoplay: false, // Boolean
	buffered: {}, // TimeRanges
	controller: undefined, // MediaController
	controls: false, // Boolean
	controlsList: [], // DOMTokenList
	crossOrigin: null, // String|enum:'anonymous','use-credentials'
	currentSrc: '', // String
	currentTime: 0, // Number
	defaultMuted: false, // Boolean
	defaultPlaybackRate: 1, // Number
	disableRemotePlayback: false, // Boolean
	duration: NaN, // Number
	ended: false, // Boolean
	error: null, // MediaError
	loop: false, // Boolean
	mediaKeys: null, // MediaKeys
	muted: false, // Boolean
	networkState: 0, // Number
	paused: true, // Boolean
	playbackRate: 1, // Number
	played: {}, // TimeRanges
	preload: '', // String|enum:'none','metadata','auto'
	readyState: 0, // Number
	seekable: {}, // TimeRanges
	seeking: false, // Boolean
	src: '', // String
	srcObject: null, // MediaStream
	textTracks: [], // TextTrackList
	videoTracks: [], // VideoTrackList
	volume: 1, // Number
});

const HTMLVideoElement = Object.assign({}, HTMLMediaElement, {
	height: 0, // Number
	poster: '', // String
	videoHeight: 0, // Number
	videoWidth: 0, // Number
	width: 0, // Number

	playsInline: false, // Boolean
});

const video = Object.assign({}, HTMLVideoElement, {
	autoplay: false, // Boolean
	buffered: {}, // TimeRanges
	controls: false, // Boolean
	crossorigin: undefined, // String|enum:'anonymous','use-credentials'
	height: 0, // Number
	loop: false, // Boolean
	muted: false, // Boolean
	played: {}, // TimeRanges
	preload: '', // String|enum:'none','metadata','auto'
	poster: '', // String|URL
	src: '', // String|URL
	width: 0, // Number
	playsinline: undefined, // Boolean
});

export default video;
