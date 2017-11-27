/* global najax */
import $ from 'jquery';

import isFastBoot from 'ember-ajax/-private/utils/is-fastboot';

export default isFastBoot ? najax : $.ajax;
