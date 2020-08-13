## TODO - Preaction CMS v3 Beta

Each of these goals must be met before releasing Preaction CMS v3 Beta:

[x] Remove all user capabilities to change CSS and add JS components.

> There is no acceptibly secure way to let users upload CSS and JavaScript. This should be an administrative task, alongside server-side extension deployment.
>
> This means that client-side CMS components will need to be built as ES modules.
>
> Additionally, all CSS-related values should be sanitized, and element class names should not be open-ended.

[ ] Document code with JSDoc.

> ...including the Preaction library dependencies.

[ ] Include administrative security features to lock any part of the CMS from user customization.

[ ] Support for PostgreSQL, MySQL, and more.

> "more" TBD.

[ ] Fully tested with unit, integration, and E2E tests.

> target metrics TBD

[ ] Support for continuous integration.

> specifics TBD
