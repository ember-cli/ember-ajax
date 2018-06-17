import jQuery from 'jquery';

const ajax =
  typeof FastBoot === 'undefined' ? jQuery.ajax : FastBoot.require('najax');

export default ajax;
