import Ember from 'ember';

const { Component, inject } = Ember;

export default Component.extend({
  classNames: 'ajax-get',
  ajax: inject.service(),

  // Error message
  error: null,

  // Data from server
  data: null,

  actions: {
    load() {
      const url = this.get('url');

      return this.get('ajax').request(url)
        .then((data) => {
          this.setProperties({
            data,
            isLoaded: true
          });
        })
        .catch((error) => {
          this.set('error', error.payload);
        });
    }
  }
});
