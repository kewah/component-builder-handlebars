/*jshint node:true */
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
var path = require('path');
var Handlebars = require('handlebars');

/**
 * Precompile Handlebars templates and partials.
 * @param  {Object} opts  - extname: define the handlebars extension name.
 *                        - partialRegex: Regex to determine if the file is a partial.
 *
 * @return {Function}     Handlebars plugin for builder.js
 */
module.exports = function(opts) {
  opts = opts || {};
  // by default the extension name is .hbs
  var extname = opts.extname || '.hbs';
  // by default the partial file name have to start with _
  var partialRegex = opts.partialRegex || /^_/;

  var removePartialPrefix = function(partial) {
      return partial.replace(partialRegex, '');
    };

  return function(builder) {
    builder.hook('before scripts', function(pkg, complete) {
      var tpl = pkg.conf.templates;

      if (!tpl) {
        return complete();
      }

      // list of partials that we will process after.
      var partials = [];

      // add handlebars runtime script.
      var runtime = fs.readFileSync(__dirname + '/../node_modules/handlebars/dist/handlebars.runtime.js', 'utf8');
      builder.addFile('scripts', 'handlebars.runtime.js', runtime);
      builder.append('require("' + pkg.conf.name + '/handlebars.runtime");');

      // precompile handlebars templates and partials.
      tpl.forEach(function(componentPath) {
        var absolutepath = pkg.path(componentPath);
        var filename = path.basename(absolutepath, extname);

        if (extname !== path.extname(absolutepath)) {
          return;
        }

        // precompile handlebars templates.
        var src = fs.readFileSync(absolutepath, 'utf-8');
        var compiled = Handlebars.precompile(src);
        var output = 'Handlebars.template(' + compiled + ')';

        if (partialRegex.test(filename)) {
          filename = removePartialPrefix(filename);
          partials.push('Handlebars.registerPartial("' + filename + '", ' + output + ');');

          return;
        }

        // add the template as a module.
        componentPath = componentPath.replace(extname, '.js');
        pkg.addFile('scripts', componentPath, 'module.exports = ' + output);
      });

      // add all partials into the same module 'handlebars.partials.js'.
      pkg.addFile('scripts', 'handlebars.partials.js', partials.join('\n'));

      // auto-invoke the module to automatically register partials.
      builder.append('require("' + pkg.conf.name + '/handlebars.partials");');

      complete();
    });
  };
};