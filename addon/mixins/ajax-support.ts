import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { alias } from '@ember/object/computed';

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

  ajax(url: string, _method: string, _options: object) {
    // @ts-ignore
    const augmentedOptions: object = this.ajaxOptions(...arguments);

    return get(this, 'ajaxService').request(url, augmentedOptions);
  }
});
