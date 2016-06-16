import Ember from 'ember';
import config from './config/environment';

const { Router: EmberRouter } = Ember;

const Router = EmberRouter.extend({
  location: config.locationType
});

Router.map(function() {
});

export default Router;
