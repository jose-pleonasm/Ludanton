'use strict';
import NativePlayer from './NativePlayer.js';

export const techPlayerFactory = (...args) => new NativePlayer(...args);
