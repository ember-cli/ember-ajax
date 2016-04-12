/* global najax */
import Ember from 'ember';
import isFastBoot from './is-fastboot';

const {
  $
} = Ember;

export default isFastBoot ? najax : $.ajax;
