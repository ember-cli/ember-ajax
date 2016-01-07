import Ember from 'ember';
import AjaxRequest from '../ajax-request';
import mixinify from 'ember-mixinify-class';

const { Service } = Ember;

/**
  ### Headers customization

  Some APIs require HTTP headers, e.g. to provide an API key. Arbitrary
  headers can be set as key/value pairs on the `RESTAdapter`'s `headers`
  object and Ember Data will send them along with each ajax request.

  ```app/services/ajax
  import AjaxService from 'ember-ajax/services/ajax';

  export default AjaxService.extend({
    headers: {
      "API_KEY": "secret key",
      "ANOTHER_HEADER": "Some header value"
    }
  });
  ```

  `headers` can also be used as a computed property to support dynamic
  headers.

  ```app/services/ajax.js
  import Ember from 'ember';
  import AjaxService from 'ember-ajax/services/ajax';

  export default AjaxService.extend({
    session: Ember.inject.service(),
    headers: Ember.computed("session.authToken", function() {
      return {
        "API_KEY": this.get("session.authToken"),
        "ANOTHER_HEADER": "Some header value"
      };
    })
  });
  ```

  In some cases, your dynamic headers may require data from some
  object outside of Ember's observer system (for example
  `document.cookie`). You can use the
  [volatile](/api/classes/Ember.ComputedProperty.html#method_volatile)
  function to set the property into a non-cached mode causing the headers to
  be recomputed with every request.

  ```app/services/ajax.js
  import Ember from 'ember';
  import AjaxService from 'ember-ajax/services/ajax';

  export default AjaxService.extend({
    session: Ember.inject.service(),
    headers: Ember.computed("session.authToken", function() {
      return {
        "API_KEY": Ember.get(document.cookie.match(/apiKey\=([^;]*)/), "1"),
        "ANOTHER_HEADER": "Some header value"
      };
    }).volatile()
  });
  ```
 @public
**/
export default Service.extend(mixinify(AjaxRequest));
