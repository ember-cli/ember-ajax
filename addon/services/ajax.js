import Ember from 'ember';
import AjaxRequestMixin from '../mixins/ajax-request';

const { Service } = Ember;

export default Service.extend(AjaxRequestMixin);
