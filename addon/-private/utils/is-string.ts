export default function isString(object: any): object is string {
  return typeof object === 'string';
}
