import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';

import AjaxRequest from 'ember-ajax/ajax-request';
import Service, { inject as service } from '@ember/service';

// @ts-ignore
import Pretender from 'pretender';
import { jsonResponse } from 'dummy/tests/helpers/json';

interface User {
  name: string;
}

describe('TypeScript Usage', function() {
  beforeEach(function() {
    this.server = new Pretender();
  });

  afterEach(function() {
    this.server.shutdown();
  });

  describe('generics in HTTP methods', function() {
    describe('request', function() {
      beforeEach(function() {
        this.server.get('/users/1', () => jsonResponse(200, { name: 'Alex' }));
      });

      it('works without the generic defined', async function() {
        const ajax = AjaxRequest.create();
        const response = await ajax.request('/users/1');

        expect(response).to.deep.equal({ name: 'Alex' });
      });

      it('can provide a generic type to resolve to', async function() {
        const ajax = AjaxRequest.create();
        const response = await ajax.request<User>('/users/1');

        expect(response).to.deep.equal({ name: 'Alex' });
      });
    });
  });

  it('types the injected service', function() {
    Service.extend({
      ajax: service('ajax'),

      makeRequest<T>(url: string) {
        return this.get('ajax').request<T>(url);
      }
    });
  });
});
