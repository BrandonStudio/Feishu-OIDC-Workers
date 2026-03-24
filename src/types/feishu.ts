export const FeishuEndpoints = {
  /** GET {@link FeishuAuthRequestParams} */
  OAuth2Auth: 'https://accounts.feishu.cn/open-apis/authen/v1/authorize' as const,
  /** POST {@link FeishuAccessTokenRequest}: {@link FeishuAccessTokenResponse} */
  OAuth2Token: 'https://open.feishu.cn/open-apis/authen/v2/oauth/token' as const,
  /** GET: {@link FeishuUserInfoResponse} */
  UserInfo: 'https://open.feishu.cn/open-apis/authen/v1/user_info' as const,
};

/**
 * ```http
 * GET https://accounts.feishu.cn/open-apis/authen/v1/authorize HTTP/1.1
 * ```
 * @see https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code
 * @example
 * ```
 * "https://accounts.feishu.cn/open-apis/authen/v1/authorize?client_id=cli_a5d611352af9d00b&redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Foauth%2Fcallback&scope=bitable:app:readonly%20contact:contact&state=RANDOMSTRING"
 * ```
 */
export type FeishuAuthRequestParams = {
  /**
   * 应用的 App ID，可以在开发者后台的**凭证与基础信息**页面查看 App ID。有关 App ID 的详细介绍，请参考[通用参数](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/terminology)。
   *
   * @example "cli_a5d611352af9d00b"
   */
  client_id: string;
  /**
   * 应用重定向地址，在用户授权成功后会跳转至该地址，同时会携带 `code` 以及 `state` 参数（如有传递 `state` 参数）。
   *
   * **请注意**：
   * 1. 该地址需经过 URL 编码；
   * 2. 调用本接口前，你需要在开发者后台应用的安全设置页面，将用于接受 OAuth 回调的 HTTP GET 请求接口地址配置为应用的重定向 URL。
   * 重定向 URL 支持配置多个，只有在重定向 URL 列表中的 URL 才会通过开放平台的安全校验。详情请参考配置重定向域名。
   *
   * @example "https://example.com/api/oauth/callback"
   */
  redirect_uri: string;
  /**
   * 用户需要增量授予应用的权限。
   *
   * **格式要求**： `scope` 参数为空格分隔，区分大小写的字符串。
   *
   * 注意：
   * - 开发者需要根据业务场景，在[开发者后台](https://open.larkoffice.com/app)的 **权限管理** 模块中完成调用 OpenAPI 所需的 `scope` 申请后，自主拼接 `scope` 参数。
   * 如果没有在应用后台为应用申请相应权限，则实际使用应用时用户会遇到 20027 报错。
   * - 应用最多一次可以请求用户授予 50 个 scope。详情参考 API 权限列表。
   * - 如果后续需要获取 `refresh_token`，此处需要添加 `offline_access` 权限。详情参考 [刷新 `user_access_token`](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token)）
   *
   * @example "contact:contact bitable:app:readonly"
   */
  scope?: string;
  /**
   * 用来维护请求和回调之间状态的附加字符串，在授权完成回调时会原样回传此参数。
   * 应用可以根据此字符串来判断上下文关系，同时该参数也可以用以防止 CSRF 攻击，请务必校验 `state` 参数前后是否一致。
   *
   * @example "RANDOMSTRING"
   */
  state?: string | null;
  /**
   * 用于通过 PKCE（Proof Key for Code Exchange）流程增强授权码的安全性。
   *
   * @see https://datatracker.ietf.org/doc/html/rfc7636
   * @example "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
   */
  code_challenge?: string;
  /**
   * 生成 code_challenge 的方法。
   *
   * **可选值**：
   *
   * 1. `S256`（推荐）：
   * 使用 SHA-256 哈希算法计算 `code_verifier` 的哈希值，并将结果进行 Base64URL 编码，生成 `code_challenge`。
   * 2. `plain`（默认值）：
   * 直接将 `code_verifier` 作为 `code_challenge`，无需进行额外处理。
   *
   * 以上 `code_verifier` 是指在发起授权前，本地生成的随机字符串。
   */
  code_challenge_method?: string;
};

/**
 * ```http
 * GET https://accounts.feishu.cn/open-apis/authen/v1/authorize HTTP/1.1
 * ```
 * @see https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code
 * @example
 * "https://example.com/api/oauth/callback?code=2Wd5g337vo5BZXUz-3W5KECsWUmIzJ_FJ1eFD59fD1AJIibIZljTu3OLK-HP_UI1&state=RANDOMSTRING"
 */
export type FeishuAuthResponse = {
  /**
   * 授权码，用于获取 `user_access_token`。
   *
   * **字符集**： [A-Z] / [a-z] / [0-9] / "-" / "_"
   *
   * **长度**： 请开发者至少预留 64 位字符
   * @example "2Wd5g337vo5BZXUz-3W5KECsWUmIzJ_FJ1eFD59fD1AJIibIZljTu3OLK-HP_UI1"
   */
  code: string;
  /** 打开授权页时传入的 `state` 参数的原值，如未传入此处不会返回。 */
  state?: string;
};

