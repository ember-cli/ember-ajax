import Ember from 'ember';
import AjaxRequestMixin from 'ember-ajax/mixins/ajax-request';
import { module, test } from 'qunit';

const { Object: EmberObject } = Ember;

module('Unit | Mixin | ajax request');

// Replace this with your real tests.
test('it works', function(assert) {
  let AjaxRequestObject = EmberObject.extend(AjaxRequestMixin);
  let subject = AjaxRequestObject.create();
  assert.ok(subject);
});
