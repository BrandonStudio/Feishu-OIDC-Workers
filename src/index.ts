import * as jose from 'jose';
import {
  FeiShuEndpoints,
} from '@/types/feishu';

import type {
  FeiShuAuthRequestParams,
  FeiShuAccessTokenRequest,
  FeiShuAccessTokenResponse,
  FeiShuUserInfo,
  FeiShuUserInfoResponse,
  FeiShuAccessTokenErrorResponse,
  FeiShuAuthResponse,
} from '@/types/feishu';
import type {
  OpenIDAuthErrorResponse,
  OpenIDAuthRequestParams,
  OpenIDProviderMetadata,
  OpenIDStandardClaims,
  OpenIDSuccessTokenResponse,
  OpenIDToken,
  OpenIDUserInfoSuccessResponse,
} from '@/types/oidc';
import type {
  OAuth2AccessTokenErrorResponse,
  OAuth2AccessTokenRequest,
  OAuth2AccessTokenRequestWithAuth,
} from './types/oauth2';

const STATE_PREFIX = '638DG14L72WO-';

// JWT生成和验证函数
async function generateIdToken(userInfo: FeiShuUserInfo, clientId: string, nonce: string | null | undefined, env: Env) {
  const now = Math.floor(Date.now() / 1000);

  const payload: OpenIDToken = {
    // OIDC必需声明
    iss: env.ISSUER_BASE_URL,
    sub: userInfo.open_id,
    aud: clientId,
    exp: now + 3600,  // 1小时后过期
    iat: now,
    ...(nonce && { nonce }),

    // 标准声明
    name: userInfo.name,
    email: transformEmail(userInfo, env),
    picture: userInfo.avatar_url,
  };

  // 使用env中的私钥签名JWT
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid: env.JWT_KEY_ID })
    .sign(await jose.importPKCS8(env.JWT_PRIVATE_KEY_X509, 'RS256'));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // OpenID Connect必需的配置端点
    if (url.pathname === '/.well-known/openid-configuration') {
      return new Response(JSON.stringify({
        issuer: env.ISSUER_BASE_URL,
        authorization_endpoint: `${env.ISSUER_BASE_URL}/auth`,
        token_endpoint: `${env.ISSUER_BASE_URL}/token`,
        userinfo_endpoint: `${env.ISSUER_BASE_URL}/userinfo`,
        jwks_uri: `${env.ISSUER_BASE_URL}/jwks`,
        response_types_supported: [ 'code', 'id_token', 'id_token token' ],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        scopes_supported: ['openid', 'profile', 'email'],
      } satisfies OpenIDProviderMetadata), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // JWKS端点 - 提供用于验证JWT签名的公钥
    if (url.pathname === '/jwks') {
      return new Response(JSON.stringify({
        keys: [JSON.parse(env.JWT_PUBLIC_KEY_JWK)],
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // auth端点：重定向到飞书登录
    if (url.pathname === '/auth') {
      const inputParams = url.searchParams as {
        get<TKey extends keyof OpenIDAuthRequestParams>(key: TKey): OpenIDAuthRequestParams[TKey];
      };

      const nonce = inputParams.get('nonce');
      const state = inputParams.get('state') || (env.STATE_PREFIX || STATE_PREFIX) + crypto.randomUUID();
      const client_id = inputParams.get('client_id');
      if (nonce) {
        await env.StateNonceKV.put(truncateState(state), nonce, {
          expirationTtl: 900, // 15 minutes. In case the user takes long time on authentication page.
        });
      }

      const redirectUrl = new URL(`${env.ISSUER_BASE_URL}/callback/${encodeURIComponent(inputParams.get('redirect_uri')!)}`);

      const inputScope = inputParams.get('scope');
      const scope = transformOpenIDScope(inputScope);
      const searchParams = new URLSearchParams({
        scope,
        client_id,
        redirect_uri: redirectUrl.toString(),
        ...(state && { state }),
        // redirect_uri: inputParams.get('redirect_uri'),
      } satisfies FeiShuAuthRequestParams)

      const feishuAuthUrl = new URL(FeiShuEndpoints.OAuth2Auth);
      feishuAuthUrl.search = '?' + searchParams.toString();
      return Response.redirect(feishuAuthUrl.toString());
    }

    // callback端点：接收飞书的code并转发给客户端
    if (url.pathname.startsWith('/callback/')) {
      const searchParams = url.searchParams as {
        get<TKey extends keyof FeiShuAuthResponse>(key: TKey): FeiShuAuthResponse[TKey];
      };
      const code = searchParams.get('code');
      const state = searchParams.get('state')!;

      // const redirectUrlEncoded = url.searchParams.get((env.URI_PARAM_PREFIX || URI_PARAM_PREFIX) + 'original-uri')!
      const redirectUrlEncoded = url.pathname.substring('/callback/'.length);
      const redirectUrl = new URL(decodeURIComponent(redirectUrlEncoded));

      const nonce = await env.StateNonceKV.get(truncateState(state));
      // if (!nonce) {
      //   const searchParams = new URLSearchParams({
      //     error: 'invalid_request',
      //     error_description: 'Nonce missing',
      //     state,
      //   } satisfies OpenIDAuthErrorResponse);
      //   redirectUrl.search = '?' + searchParams.toString();
      //   return Response.redirect(redirectUrl.toString());
      // }

      if (nonce) {
        await env.StateNonceKV.delete(truncateState(state)); // TODO: Do we need deletion?
        await env.CodeNonceKV.put(truncateCode(code), nonce, {
          expirationTtl: 300, // 5 minutes
        });
      }

      redirectUrl.searchParams.set('code', code);
      if (!state.startsWith(env.STATE_PREFIX || STATE_PREFIX)) {
        redirectUrl.searchParams.set('state', state);
      }

      return Response.redirect(redirectUrl.toString());
    }

    // token端点
    // 用飞书的code换取token，并生成OIDC所需的token
    if (url.pathname === '/token' && request.method === 'POST') {
      const formData = await request.formData() as {
        get<TKey extends keyof OAuth2AccessTokenRequest>(key: TKey): OAuth2AccessTokenRequest[TKey];
        get<TKey extends keyof OAuth2AccessTokenRequestWithAuth>(key: TKey): OAuth2AccessTokenRequestWithAuth[TKey];
        has(key: keyof OAuth2AccessTokenRequestWithAuth): boolean;
        has(key: string): false;
      };
      let clientId: string | undefined = undefined;
      let clientSecret: string | undefined = undefined;
      if (request.headers.get('Authorization')) {
        const authHeader = request.headers.get('Authorization')!;
        const [scheme, token] = authHeader.split(' ');
        if (scheme === 'Basic') {
          const decoded = atob(token);
          [clientId, clientSecret] = decoded.split(':');
        }
      }
      if (formData.has('client_id')) {
        clientId = formData.get('client_id');
      }
      if (formData.has('client_secret')) {
        clientSecret = formData.get('client_secret');
      }
      if (!clientId || !clientSecret) {
        return new Response('Missing client authentication', { status: 401 });
      }

      const code = formData.get('code');  // 这是从客户端收到的飞书code
      // const nonce = formData.get('nonce') as string | null | undefined; // 这个地方不对

      const redirectUrl = new URL(`${env.ISSUER_BASE_URL}/callback/${encodeURIComponent(formData.get('redirect_uri')!)}`);

      const feiShuTokenResponse = await fetch(FeiShuEndpoints.OAuth2Token, {
        method: 'POST',
        headers: { "Content-Type": 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: encodeURIComponent(redirectUrl.toString()), // It's somehow strange here to encode it one more time.
        } satisfies FeiShuAccessTokenRequest)
      });

      const feiShuTokenData = await feiShuTokenResponse.json() as FeiShuAccessTokenResponse;
      if (feiShuTokenData.code !== 0) {
        console.warn('Failed to obtain access token from FeiShu: ', feiShuTokenData);
        return new Response(JSON.stringify({
          error: 'invalid_request',
          error_description: (feiShuTokenData as FeiShuAccessTokenErrorResponse).error_description,
        } satisfies OAuth2AccessTokenErrorResponse), {
          status: feiShuTokenResponse.status,
        });
      }

      const {
        access_token,
        expires_in,
        refresh_token,
        refresh_token_expires_in,
        scope,
      } = feiShuTokenData as Extract<FeiShuAccessTokenResponse, { code: 0, refresh_token: string }>;
      // Assume refresh_token exists here, though it may not.
      // This is safe because no member of refresh_token will be called.

      // 3. 用access_token获取用户信息
      const userInfoResponse = await fetch(FeiShuEndpoints.UserInfo, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      const userInfo = await userInfoResponse.json() as FeiShuUserInfoResponse;

      const nonce = await env.CodeNonceKV.get(truncateCode(code));

      // 4. 生成OIDC的响应
      return new Response(JSON.stringify({
        access_token: access_token,        // 使用飞书的access_token
        token_type: 'Bearer',
        refresh_token,
        id_token: await generateIdToken(   // 我们生成的JWT格式的id_token
          userInfo.data,
          clientId,
          nonce,
          env,
        ),
        expires_in,
        scope: transformFeiShuScope(scope),
      } satisfies OpenIDSuccessTokenResponse), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // userinfo端点 - 直接转发到飞书
    if (url.pathname === '/userinfo') {
      const response = await fetch(FeiShuEndpoints.UserInfo, {
        headers: request.headers,
      });

      const userInfoFeiShu = await response.json() as FeiShuUserInfoResponse;

      if (userInfoFeiShu.code !== 0) {
        return new Response(userInfoFeiShu.msg, {
          status: response.status,
          headers: response.headers,
        });
      }

      return new Response(JSON.stringify({
        sub: userInfoFeiShu.data.open_id,
        name: userInfoFeiShu.data.name,
        email: userInfoFeiShu.data.email,
      } satisfies OpenIDUserInfoSuccessResponse), {
        headers: response.headers,
      });
    }

    return new Response('Not Found', { status: 404 });
  }
} satisfies ExportedHandler<Env>;

function transformFeiShuScope(feishuScope: string): string {
  // 将飞书的scope转换为OIDC的scope
  const scopeMap: Record<string, string> = {
    "contact:user.email:readonly": 'email',
    "contact:user.id:readonly": 'sub',
    "directory:employee.base.email:read": 'email',
    "directory:employee.base.enterprise_email:read": 'email',
    "contact:user.base:readonly": 'sub profile',
    "contact:user.employee_id:readonly": 'sub',
  };

  return [
    ...new Set(
      feishuScope.split(' ').map(scope => scopeMap[scope] || scope).join(' ').split(' ')
    ).add('openid')
  ].join(' ');
}

function transformOpenIDScope(openIDScope: string): string {
  const scopeMap = new Map<keyof OpenIDStandardClaims, string>([
    ["sub", 'contact:user.id:readonly contact:user.base:readonly contact:user.employee_id:readonly'],
    ["email", 'contact:user.email:readonly directory:employee.base.email:read directory:employee.base.enterprise_email:read'],
    ["profile", 'contact:user.base:readonly'],
  ]);

  return [
    ...new Set(
      openIDScope
        .split(' ').map(scope => scopeMap.get(scope as keyof OpenIDStandardClaims) || '')
        .join(' ').split(' ')
    )
  ].join(' ');
}

function truncateState(state: string): string {
  return state.substring(0, 256); // Use trivial truncate for now. TODO: use SHA-256 instead.
}

function truncateCode(feiShuCode: string): string {
  return feiShuCode.substring(0, 256); // Use trivial truncate for now. TODO: use SHA-256 instead.
}

function transformEmail(userInfo: FeiShuUserInfo, env: Env): string {
  return userInfo.enterprise_email || userInfo.email || `${userInfo.name}@${env.DOMAIN || 'example.com'}`;
}