/**
 * ```http
 * POST https://open.feishu.cn/open-apis/authen/v2/oauth/token HTTP/1.1
 * ```
 * @see https://open.feishu.cn/document/authentication-management/access-token/get-user-access-token
 * @example
 * ```json
 * {
 *   "grant_type": "authorization_code",
 *   "client_id": "cli_a5ca35a685b0x26e",
 *   "client_secret": "baBqE5um9LbFGDy3X7LcfxQX1sqpXlwy",
 *   "code": "a61hb967bd094dge949h79bbexd16dfe",
 *   "redirect_uri": "https://example.com/api/oauth/callback",
 *   "code_verifier": "TxYmzM4PHLBlqm5NtnCmwxMH8mFlRWl_ipie3O0aVzo"
 * }
 * ```
 */
export type FeishuAccessTokenRequest = {
  /**
   * 授权类型。
   *
   * **固定值**：`authorization_code`
   */
  grant_type: "authorization_code";
  /**
   * 应用的 App ID。
   *
   * @example "cli_a5ca35a685b0x26e"
   */
  client_id: string;
  /**
   * 应用的 App Secret。
   *
   * @example "baBqE5um9LbFGDy3X7LcfxQX1sqpXlwy"
   */
  client_secret: string;
  /**
   * 授权码。
   *
   * @see https://open.feishu.cn/document/common-capabilities/sso/api/obtain-oauth-code
   * @example "a61hb967bd094dge949h79bbexd16dfe"
   */
  code: string;
  /**
   * 在构造授权页页面链接时所拼接的应用回调地址。
   *
   * > 网页应用授权场景必填，且需要**严格**与获取授权码时设置的 `redirect_uri` 保持一致，小程序授权场景无需传递
   *
   * @example "https://example.com/api/oauth/callback"
   */
  redirect_uri?: string;
  /**
   * 在发起授权前，本地生成的随机字符串，用于 PKCE（Proof Key for Code Exchange）流程。使用 PKCE 时，该值为必填项。
   *
   * **长度限制**： 最短 43 字符，最长 128 字符
   *
   * **可用字符集**： [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
   *
   * @see https://datatracker.ietf.org/doc/html/rfc7636
   * @example "TxYmzM4PHLBlqm5NtnCmwxMH8mFlRWl_ipie3O0aVzo"
   */
  code_verifier?: string;
  /**
   * 该参数用于缩减 `user_access_token` 的权限范围。
   *
   * 例如：
   * 1. 在[获取授权码](https://open.feishu.cn/document/common-capabilities/sso/api/obtain-oauth-code)时通过 `scope` 参数授权了 `contact:user.base:readonly` `contact:contact.base:readonly` `contact:user.employee:readonly` 三个权限。
   * 2. 在当前接口可通过 `scope` 参数传入 `contact:user.base:readonly`，将 `user_access_token` 的权限缩减为 `contact:user.base:readonly` 这一个。
   *
   * **注意**：
   * - 如果不指定当前参数，生成的 `user_access_token` 将包含用户授权时的所有权限。
   * - 当前参数不能传入重复的权限，否则会接口调用会报错，返回错误码 20067。
   * - 当前参数不能传入未授权的权限（即[获取授权码](https://open.feishu.cn/document/common-capabilities/sso/api/obtain-oauth-code)时用户已授权范围外的其他权限），否则接口调用会报错，返回错误码 20068。
   * - 多次调用当前接口缩减权限的范围不会叠加。
   * 例如，用户授予了权限 A 和 B，第一次调用该接口缩减为权限 A，则 `user_access_token` 只包含权限 A；第二次调用该接口缩减为权限 B，则 `user_access_token` 只包含权限 B。
   * - 生效的权限列表可通过本接口返回值 `scope` 查看。
   *
   * **格式要求**： 以空格分隔的 `scope` 列表
   *
   * 示例值："auth:user.id:read task:task:read"
   */
  scope?: string;
};

/**
 * @see {@linkcode FeishuAccessTokenResponse}
 */
type FeishuAccessTokenSuccessResponse = {
  /** 错误码，为 0 时表明请求成功，非 0 表示失败 */
  code: 0;
  /** 即 `user_access_token` */
  access_token: string;
  /** 即 `user_access_token` 的有效期，单位为秒 */
  expires_in: number;
  token_type: "Bearer";
  /** 本次请求所获得的 `access_token` 所具备的权限列表，以空格分隔 */
  scope: string;
};

/**
 * @see {@linkcode FeishuAccessTokenResponse}
 */
