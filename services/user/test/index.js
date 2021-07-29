/* eslint-disable import/no-extraneous-dependencies */
const test = require('ava');
const debug = require('debug');

exports.test = test;
exports.debug = debug('gql:service:user');
