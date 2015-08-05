# ember-ajax

Ember-friendly jQuery.ajax wrapper.

* returns RSVP promises
* makes apps more testable (resolves promises with Ember.run)
* makes testing ajax simpler with fixture support

## Installation

### As an addon

* `ember install ember-ajax`

### For development

* `git clone` this repository
* `npm install`
* `bower install`

## Upgrade from `ic-ajax`

1. `npm uninstall --save-dev ember-cli-ic-ajax`
2. `ember install ember-ajax`
3. Search and replace `ic-ajax` with `ember-ajax`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

## Special Thanks

Fork of [instructure/ic-ajax](https://github.com/instructure/ic-ajax). Inspired by [discourse ajax](https://github.com/discourse/discourse/blob/master/app/assets/javascripts/discourse/mixins/ajax.js#L19).
