'use strict';

var fs = require('fs-extra');
var path = require('path');
var Resolver = require('component-resolver');
var Builder = require('component-builder');
var hbs = require('..');

Resolver(__dirname, {
  install: true,
  out: path.resolve(__dirname, 'components')
}, function(err, tree) {
  Builder.scripts(tree)
    .use('scripts', Builder.plugins.js())
    .use('templates', hbs())
    .end(function(err, string) {
      string = Builder.scripts.require + string;
      string += hbs.includeRuntime();
      string += 'require("' + Builder.scripts.canonical(tree).canonical + '")\n';

      fs.outputFileSync(path.resolve(__dirname, 'build/build.js'), string);
    });
});
