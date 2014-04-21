/*
 * component-builder-handlebars
 * https://github.com/kewah/component-builder-handlebars
 *
 * Copyright (c) 2013 Antoine Lehurt
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var exists = fs.existsSync;
var read = fs.readFileSync;
var path = require('path');
var Handlebars = require('handlebars');

/**
 * Precompile Handlebars templates and partials.
 *
 * @param  {Object} opts  - extname: define the handlebars extension name.
 *                        - partialRegex: Regex to determine if the file is a partial.
 *
 * @return {Function}     Handlebars plugin for builder.js
 */

module.exports = function(opts) {
  opts = opts || {};
  var extname = opts.extname || '.hbs';
  var partialRegex = opts.partialRegex || /^_/;

  return function(build, done){
    setImmediate(done);
    var partials = [];

    build.map('templates', function(file, conf){
      var ext = path.extname(file.filename);
      if (extname != ext) return file;

      var absolutepath = conf.path(file.filename);
      var filename = path.basename(absolutepath, extname);

      var src = read(absolutepath, 'utf-8');
      var compiled = Handlebars.precompile(src);
      var output = 'Handlebars.template(' + compiled + ')';

      if (partialRegex.test(filename)) {
        var modulePath = file.filename.replace(filename + extname, '');
        filename = filename.replace(partialRegex, '');
        partials.push('Handlebars.registerPartial("' + conf.name + '/' + modulePath + filename + '", ' + output + ');');
      }

      var script = {};
      script.filename = file.filename.replace(extname, '.js');
      script.contents = 'module.exports = ' + output;
      conf.scripts = conf.scripts || [];
      conf.scripts.push(script);

      return file;
    });

    build.handlebars = runtime(partials);
  }
}

/**
 * Handlebars runtime with partials.
 *
 * @param {String[]} partials
 * @return {String}
 * @api private
 */

function runtime(partials){
  var runtimeFilepath = path.join(__dirname, '../node_modules/handlebars/dist/handlebars.runtime.js');
  if (!exists(runtimeFilepath)) runtimeFilepath = path.join(__dirname, '/handlebars.runtime.js');

  var script = read(runtimeFilepath, 'utf-8');
  script += 'this.Handlebars = window.Handlebars = Handlebars;';

  if (!partials.length) return script;

  script += ';(function(){\n';
  partials.forEach(function(p){
    script += p;
  });
  script += '\n})();'

  return script;
}
