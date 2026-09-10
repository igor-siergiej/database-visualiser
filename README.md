# Database Visualiser

A browser teaching tool for SQL beginners. Paste `CREATE TABLE` DDL (or upload a
`.sql` file) and it parses the statements, builds a model of the schema, and
draws the tables as a horizontal tree so the foreign-key structure is visible at
a glance. It also flags common structural mistakes and highlights syntax errors.

Built in 2023 to make "why is my schema shaped like this?" a picture instead of a
paragraph.

## Live demo

Not currently deployed — it is a static bundle, so `npm start` (below) runs the
whole thing locally.

## Screens

DDL in, tree out:

![DDL input and parsed tables](https://github.com/igor-siergiej/database-visualiser/assets/79415930/2b0e626d-8a7a-4a5a-994b-f9f4a1d6ad1e)

Tables laid out as a horizontal tree, foreign keys drawn as connectors:

![Horizontal tree layout](https://github.com/igor-siergiej/database-visualiser/assets/79415930/8851ef25-3491-4937-8d61-2cbc476b5456)

![Tree with multiple related tables](https://github.com/igor-siergiej/database-visualiser/assets/79415930/414d3798-5bad-4d83-92af-dd5a3a06384b)

Structural hints (missing primary key, no foreign key, multiple roots):

![Structural problem hints](https://github.com/igor-siergiej/database-visualiser/assets/79415930/2e39412c-7609-48e3-9107-5be3db456f75)

Syntax errors are reported and highlighted in place:

![Syntax error highlighting](https://github.com/igor-siergiej/database-visualiser/assets/79415930/8389e36f-5298-480a-9d7f-9395376dc87e)

## Stack

Vanilla JavaScript (no framework) · Bootstrap 5 UI · [`js-tokens`](https://github.com/lydell/js-tokens)
for tokenising · [`leader-line-new`](https://github.com/anseki/leader-line) for
the connector arrows · Parcel bundler · Mocha for the parser tests.

## How it works

- **Tokenise → model.** The DDL is tokenised with `js-tokens` and the tokens are
  walked to build a domain model: `Database` → `Schema` → `Table` → `Column`,
  with `ForeignKey` and `ColumnType` attached. Each class enforces its own rules
  in its constructor (valid name, no duplicates, known type) and throws a
  `SyntaxError` carrying the offending text.
- **Validate.** `Validator` checks the built model and raises `Problem` objects —
  `MissingPrimaryKeyProblem`, `NoForeignKeyProblem`, `MultipleRootsProblem` —
  each with a human-readable fix hint.
- **Lay out.** Foreign keys define parent/child links between tables. The app
  finds the root table(s) (any table nothing points to), walks the relationships
  recursively to assign each table a depth, and splits into separate trees when
  there is more than one root.
- **Draw.** Table cards are rendered as Bootstrap markup positioned left-to-right
  by depth; `leader-line-new` draws the foreign-key connectors between them and
  redraws on drag/scroll.
- **Report.** Two output panels: the visual tree, and a list of problems and
  syntax errors. Syntax errors also highlight the source span in the textarea.

## Run it

```bash
npm install
npm start      # parcel serve on http://localhost:1234
```

```bash
npm test       # mocha — parser and model unit tests
npm run build  # static bundle into build/
```

Requires Node 18+.

## Decisions

- **No framework.** The point of the project was to understand DOM rendering,
  bundling, and parsing directly, so the UI is hand-written against the DOM API.
- **Hand-written token walk, not a parser generator.** A small purpose-built
  walker over `js-tokens` output was enough for the DDL subset and kept the
  parsing logic readable as a learning exercise.
- **Domain classes mirror SQL concepts.** `Schema`/`Table`/`Column`/`ForeignKey`
  validate in their constructors, so an invalid schema simply cannot be
  constructed and the error messages fall out naturally.
- **`leader-line` for connectors** instead of a full graph/diagram library —
  tables are plain draggable HTML, only the arrows between them need SVG.

## Licence

AGPL-3.0-or-later. See [LICENSE](LICENSE).
