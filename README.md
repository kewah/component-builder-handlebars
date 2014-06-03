# component-builder-handlebars [![Build Status](https://travis-ci.org/kewah/component-builder-handlebars.svg?branch=master)](https://travis-ci.org/kewah/component-builder-handlebars)

> [Builder2.js](https://github.com/component/builder2.js) plugin to precompile Handlebars templates to [Component.js](https://github.com/component/component) modules.

## Install

With [npm](http://npmjs.org) do:

```bash
$ npm install component-builder-handlebars --save-dev
```

## Usage

### Build

```js
var builder = require('component-builder');
var hbs = require('component-builder-handlebars');

var options = {
  extname: 'hbs',
  partialRegex: /^_/
};

builder.scripts(tree)
  .use('scripts', Builder.plugins.js())
  .use('templates', hbs(options))
  .end(function(err, string) {
    fs.writeFileSync(dest, string);
  });
```

### Partials

To include a partial inside a template:

```html
{{> componentName/path/to/_partial }}
```

For [instance](test/fixture/with-partials/_nav.hbs).

## Options

### extname  
Type: `String`  
Default value: `.hbs`  
Define the Handlebars extension name. 

### partialRegex
_Inspired from [grunt-contrib-handlebars](https://github.com/gruntjs/grunt-contrib-handlebars#partialregex)_   
Type: `RegExp`  
Default value: `/^_/`  
Define the prefix to identify Handlebars partials.

## Example

See [example](example) folder.

To build it:

```bash
$ npm run example
```

## License

Licensed under the MIT license.
