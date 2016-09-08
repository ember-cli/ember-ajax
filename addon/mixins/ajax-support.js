import Ember from 'ember';

const {
  Mixin,
  inject: { service },
  computed: { alias }
} = Ember;

export default Mixin.create({

  /**
   * The AJAX service to send requests through
   *
   * @property {AjaxService} ajaxService
   * @public
   */
  ajaxService: service('ajax'),

  /**
   * @property {string} host
   * @public
   */
  host: alias('ajaxService.host'),

  /**
   * @property {string} namespace
   * @public
   */
  namespace: alias('ajaxService.namespace'),

  /**
   * @property {object} headers
   * @public
   */
  headers: alias('ajaxService.headers'),

  ajax(url, type, options = {}) {
    options.type = type;
    return this.get('ajaxService').request(url, options);
  }
});
