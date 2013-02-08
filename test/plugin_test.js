var Builder = require('component-builder');
var plugin = require('../lib/plugin');
var vm = require('vm');

describe('Handlerbars plugin', function() {

  it('should return HTML', function(done) {
    var builder = new Builder('test/fixtures');
    builder.use(plugin());
    builder.build(function(err, res) {
      if (err) return done(err);

      var test1 = vm.runInNewContext(res.require + res.js + '; require("test/test1")');
      test1({}).should.equal('<h1>Hello</h1>');

      var test2 = vm.runInNewContext(res.require + res.js + '; require("test/test2")');
      test2({ content: 'hi'}).should.equal('<h2>Say hi</h2>');

      var test3 = vm.runInNewContext(res.require + res.js + '; require("test/test3")');
      test3({content: 'World'}).should.equal('<p>Partial</p>\n<p>Hello</p>\n<p>World</p>');

      done();
    });
  });

});