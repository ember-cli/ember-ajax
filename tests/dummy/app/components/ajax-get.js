import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  classNames: 'ajax-get',
  ajax: service(),

  // Error message
  error: null,

  // Data from server
  data: null,

  actions: {
    load() {
      const url = this.get('url');

      return this.get('ajax')
        .request(url)
        .then(data => {
          this.setProperties({
            data,
            isLoaded: true
          });
        })
        .catch(error => {
          this.set('error', error.payload);
        });
    }
  }
});
