import $ from 'jquery';
import isFastBoot from 'ember-ajax/-private/utils/is-fastboot';

const ajax = isFastBoot ? FastBoot.require('najax') : $.ajax;

export default ajax;
