/**!
 * co-event-wrap - test/co-event-wrap.test.js
 *
 * Copyright(c) 2014 fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var EventEmitter = require('events').EventEmitter;
var eventWrap = require('../');

function sleep(ms) {
  return function (cb) {
    setTimeout(cb, ms);
  };
}

describe('co-event-wrap.test.js', function () {
  describe('on(type, gen)', function () {
    it('should listen with generator', function (done) {
      var ev = eventWrap(new EventEmitter());
      var count = 0;
      ev.on('data', function* (data) {
        data.should.equal('ok');
        count++;
        yield sleep(10);
        count.should.equal(3);
        ev.listeners('data').should.length(3);
        done();
      });
      // work for normal function
      ev.on('data', function (data) {
        data.should.equal('ok');
        count.should.equal(1);
        count++;
      });
      ev.on('data', function* (data) {
        data.should.equal('ok');
        count.should.equal(2);
        count++;
      });
      setTimeout(function () {
        ev.emit('data', 'ok');
      }, 100);
    });
  });

  describe('once(type, gen)', function () {
    it('should listen with generator', function (done) {
      var ev = eventWrap(new EventEmitter());
      var count = 0;
      ev.once('data', function* (data) {
        data.should.equal('ok');
        count++;
        yield sleep(10);
        count.should.equal(2);
        ev.listeners('data').should.length(0);
        done();
      });
      // work for normal function
      ev.once('data', function (data) {
        data.should.equal('ok');
        count.should.equal(1);
        count++;
      });
      setTimeout(function () {
        ev.emit('data', 'ok');
      }, 100);
    });
  });

  describe('removeListener(type, gen)', function () {
    it('should remove one type all listeners', function () {
      var ev = eventWrap(new EventEmitter());
      var gen = function* (data) {};
      ev.on('data', gen);
      ev.listeners('data').should.length(1);
      ev.listeners('data')[0].should.equal(gen.__coEventWrapListener);
      ev.removeAllListeners('data');
      ev.listeners('data').should.length(0);
    });

    it('should remove one listener', function () {
      var ev = eventWrap(new EventEmitter());
      var gen = function* (data) {};
      var gen2 = function* (data) {};
      var fn = function () {};
      ev.on('data', gen);
      ev.on('data', gen2);
      ev.on('data', fn);
      ev.listeners('data').should.length(3);
      ev.listeners('data')[0].should.equal(gen.__coEventWrapListener);
      ev.listeners('data')[1].should.equal(gen2.__coEventWrapListener);
      ev.listeners('data')[2].should.equal(fn);

      ev.removeListener('data', gen);
      ev.listeners('data').should.length(2);
      ev.listeners('data')[0].should.equal(gen2.__coEventWrapListener);
      ev.listeners('data')[1].should.equal(fn);

      ev.removeListener('data', gen2);
      ev.listeners('data').should.length(1);
      ev.listeners('data')[0].should.equal(fn);

      ev.removeListener('data', fn);
      ev.listeners('data').should.length(0);
    });
  });

  it('should error catched by promise', function(done) {
    var ev = eventWrap(new EventEmitter());
    ev.on('data', function* () {
      throw new Error('error');
    });
    process.once('unhandledRejection', function (err) {
      err.message.should.equal('error');
      done();
    });
    ev.emit('data');
  });
});
