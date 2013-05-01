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

  var isHandlebarsTemplate = function(file) {
    return extname === path.extname(file);
  };

  var removePartialPrefix = function(partial) {
    return partial.replace(partialRegex, '');
  };

  return function(builder) {
    builder.hook('before scripts', function(pkg, complete) {
      var tpl = pkg.config.templates;
      var componentName = pkg.config.name;
      var runtimeFilepath, runtime;

      // we include the runtime only for the root.
      if (pkg.root) {
        // add handlebars runtime script.
        // If the file, in the Handlebars module, does not exists
        // we use the runtime file from /lib.
        runtimeFilepath = path.join(__dirname, '../node_modules/handlebars/dist/handlebars.runtime.js');
        if (!fs.existsSync(runtimeFilepath)) {
          runtimeFilepath = path.join(__dirname, '/handlebars.runtime.js');
        }

        runtime = fs.readFileSync(runtimeFilepath);
        builder.addFile('scripts', 'handlebars.runtime.js', runtime + 'window.Handlebars = Handlebars;');

        // auto-invoke the module
        builder.append('require("' + componentName + '/handlebars.runtime");');
      }

      if (!tpl) {
        return complete();
      }

      tpl = tpl.filter(isHandlebarsTemplate);

      // list of partials that we will process after.
      var partials = [];

      // precompile handlebars templates and partials.
      tpl.forEach(function(modulePath) {
        var absolutepath = pkg.path(modulePath);
        var filename = path.basename(absolutepath, extname);

        // precompile handlebars templates.
        var src = fs.readFileSync(absolutepath, 'utf-8');
        var compiled = Handlebars.precompile(src);
        var output = 'Handlebars.template(' + compiled + ')';

        if (partialRegex.test(filename)) {
          // add namespace to the partial.
          modulePath = modulePath.replace(filename + extname, '');
          filename = removePartialPrefix(filename);
          partials.push('Handlebars.registerPartial("' + componentName + '/' + modulePath + filename + '", ' + output + ');');

          return;
        }

        // add the template as a module.
        modulePath = modulePath.replace(extname, '.js');
        pkg.addFile('scripts', modulePath, 'module.exports = ' + output);
      });

      if (partials.length === 0) {
        return complete();
      }

      // add all partials into the same module 'handlebars.partials.js'.
      pkg.addFile('scripts', 'handlebars.partials.js', partials.join('\n'));

      // auto-invoke the module to automatically register partials.
      builder.append('require("' + componentName + '/handlebars.partials");');

      return complete();
    });
  };
};