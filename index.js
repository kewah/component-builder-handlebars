'use strict';

var path = require('path');
var join = path.join;
var fs = require('fs');
var exists = fs.existsSync;
var read = fs.readFileSync;
var defaults = require('defaults');
var Handlebars = require('handlebars');
var partials = [];
var runtime = runtimeFile();


exports = module.exports = function(opts) {
  opts = defaults(opts, {
    extname: 'hbs',
    partialRegex: /^_/
  });

  partials = [];

  return function builderHandlebars(file, done) {
    if (file.extension !== opts.extname) return done();

    file.read(function(err, string) {
      if (err) return done(err);

      var filename = path.basename(file.path, '.' + file.extension);
      var compiled = Handlebars.precompile(string);
      var output = 'Handlebars.template(' + compiled + ')';

      if (opts.partialRegex.test(filename)) {
        // Register the partial as: moduleName/_fileName
        output = 'Handlebars.registerPartial("'
          + file.branch.name + '/' + file.path.replace('.' + file.extension, '')
          + '", ' + output + ');\n';

        partials.push(file.branch.canonical + '/' + file.path);
      } else {
        output = 'module.exports = ' + output;
      }

      file.string = output;

      done();
    });
  };
};


exports.includeRuntime = function includeRuntime() {
  var string = runtime;
  string += 'this.Handlebars = window.Handlebars = Handlebars;\n';

  if (!partials.length) return string;

  // Auto requires partials.
  partials.forEach(function(p) {
    string += 'require("' + p + '");\n';
  });

  return string;
};


function runtimeFile() {
  var runtimePath = join(__dirname, 'node_modules/handlebars/dist/handlebars.runtime.js');

  if (!exists(runtimePath)) {
    runtimePath = join(__dirname, 'handlebars.runtime.js');
  }

  return read(runtimePath, 'utf-8');
}