type FeishuAccessTokenSuccessResponseWithRefreshToken = FeishuAccessTokenSuccessResponse & {
  /**
   * 用于刷新 `user_access_token`，详见[刷新 `user_access_token`](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token)。
   * 该字段仅在请求成功且用户授予 `offline_access` 权限时返回。
   */
  refresh_token: string;
  /** 即 `refresh_token` 的有效期，单位为秒，仅在返回 `refresh_token` 时返回。 */
  refresh_token_expires_in: number;
};

/**
 * @see {@linkcode FeishuAccessTokenResponse}
 */
export type FeishuAccessTokenErrorResponse = {
  /** 错误码，为 0 时表明请求成功，非 0 表示失败 */
  code: number;
  /** 错误类型 */
  error: string;
  /** 具体的错误信息 */
  error_description: string;
};

/**
 * ```http
 * POST https://open.feishu.cn/open-apis/authen/v2/oauth/token HTTP/1.1
 * ```
 * @see https://open.feishu.cn/document/authentication-management/access-token/get-user-access-token
 * @example
 * **Success Response**
 * ```json
 * {
 *   "code": 0,
 *   "access_token": "eyJhbGciOiJFUzI1NiIs**********X6wrZHYKDxJkWwhdkrYg",
 *   "expires_in": 7200, // 非固定值，请务必根据响应体中返回的实际值来确定 access_token 的有效期
 *   "refresh_token": "eyJhbGciOiJFUzI1NiIs**********XXOYOZz1mfgIYHwM8ZJA",
 *   "refresh_token_expires_in": 604800, // 非固定值，请务必根据响应体中返回的实际值来确定 refresh_token 的有效期
 *   "scope": "auth:user.id:read offline_access task:task:read user_profile",
 *   "token_type": "Bearer"
 * }
 * ```
 *
 * @example
 * **Error Response**
 * ```json
 * {
 *   "code": 20050,
 *   "error": "server_error",
 *   "error_description": "An unexpected server error occurred. Please retry your request."
 * }
 * ```
 */
export type FeishuAccessTokenResponse = FeishuAccessTokenSuccessResponse | FeishuAccessTokenSuccessResponseWithRefreshToken | FeishuAccessTokenErrorResponse;

/**
 * @see {@linkcode FeishuUserInfoResponse}
 */
export type FeishuUserInfo = {
  /** 用户姓名 */
  name: string;
  /** 用户英文名称 */
  en_name: string;
  /** 用户头像 */
  avatar_url: string;
  /** 用户头像 72x72 */
  avatar_thumb: string;
  /** 用户头像 240x240 */
  avatar_middle: string;
  /** 用户头像 640x640 */
  avatar_big: string;
  /** 用户在应用内的唯一标识 */
  open_id: string;
  /** 用户对ISV的唯一标识，对于同一个ISV，用户在其名下所有应用的union_id相同 */
  union_id: string;
  /**
   * 用户邮箱。
   * 邮箱信息为管理员导入的用户联系方式，未经过用户本人实时验证，不建议开发者直接将其作为业务系统的登录凭证。
   * 如使用，务必自行认证。
   */
  email: string;
  /** 企业邮箱，请先确保已在管理后台启用飞书邮箱服务 */
  enterprise_email: string;
  /** 用户ID */
  user_id: string;
  /**
   * 用户手机号。
   * 手机号信息为管理员导入的用户联系方式，未经过用户本人实时验证，不建议开发者直接将其作为业务系统的登录凭证。
   * 如使用，务必自行认证。
   */
  mobile: string;
  /** 当前企业标识 */
  tenant_key: string;
  /** 用户工号 */
  employee_no: string;
};

/**
 * ```http
 * GET https://open.feishu.cn/open-apis/authen/v1/user_info HTTP/1.1
 * ```
 * @see https://open.feishu.cn/document/server-docs/authentication-management/login-state-management/get
 * @example
 * ```json
 * {
 *   "code": 0,
 *   "msg": "success",
 *   "data": {
 *     "name": "zhangsan",
 *     "en_name": "zhangsan",
 *     "avatar_url": "www.feishu.cn/avatar/icon",
 *     "avatar_thumb": "www.feishu.cn/avatar/icon_thumb",
 *     "avatar_middle": "www.feishu.cn/avatar/icon_middle",
 *     "avatar_big": "www.feishu.cn/avatar/icon_big",
 *     "open_id": "ou-caecc734c2e3328a62489fe0648c4b98779515d3",
 *     "union_id": "on-d89jhsdhjsajkda7828enjdj328ydhhw3u43yjhdj",
 *     "email": "zhangsan@feishu.cn",
 *     "enterprise_email": "demo@mail.com",
 *     "user_id": "5d9bdxxx",
 *     "mobile": "+86130002883xx",
 *     "tenant_key": "736588c92lxf175d",
 *     "employee_no": "111222333"
 *   }
 * }
 * ```
 */
export type FeishuUserInfoResponse = {
  /** 错误码，非 0 表示失败 */
  code: number;
  /** 错误描述 */
  msg: string;
  data: FeishuUserInfo;
};
