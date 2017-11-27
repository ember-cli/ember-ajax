import jq from 'jquery';
import resolver from './helpers/resolver';
import { setResolver } from 'ember-mocha';

setResolver(resolver);

if (window.location.search.indexOf('nocontainer') > -1) {
  jq('#ember-testing-container').css({ visibility: 'hidden' });
}
