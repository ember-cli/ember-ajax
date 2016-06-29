import Ember from 'ember';
import AjaxRequestMixin from './mixins/ajax-request';

const { Object: EmberObject } = Ember;

export default EmberObject.extend(AjaxRequestMixin);
