require('dotenv-expand')(require('dotenv').config({silent: true}));
require('babel-polyfill');
require('babel-register');
require('./server.js');