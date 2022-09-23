# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v5.0.0-alpha.14

### Changed
- ⬆️ dependency upgrades,  including but not limited to:
  * `bootstrap v5.2.1`
  * `react v18.2.0`
  * `node-sqlite3 v5.1.1`
    + there is a known issue with the prebuilt binaries from this package not working on
      CentOS 7 machines. This can be fixed by building from source with the following
      command:
      ```
      npm_config_build_from_source=true yarn add sqlite3@5.1.1
      ```
- ➖ remove dependency on `@loadable/component` in favor of `React.lazy` code splitting
  available in React v18+
  * 💥 this may be a breaking change if client-side extensions are loaded using
    `@loadable/components`. See the documentation for updated examples.
