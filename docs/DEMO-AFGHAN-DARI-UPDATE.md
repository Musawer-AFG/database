# Afghan Dari — frontend demo update

Only the demo frontend has changed. The separate Node.js/PostgreSQL production ZIP was not modified. This update follows the terminology in that project's Afghan Dari localization. Menus, forms, permissions, messages, reports, printed documents and the new Sarraf screens were revised. The terms معاشات و دستمزد, روزنامچه, کهاته and صراف remain. PKR remains quoted per 1000.

Existing user-entered values, stored document contents, accounting account identifiers, and historical date aliases remain compatible; no mass rewrite of local storage is performed. Shared vocabulary is retained.

Validation: 162 passing frontend tests, 1 pre-existing failed test file (documentTemplatesSelected.test.js imports DOCUMENT_DEFAULT_CONTENT, which is absent in this demo baseline). Four additional terminology/navigation checks pass; all 46 source modules parsed successfully. No production build or complete visual review performed.

Use the combined patch inside the existing frontend demo repository; it also contains the previous Sarraf, journal, ledger and currency fixes. No database migrations required.
