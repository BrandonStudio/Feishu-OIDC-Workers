# Feishu / Lark OIDC Adapter on Cloudflare Workers

This project provides an OpenID Connect (OIDC) adapter for Feishu (飞书) and Lark on Cloudflare Workers.
It allows you to integrate Feishu's or Lark's authentication system into your applications easily.

> \[!IMPORTANT]
>
> Currently, only basic identification claims (i.e. `openid email profile`) are supported.
>
> `offline_access` is not supported for now.

## Provider selection (Feishu vs Lark)

Feishu (飞书) and Lark are separate deployments of the same platform:

| Provider | Region        | Authorize host              | API host                | Developer console          |
| -------- | ------------- | --------------------------- | ----------------------- | -------------------------- |
| `feishu` | China         | `accounts.feishu.cn`        | `open.feishu.cn`        | `https://open.feishu.cn/app` |
| `lark`   | International  | `accounts.larksuite.com`    | `open.larksuite.com`    | `https://open.larksuite.com/app` |

The OAuth 2.0 request/response schema is identical between the two — only the host
differs. Select the provider with the `PROVIDER` environment variable (`feishu` or
`lark`). When unset, it defaults to `feishu` for backward compatibility.

> \[!NOTE]
>
> A Feishu tenant and a Lark tenant are completely isolated. An App ID / App Secret
> created in one console is **not** valid in the other, so `PROVIDER` must match the
> console where you registered your application.

## Deployment

To deploy the Feishu OIDC Adapter on Cloudflare Workers, follow these steps:

1.  Fork the Repository.

2.  Create **two** KV Storage instances.
    You can follow the instructions from the [Cloudflare Workers documentation](https://developers.cloudflare.com/kv/get-started/#2-create-a-kv-namespace).

3.  Modify `wrangler.jsonc` to use the KV IDs you just created.
    You can find hint `Change ID here to match your own KV instance.` in the file.

4.  Create a Worker and link to your GitHub repository.

5.  Create an RSA key pair for signing JWTs (The algorithm should be `RS256`).
    You need the following:
    - Private Key (in PEM format)
    - Public Key (in JWK format)
    - Key ID (a unique identifier for the key. It should match the Public Key JWK)

    You may find [this website](https://mkjwk.org/) useful.

6.  Set up the following environment variables in your Cloudflare Worker settings:
    - `PROVIDER`: Optional. `feishu` (default) or `lark`. Selects the upstream identity provider.
    - `ISSUER_BASE_URL`: The base URL where your Worker is deployed (e.g., `https://feishu-oidc.your-domain.workers.dev`).
    - `JWT_PRIVATE_KEY_PEM`: The private key for signing JWTs (in PEM format).
    - `JWT_PUBLIC_KEY_JWK`: The public key for verifying JWTs (in JWK format).
    - `JWT_KEY_ID`: The unique identifier for the key (should match the Public Key JWK).
    - `DOMAIN`: Optional. Default domain for pseudo email generation.

    It may be better to set these variables as **secrets** so that the code updates do not remove these values.
    You can also set these variables (except `JWT_PRIVATE_KEY_PEM`) in your `wrangler.jsonc` file.

## Usage

Assume your domain is `feishu-oidc.your-domain.workers.dev`.

For your Feishu / Lark Application (register it in the console that matches your
`PROVIDER` setting — see [Provider selection](#provider-selection-feishu-vs-lark)):

- **Redirect URI**: `https://feishu-oidc.your-domain.workers.dev/callback/<real-callback-url-encoded>`

  For example, your real callback URL is `https://example.com/auth/callback`, then the Redirect URI should be: `https://feishu-oidc.your-domain.workers.dev/callback/https%3A%2F%2Fexample.com%2Fauth%2Fcallback`

- **Required Scopes** (Perhaps a subset is enough, but I have not tested):
  - `contact:user.base:readonly`
  - `contact:user.id:readonly`
  - `contact:user.employee_id:readonly`
  - `contact:user.email:readonly`
  - `directory:employee.base.email:read`
  - `directory:employee.base.enterprise_email:read`

For Client:
- **Client ID**: The **App ID** of your Feishu application.
- **Client Secret**: The **App Secret** of your Feishu application.
- **Auth URL**: `https://feishu-oidc.your-domain.workers.dev/auth`.
- **Token URL**: `https://feishu-oidc.your-domain.workers.dev/token`.
- **Certs URL**: `https://feishu-oidc.your-domain.workers.dev/jwks`.
