'use strict';

var expect = require('chai').expect;
var setupTest = require('ember-fastboot-addon-tests').setupTest;

var expressApp = require('./helpers/server');
var POSTS = require('./helpers/fixtures').POSTS;

describe('ember-ajax', function() {
  setupTest('fastboot' /*, options */);

  beforeEach(function() {
    this.server = expressApp.listen(3000);
  });

  afterEach(function() {
    this.server.close();
  });

  it('works in a FastBoot environment', function() {
    return this.visit('/').then(function(res) {
      var $ = res.jQuery;
      var response = res.response;

      expect(response.statusCode).to.equal(200);
      expect($('li').length).to.equal(POSTS.length);
    });
  });
});
