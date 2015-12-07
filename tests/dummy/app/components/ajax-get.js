import Ember from 'ember';

export default Ember.Component.extend({
  classNames: 'ajax-get',
  ajax: Ember.inject.service(),
  actions: {
    load() {
      let url = this.get('url');
      return this.get('ajax').request(url)
        .then(data => {
          this.setProperties({
            data,
            isLoaded: true
          });
        })
        .catch( error => this.set('errors', error.errors ));
    }
  }
});
