/* global najax */
import Ember from 'ember';
import isFastBoot from 'ember-ajax/-private/utils/is-fastboot';

const {
  $
} = Ember;

export default isFastBoot ? najax : $.ajax;
