/* global QUnit */

import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';

QUnit.assert.textContains = function(full, substring, message) {
  const contains = full.indexOf(substring) > -1;
  this.push(contains, full, substring, message);
};

setResolver(resolver);
