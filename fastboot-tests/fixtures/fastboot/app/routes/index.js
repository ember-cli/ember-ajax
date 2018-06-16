import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  ajax: service(),

  model() {
    return get(this, 'ajax').request('http://localhost:3000/posts', {
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
