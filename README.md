# next-ssg-env-test

Minimal Next.js static-site-generation app that reads environment variables at **build time** and renders them into the HTML output. Use it to verify that a remote build system correctly injects env vars.

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BUILD_ENV` | e.g. `production`, `staging` |
| `NEXT_PUBLIC_API_URL` | An API endpoint URL |
| `NEXT_PUBLIC_FEATURE_FLAG` | A feature toggle (`true`/`false`) |
| `MY_SECRET_VAR` | A non-public var (proves `getStaticProps` can read any env var) |

## Usage

```bash
npm install
npm run build   # generates static HTML in out/
npm run start   # serves the out/ directory locally
```

## Verifying the Build

After the remote build completes, inspect `out/index.html`. The env var values should be embedded in the HTML. You can also `grep` for them:

```bash
grep "NEXT_PUBLIC_BUILD_ENV" out/index.html
```

If the values are `null` or missing, the build system did not inject the env vars correctly.
# NEXT-SSG-TEST-0428
