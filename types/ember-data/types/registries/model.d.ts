// see https://github.com/typed-ember/ember-cli-typescript#fixing-the-ember-data-error-ts2344-problem
export default interface ModelRegistry {
  [key: string]: any;
}
