import { FeishuEndpoints } from '@/types/feishu';

/**
 * Supported upstream identity providers.
 *
 * Feishu (飞书) is the China-mainland deployment and uses the `feishu.cn`
 * domains, while Lark is the international deployment and uses the
 * `larksuite.com` domains. The OAuth 2.0 request/response schema is identical
 * between the two; only the host differs, so a single adapter can serve either
 * one depending on which tenant the application is registered in.
 *
 * Note: a Feishu tenant and a Lark tenant are completely isolated. An App ID /
 * App Secret created in one console is not valid in the other, so the provider
 * must match the console where the application was registered.
 */
export type Provider = 'feishu' | 'lark';

/**
 * Lark (international) OAuth 2.0 endpoints.
 *
 * @see https://open.larksuite.com/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/login-overview
 */
export const LarkEndpoints = {
  /** GET authorization endpoint. */
  OAuth2Auth: 'https://accounts.larksuite.com/open-apis/authen/v1/authorize' as const,
  /** POST token endpoint. */
  OAuth2Token: 'https://open.larksuite.com/open-apis/authen/v2/oauth/token' as const,
  /** GET user info endpoint. */
  UserInfo: 'https://open.larksuite.com/open-apis/authen/v1/user_info' as const,
};

export const ProviderEndpoints = {
  feishu: FeishuEndpoints,
  lark: LarkEndpoints,
} as const;

/** Provider used when `PROVIDER` is unset, keeping backward compatibility. */
export const DEFAULT_PROVIDER: Provider = 'feishu';

/**
 * Normalize the raw `PROVIDER` environment value into a known {@link Provider}.
 * Falls back to {@link DEFAULT_PROVIDER} for unset or unrecognized values.
 */
export function resolveProvider(value: string | undefined | null): Provider {
  switch ((value ?? '').trim().toLowerCase()) {
    case 'lark':
      return 'lark';
    case 'feishu':
      return 'feishu';
    default:
      return DEFAULT_PROVIDER;
  }
}

/**
 * Resolve the upstream endpoint set for the configured provider.
 */
export function getEndpoints(value: string | undefined | null) {
  return ProviderEndpoints[resolveProvider(value)];
}
