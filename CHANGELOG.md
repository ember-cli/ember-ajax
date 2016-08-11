## 2.5.1

- Revert changing payload info to `meta` property (#142) @alexlafroscia

Sorry about the breaking change!

## 2.5.0

### Addon Changes

- Add whitelist of files to publish (#137) @alexlafroscia
- Refactor request logic to avoid duplicate calls/Refactor tests (#128) @alexlafroscia
- Allow payload response to be a falsey but non-null or undefined value (#126) @SteelBurgher
- Improve error normalization (#118) @alexlafroscia
- Add service property for default contentType (#116) @alexlafroscia
- Add mixin for Ember Data integration (#114) @alexlafroscia
- Add ConflictError class and AbortError handler (#113) @alexlafroscia
- Allow configuring namespace on per-request basis (#112) @alexlafroscia

### Housekeeping

- Document stand-alone usage (#135) @knownasilya
- Move to tests to Mocha (#121) @alexlafroscia
- Improve JSDoc documentation (#117) @alexlafroscia
- Switch to ESLint (#78) @alexlafroscia
- Remove reference to Ember Data (#115) @alexlafroscia

Plus a bunch of dependency updates

## 2.4.1

- Prevent removing trailing slash in request URL (#96) @alexlafroscia

## 2.4.0

- Move implementation to a Mixin (#107) @alexlafroscia

## 2.3.2

- Fix memory leak in tests (#105) @alexlafroscia

## 2.3.1

- ignores query param serialization on when content is jsonapi (fixes #99) @jamesdixon

## 2.1.0

- Upgrade to Ember CLI v2.5.0 (#95) @alexlafroscia
- Basic fastboot support using najax (#75) @topaxi
- isAjaxError helper (#92) @jaswilli
- Add a delete alias (#84) @sandstrom
- Document error matching helper methods (#65) @jaswilli

## 0.7.0

- Add HTTP-verb methods on ajax service - PR #16

## 0.6.4

- Added ability to specify host for relative urls - PR #15
