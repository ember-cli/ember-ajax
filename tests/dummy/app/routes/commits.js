import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  ajax: service(),

  model() {
    return get(this, 'ajax').request(
      'https://api.github.com/repos/ember-cli/ember-ajax/commits',
      {
        headers: {
          'User-Agent': 'Ember AJAX Testing'
        }
      }
    );
  }
});
