/**!
 * co-event-wrap - index.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var co = require('co');

module.exports = wrap;

function wrap(emitter) {
  var on = emitter.on;
  var once = emitter.once;
  var removeListener = emitter.removeListener;

  emitter.on = emitter.addListener = function (type, listener) {
    var wrapListener = listener;
    if (listener.constructor.name === 'GeneratorFunction') {
      wrapListener = co(listener);
      listener.__coEventWrapListener = wrapListener;
    }
    on.call(emitter, type, wrapListener);
  };

  emitter.removeListener = function (type, listener) {
    if (listener && listener.__coEventWrapListener) {
      listener = listener.__coEventWrapListener;
    }
    removeListener.call(emitter, type, listener);
  };

  emitter.once = function (type, listener) {
    if (listener.constructor.name === 'GeneratorFunction') {
      listener = co(listener);
    }
    once.call(emitter, type, listener);
  };

  return emitter;
}
