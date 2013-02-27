var Builder = require('component-builder');
var plugin = require('../lib/plugin');
var vm = require('vm');

describe('Handlerbars plugin', function() {

  var req = function(res, moduleName) {
    return 'var window = "";' + res.require + res.js + '; require("' + moduleName + '")';
  };

  it('should precompile templates and partials', function(done) {
    var builder = new Builder('test/fixtures/tpl-and-partial');
    builder.use(plugin());

    builder.build(function(err, res) {
      if (err) return done(err);

      var test1 = vm.runInNewContext(req(res, 'test-tpl-and-template/test1'));
      test1({}).should.equal('<h1>Hello</h1>');

      var test2 = vm.runInNewContext(req(res, 'test-tpl-and-template/test2'));
      test2({ content: 'hi' }).should.equal('<h2>Say hi</h2>');

      var test3 = vm.runInNewContext(req(res, 'test-tpl-and-template/test3'));
      test3({ content: 'World' }).should.equal('<p>Partial</p>\n<p>Hello</p>\n<p>World</p>');

      return done();
    });
  });

  it('should precompile templates from external module', function(done) {
    var builder = new Builder('test/fixtures/with-dependencies');
    builder.addLookup('test/fixtures/with-dependencies/local');
    builder.use(plugin());

    builder.build(function(err, res) {
      if (err) return done(err);

      var test1 = vm.runInNewContext(req(res, 'test-with-dependencies/test'));
      test1({ content: 'World' }).should.equal('<p>Hello</p>\n<p>World</p>');

      var depTest = vm.runInNewContext(req(res, 'local-component-test/template'));
      depTest({}).should.equal('<div>Local component template</div>\n<div>hey</div>');

      return done();
    });
  });

  it('should precompile nested partials', function(done) {
    var builder = new Builder('test/fixtures/nested-partial');
    builder.use(plugin());

    builder.build(function(err, res) {
      if (err) return done(err);

      var top = vm.runInNewContext(req(res, 'test-nested-partial/views/top'));
      top({}).should.equal('<h1>Hello</h1>\n<nav></nav>\n<ul><li></li></ul>');

      return done();
    });
  });

  it('should precompile include the runtime', function(done) {
    var builder = new Builder('test/fixtures/tpl-only-in-dependencies');
    builder.addLookup('test/fixtures/tpl-only-in-dependencies/local');
    builder.addSourceURLs();
    builder.use(plugin());

    builder.build(function(err, res) {
      if (err) return done(err);

      var tpl = vm.runInNewContext(req(res, 'local-component-test/template'));
      tpl({}).should.equal('<div>Local component template</div>');

      return done();
    });
  });

});