import Ember from 'ember';
import extendBabelClass from 'ember-ajax/utils/extend-babel-class';
import { module, test } from 'qunit';

module('Unit | Utility | extend babel class');

test('it adds the properties of a Babel class to an Ember one', function(assert) {
  class MyBabelClass {
    get someProperty() {
      return 'a';
    }
    someFunction() {
      return 'b';
    }
  }
  const EmberClass = Ember.Object.extend(extendBabelClass(MyBabelClass));
  const obj = EmberClass.create();
  assert.equal('a', obj.get('someProperty'));
  assert.equal('b', obj.someFunction());
});
