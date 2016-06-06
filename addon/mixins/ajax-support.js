import Ember from 'ember';

const {
  Mixin,
  inject: { service },
  computed: { alias }
} = Ember;

export default Mixin.create({

  ajaxService: service('ajax'),

  host: alias('ajaxService.host'),

  namespace: alias('ajaxService.namespace'),

  headers: alias('ajaxService.headers'),

  ajax(url, type, options) {
    options = this.ajaxOptions(...arguments);
    return this.get('ajaxService').request(url, options);
  },

  ajaxOptions(url, type, options = {}) {
    options.type = type;
    return this.get('ajaxService').options(url, options);
  }
});
