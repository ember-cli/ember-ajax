import Ember from 'ember';

const { Component, inject } = Ember;

export default Component.extend({
  classNames: 'ajax-get',
  ajax: inject.service(),
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
          this.set('errors', error.errors);
        });
    }
  }
});
