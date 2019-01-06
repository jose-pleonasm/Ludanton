/* eslint-disable */
global.logging = require('py-logging');
global.commonkit = require('py-logging/commonkit');
global.py_logging_browserkit = require('py-logging-browserkit');

const Ludanton = require('../../dist/ludanton.js').default;

/*
const error = new Ludanton.LudantonError(
	Ludanton.LudantonError.Code.BAD_HTTP_STATUS,
	Ludanton.LudantonError.Category.GENERAL,
	200,
	'OK'
);

console.log(error);
console.log("\n");
console.log(error.toString());
*/
/*
var video = new Ludanton.VideoModel(Ludanton.VideoProperties);

console.log(video.getVideoPlaybackQuality);
console.log(video.play);
console.log(video.addEventListener);
*/

const element = new Ludanton.VideoModel({...Ludanton.VideoProperties});
const player = new Ludanton.Player(element);

function foo() {}
function eventListener(event) {
	console.log(event);
}

player.addEventListener('MyEvent', eventListener, { once: true });
player.dispatchEvent({ type: 'MyEvent' });
/*
const start = Date.now();
for (let i = 0; i < 10000000; i++) {
	player.addEventListener('foo', foo);
}
const end = Date.now();

console.info(end - start);
*/
console.log(player._listeners);
