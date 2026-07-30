// @ts-ignore
import {
  FeishuAuthRequestParams,
  FeishuAccessTokenRequest,
  FeishuAccessTokenResponse,
  FeishuUserInfoResponse,
} from './types/feishu';

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

export const FeishuEndpoints = {
  /** GET {@link FeishuAuthRequestParams} */
  OAuth2Auth: 'https://accounts.feishu.cn/open-apis/authen/v1/authorize' as const,
  /** POST {@link FeishuAccessTokenRequest}: {@link FeishuAccessTokenResponse} */
  OAuth2Token: 'https://open.feishu.cn/open-apis/authen/v2/oauth/token' as const,
  /** GET: {@link FeishuUserInfoResponse} */
  UserInfo: 'https://open.feishu.cn/open-apis/authen/v1/user_info' as const,
};

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

type AltProvider = Exclude<Provider, typeof DEFAULT_PROVIDER>;

export function resolveProvider<P extends AltProvider>(value: P): AltProvider;
export function resolveProvider<P extends typeof DEFAULT_PROVIDER>(value: P): typeof DEFAULT_PROVIDER;
export function resolveProvider(value: undefined | null): typeof DEFAULT_PROVIDER;
export function resolveProvider(value: string | undefined | null): Provider;

/**
 * Normalize the raw `PROVIDER` environment value into a known {@link Provider}.
 *
 * When `PROVIDER` is unknown or unset (undefined/null/empty) it falls back to
 * {@link DEFAULT_PROVIDER} for backward compatibility with a warning message.
 */
export function resolveProvider<P extends Provider>(value: P | string | undefined | null): Provider {
  const normalized = value?.trim()?.toLowerCase();

  switch (normalized) {
    case 'lark':
      return 'lark';
    case 'feishu':
      return 'feishu';
    default:
      console.warn(
        `PROVIDER value unset or unknown: ${JSON.stringify(value)}. ` +
        `Falling back to default provider "${DEFAULT_PROVIDER}".`,
      );
      return DEFAULT_PROVIDER;
  }
}

type DefaultEndpoints = typeof ProviderEndpoints[typeof DEFAULT_PROVIDER];
type AltEndpoints = Exclude<typeof ProviderEndpoints[keyof typeof ProviderEndpoints], DefaultEndpoints>;

export function getEndpoints<P extends AltProvider>(value: P): AltEndpoints;
export function getEndpoints<P extends typeof DEFAULT_PROVIDER>(value: P): DefaultEndpoints;
export function getEndpoints(value: undefined | null): DefaultEndpoints;
export function getEndpoints(value: string | undefined | null): typeof FeishuEndpoints | typeof LarkEndpoints;

/**
 * Resolve the upstream endpoint set for the configured provider.
 */
export function getEndpoints<P extends Provider>(value: P | string | undefined | null) {
  return ProviderEndpoints[resolveProvider(value)];
}
