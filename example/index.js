'use strict';

var domify = require('domify');
var tpl = require('./main.hbs');

document.querySelector('#app').appendChild(
  domify(tpl({
    title: 'Welcome to the example',
    users: [
      'Jody S. White',
      'Mary D. Youmans',
      'Janette C. Bohner'
    ]
  }))
);
