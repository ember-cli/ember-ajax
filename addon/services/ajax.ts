import Service from '@ember/service';
import AjaxRequestMixin from '../mixins/ajax-request';

const AjaxService = Service.extend(AjaxRequestMixin);

export default AjaxService;

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
export class AjaxServiceClass extends AjaxService {}

declare module '@ember/service' {
  interface Registry {
    ajax: AjaxServiceClass;
  }
}
