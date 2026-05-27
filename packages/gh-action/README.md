# NovaBash GitHub Action

Pull the `.env` for a NovaBash workspace into a GitHub Actions runner. One
required input, one network call, one file written.

## Usage

```yaml
- uses: novabash/pull-env@v1
  with:
    workspace-key: ${{ secrets.NB_WORKSPACE_KEY }}
    env: production
    output: .env
```

## Inputs

| name           | required | default                       | notes                                                |
| -------------- | -------- | ----------------------------- | ---------------------------------------------------- |
| `workspace-key`| yes      | -                             | `nbk_...` token. Store as `secrets.NB_WORKSPACE_KEY` |
| `env`          | no       | `production`                  | `development`, `staging`, or `production`            |
| `output`       | no       | `.env`                        | Path relative to `GITHUB_WORKSPACE`                  |
| `api-url`      | no       | `https://api.novabash.dev`    | Override only for self-hosted instances              |

## Outputs

- `bytes-written`: number of bytes written to the output file.
- `variant`: the environment variant pulled.

## Security

- The workspace key is masked in the action log via `core.setSecret`.
- The env body is not logged.
- The token is the same `nbk_...` you would use locally with `novabash login --token`.

## License

MIT.
