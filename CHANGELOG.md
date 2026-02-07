# Changelog

## 2.0.0

### BREAKING CHANGES

- **ESM Only**: Package is now pure ESM, no CommonJS support
  - Requires `"type": "module"` in consuming projects or use `.mjs` extension
  - All imports must use ESM syntax (`import` instead of `require`)
- **Node.js 22+ Required**: Minimum Node.js version is now 22.0.0
  - Uses modern ES2022+ features
  - Native ESM module resolution
- **Updated Dependencies**:
  - farmhash updated from ~2.1.0 to ^3.3.1 (Node.js 22+ support)
  - redblack.js updated from ~0.1.0 to ^1.0.0 (TypeScript/ESM support)

### Added

- **Full TypeScript Support**
  - Complete type definitions for all APIs
  - Generic types for type-safe hash rings (`Ring<T>`)
  - Generic task types for typed queue operations (`Task<T>`)
  - Source code written in TypeScript
- **Named Exports**
  - Added `createRing()` and `createHashQueue()` as direct exports
  - Type exports for `Ring`, `HashQueue`, `Task`, `Queue`, etc.
- **Makefile** for common development tasks (build, test, coverage, release)
- **GitHub Actions CI** replacing Travis CI
  - Node.js 22 and 23 test matrix
  - Automated build and coverage reporting

### Changed

- **Test Framework**: Migrated from Mocha/Chai to Vitest
  - Faster test execution
  - Better ESM support
  - v8 coverage provider
- **Linter**: Replaced semistandard with ESLint 9 + TypeScript ESLint
  - Flat config format
  - TypeScript-aware linting
- **Build Output**: TypeScript compilation to `dist/` directory
  - Declaration files (`.d.ts`) for TypeScript consumers
  - Source maps for debugging
- **Async Patterns**: Queue implementation uses modern async/await
- **Package Structure**: Updated to use `exports` field for conditional exports

### Removed

- CommonJS support (`require()` no longer works)
- Node.js < 22 support
- Development dependencies: mocha, chai, chai-stats, chai-as-promised, nyc, semistandard, when, lodash, pretty-hrtime
- Source files: `src/*.js` replaced with `src/*.ts`

## 1.0.0

 * add hash queue implementation
 * remove when & lodash as install dependencies
 * update farmash dependency (support Node 10)
 * update & simplify build approach
 * include travis & coveralls support
 * README update
 * add Code of Conduct

## 0.2.*

## 0.2.0
 * Changed to farmhash for improved speed
 * Changed all API calls to synchronous
 * General code cleanup

## 0.1.*

## 0.1.1
Bug fix - support non-string keys.
