import jQuery from 'jquery';

const ajax: (
  url: string,
  settings?: JQueryAjaxSettings | undefined
) => JQueryXHR =
  typeof FastBoot === 'undefined' ? jQuery.ajax : FastBoot.require('najax');

export default ajax;
