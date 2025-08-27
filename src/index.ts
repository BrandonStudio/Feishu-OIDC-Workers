import * as jose from 'jose';

// JWT生成和验证函数
async function generateIdToken(userInfo, clientId: string, nonce: string | null | undefined, env: Env) {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    // OIDC必需声明
    iss: env.ISSUER_BASE_URL,
    sub: userInfo.user_id,
    aud: clientId,
    exp: now + 3600,  // 1小时后过期
    iat: now,
    // 如果请求中包含nonce，需要在ID Token中包含相同的值
    ...(nonce && { nonce }),

    // 标准声明
    name: userInfo.name,
    email: userInfo.email,
    picture: userInfo.avatar_url
  };

  // 使用env中的私钥签名JWT
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid: env.JWT_KEY_ID })
    .sign(await jose.importPKCS8(env.JWT_PRIVATE_KEY, 'RS256'));
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
        response_types_supported: ['code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        scopes_supported: ['openid', 'profile', 'email'],
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // JWKS端点 - 提供用于验证JWT签名的公钥
    if (url.pathname === '/jwks') {
      return new Response(JSON.stringify({
        keys: [{
          kty: 'RSA',
          use: 'sig',
          kid: env.JWT_KEY_ID,
          ...JSON.parse(env.JWT_PUBLIC_KEY_JWK)
        }]
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 授权端点 - 重定向到飞书登录
    if (url.pathname === '/auth') {
      const feishuAuthUrl = new URL('https://open.feishu.cn/open-apis/authen/v1/index');
      feishuAuthUrl.searchParams.set('app_id', env.FEISHU_APP_ID);
      feishuAuthUrl.searchParams.set('redirect_uri', `${env.ISSUER_BASE_URL}/callback`);
      // 保存原始参数用于回调时使用
      feishuAuthUrl.searchParams.set('state', url.searchParams.get('state') || '');

      return Response.redirect(feishuAuthUrl.toString());
    }

    // 处理飞书回调
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code')!;
      const state = url.searchParams.get('state')!;

      // 获取飞书访问令牌
      const tokenResponse = await fetch('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: env.FEISHU_APP_ID,
          app_secret: env.FEISHU_APP_SECRET
        })
      });

      const { app_access_token } = await tokenResponse.json();

      // 获取用户信息
      const userInfoResponse = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
        headers: {
          'Authorization': `Bearer ${app_access_token}`
        }
      });

      const userInfo = await userInfoResponse.json();

      // 重定向回原始客户端，带上授权码和state
      const redirectUrl = new URL(url.searchParams.get('redirect_uri')!);
      redirectUrl.searchParams.set('code', code);
      redirectUrl.searchParams.set('state', state);

      return Response.redirect(redirectUrl.toString());
    }

    // token端点
    if (url.pathname === '/token' && request.method === 'POST') {
      const formData = await request.formData();
      const code = formData.get('code');
      const clientId = formData.get('client_id') as string;
      const nonce = formData.get('nonce') as string | null | undefined;

      // 用code换取飞书的access_token和用户信息
      // ... 与callback中相同的token和用户信息获取逻辑 ...

      // 返回OIDC所需的令牌
      return new Response(JSON.stringify({
        access_token: app_access_token,
        token_type: 'Bearer',
        id_token: await generateIdToken(userInfo, clientId, nonce, env),
        expires_in: 3600
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // userinfo端点 - 直接转发到飞书
    if (url.pathname === '/userinfo') {
      const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
        headers: request.headers
      });

      return new Response(response.body, {
        headers: response.headers
      });
    }

    return new Response('Not Found', { status: 404 });
  }
} satisfies ExportedHandler<Env>;
