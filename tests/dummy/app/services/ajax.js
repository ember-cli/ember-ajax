import Ember from 'ember';
import AjaxService from 'ember-ajax/service';

const { computed } = Ember;

export default AjaxService.extend({
  headers: computed('session.authToken', {
    get() {
      const headers = {};
      let token = this.get('session.authToken');
      if (token) {
        headers.token = token;
      }
      return headers;
    }
  })
});
