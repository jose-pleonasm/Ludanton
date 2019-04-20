'use strict';

export class EventTarget {
	addEventListener(type, listener, options) {
		
	}

	removeEventListener(type, listener, options) {
		
	}

	dispatchEvent(event) {
		return true; // Boolean
	}
}

export class Node extends EventTarget {
	constructor(properties) {
		super();
		Object.assign(this, properties);
	}

	appendChild(child) {
		return null; // Node
	}

	compareDocumentPosition(otherNode) {
		return 0; // Number
	}

	contains(otherNode) {
		return false; // Boolean
	}

	getRootNode() {
		return null; // Node
	}

	hasChildNodes() {
		return false; // Boolean
	}

	insertBefore(newNode, referenceNode) {
		return newNode; // Node
	}

	isDefaultNamespace(namespaceURI) {
		return false; // Boolean
	}

	isEqualNode(otherNode) {
		return false; // Boolean
	}

	isSameNode(otherNode) {
		return false; // Boolean
	}

	lookupPrefix(namespaceURI) {
		return null; // String
	}

	lookupNamespaceURI(prefix) {
		return null; // String
	}

	normalize() {
		
	}

	removeChild(child) {
		return null; // Element
	}

	replaceChild(newChild, oldChild) {
		return oldChild; // Element
	}
}

export class Element extends Node {
	constructor(properties) {
		super();
		Object.assign(this, properties);
	}

	getAttribute(attributeName) {
		return null; // String
	}

	getAttributeNames() {
		return []; // Array<string>
	}

	getAttributeNS(namespace, name) {
		return null; // String
	}

	getBoundingClientRect() {
		return {}; // DOMRect
	}

	getClientRects() {
		return []; // DOMRectList
	}

	getElementsByClassName(names) {
		return []; // HTMLCollection
	}

	getElementsByTagName(tagName) {
		return []; // HTMLCollection
	}

	getElementsByTagNameNS(namespaceURI, localName) {
		return []; // HTMLCollection
	}

	hasAttribute(name) {
		return false; // Boolean
	}

	hasAttributeNS(namespace, localName) {
		return false; // Boolean
	}

	hasAttributes() {
		return true; // Boolean
	}

	querySelector(selectors) {
		return null; // Element
	}

	querySelectorAll(selectors) {
		return []; // NodeList
	}

	releasePointerCapture(pointerId) {
		
	}

	removeAttribute(name) {
		
	}

	removeAttributeNS(namespace, attrName) {
		
	}

	setAttribute(name, value) {
		
	}

	setAttributeNS(namespace, name) {
		
	}

	setCapture(retargetToElement) {
		
	}

	setPointerCapture(pointerId) {
		
	}

	// experimental
	attachShadow(shadowRootInit) {
		return {}; // ShadowRoot
	}

	animate(keyframes, options) {
		return {}; // Animation
	}

	closest(selectors) {
		return null; // Element
	}

	getAnimations() {
		return [];
	}

	insertAdjacentElement(position, element) {
		return null; // Element
	}

	insertAdjacentHTML(position, text) {
		return null; // Element
	}

	insertAdjacentText(position, element) {
		
	}

	matches(selectorString) {
		return false; // Boolean
	}

	requestPointerLock() {
		
	}

	scrollIntoView(alignToTopOrscrollIntoViewOptions) {
		
	}
}

export class HTMLElement extends Element {
	constructor(properties) {
		super();
		Object.assign(this, properties);
	}

	blur() {
		
	}

	click() {
		
	}

	focus() {
		
	}
}

export class HTMLMediaElement extends HTMLElement {
	constructor(properties) {
		super();
		Object.assign(this, properties);
	}

	addTextTrack() {
		return {}; // VideoPlaybackQuality
	}

	canPlayType(mediaType) {
		return ''; // String|enum:'','maybe','probably'
	}

	fastSeek(time) {
		
	}

	load() {
		
	}

	pause() {
		
	}

	play() {
		return Promise.reject(); // Promise
	}

	// experimental
	captureStream() {
		return {}; // MediaStream
	}

	seekToNextFrame() {
		return Promise.resolve(); // Promise
	}

	setMediaKeys(mediaKeys) {
		return Promise.resolve(); // Promise
	}

	setSinkId(sinkId) {
		return Promise.reject(); // Promise
	}
}

export class Interface extends HTMLMediaElement {
	constructor(properties) {
		super();
		Object.assign(this, properties);
	}

	// experimental
	getVideoPlaybackQuality() {
		return {}; // VideoPlaybackQuality
	}
}

export default Interface;
