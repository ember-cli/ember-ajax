import url from 'url';

interface ModuleRegistry {
  najax(url: string, settings?: JQueryAjaxSettings): JQueryXHR;
  url: typeof url;
}

declare global {
  namespace FastBoot {
    function require<K extends keyof ModuleRegistry>(module: K): ModuleRegistry[K];
  }
}
