/* global describe, it */
'use strict';

var path = require('path');
var assert = require('assert');
var Resolver = require('component-resolver');
var Builder = require('component-builder');
var vm = require('vm');
var hbs = require('..');


describe('builder-handlebars', function() {

  it('should precompile templates', function(done) {
    resolve('simple-template', function(err, tree, string) {
      if (err) return done(err);

      var test = vm.runInNewContext(req(string, tree));
      assert.equal(test({ hi: 'hej' }).trim(), '<h1>hej</h1>');
      done();
    });
  });

  it('should precompile partials', function(done) {
    resolve('with-partials', function(err, tree, string) {
      if (err) return done(err);

      var test = vm.runInNewContext(req(string, tree));
      assert.equal(test().trim(), '<h1>Hello</h1>\n<nav><ul><li></li></ul></nav>');
      done();
    });
  });

  it('should precompile templates from external module', function(done) {
    resolve('with-dependencies', function(err, tree, string) {
      if (err) return done(err);

      var test = vm.runInNewContext(req(string, tree));
      assert.equal(test({ hi: 'hej' }).trim(), '<div>hej</div>');
      done();
    });
  });

});


function fixture(name) {
  return path.join(__dirname, 'fixture', name);
}


function req(string, tree) {
  return 'var window = "";'
    + Builder.scripts.require
    + string
    + hbs.includeRuntime()
    + 'require("' + Builder.scripts.canonical(tree).canonical + '")';
}


function resolve(name, cb) {
  Resolver(fixture(name), function(err, tree) {
    Builder.scripts(tree)
      .use('scripts', Builder.plugins.js())
      .use('templates', hbs())
      .end(function(err, string) {
        cb(err, tree, string);
      });
  });
}
