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
    var wrapped = listener;
    if (listener.constructor.name === 'GeneratorFunction') {
      wrapped = wrapListener(listener);
      listener.__coEventWrapListener = wrapped;
    }
    on.call(emitter, type, wrapped);
  };

  emitter.removeListener = function (type, listener) {
    if (listener && listener.__coEventWrapListener) {
      listener = listener.__coEventWrapListener;
    }
    removeListener.call(emitter, type, listener);
  };

  emitter.once = function (type, listener) {
    if (listener.constructor.name === 'GeneratorFunction') {
      listener = wrapListener(listener);
    }
    once.call(emitter, type, listener);
  };

  return emitter;
}

function wrapListener(listener) {
  return function () {
    var wrapped = co.wrap(listener);
    wrapped.apply(null, arguments).then(noop);
  };
}

function noop() {}
