import Ember from 'ember';

export default function extendBabelClass(klass) {
  const mixin = Ember.Mixin.create();
  mixin.properties = mixin.properties || {};
  Object.getOwnPropertyNames(klass.prototype).forEach((prop) => {
    if (prop !== 'constructor') {
      mixin.properties[prop] = klass.prototype[prop];
    }
  });
  return mixin;
}
