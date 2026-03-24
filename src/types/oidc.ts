/**
 * OpenID Connect Core 1.0 types.
 * @see https://openid.net/specs/openid-connect-core-1_0.html
 */

import type {
  OAuth2AccessTokenSuccessResponse,
  OAuth2AuthErrorResponse
} from "./oauth2";

/**
 * @see https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
 */
export type OpenIDProviderMetadata = {
  /**
   * URL using the `https` scheme with no query or fragment components that the OP asserts as its Issuer Identifier.
   * If Issuer discovery is supported (see [OpenID Provider Issuer Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html#IssuerDiscovery)),
   * this value MUST be identical to the issuer value returned by WebFinger.
   * This also MUST be identical to the `iss` Claim value in ID Tokens issued from this Issuer.
   */
  issuer: string;
  /**
   * URL of the OP's OAuth 2.0 Authorization Endpoint [OpenID.Core].
   * This URL MUST use the `https` scheme and MAY contain port, path, and query parameter components.
   */
  authorization_endpoint: string;
  /**
   * URL of the OP's OAuth 2.0 Token Endpoint [OpenID.Core].
   * This is REQUIRED unless only the Implicit Flow is used.
   * This URL MUST use the `https` scheme and MAY contain port, path, and query parameter components.
   */
  token_endpoint?: string;
  /**
   * RECOMMENDED.
   * URL of the OP's UserInfo Endpoint [OpenID.Core].
   * This URL MUST use the `https` scheme and MAY contain port, path, and query parameter components.
   */
  userinfo_endpoint?: string;
  /**
   * URL of the OP's JWK Set [JWK] document, which MUST use the `https` scheme.
   * This contains the signing key(s) the RP uses to validate signatures from the OP.
   * The JWK Set MAY also contain the Server's encryption key(s), which are used by RPs to encrypt requests to the Server.
   * When both signing and encryption keys are made available,
   * a `use` (public key use) parameter value is REQUIRED for all keys in the referenced JWK Set to indicate each key's intended usage.
   * Although some algorithms allow the same key to be used for both signatures and encryption, doing so is NOT RECOMMENDED, as it is less secure.
   * The JWK `x5c` parameter MAY be used to provide X.509 representations of keys provided.
   * When used, the bare key values MUST still be present and MUST match those in the certificate.
   * The JWK Set MUST NOT contain private or symmetric key values.
   */
  jwks_uri: string;
  /**
   * RECOMMENDED.
   * URL of the OP's Dynamic Client Registration Endpoint [OpenID.Registration], which MUST use the `https` scheme.
   */
  registration_endpoint?: string;
  /**
   * RECOMMENDED.
   * JSON array containing a list of the OAuth 2.0 scope values that this server supports.
   * The server MUST support the `openid` scope value.
   * Servers MAY choose not to advertise some supported scope values even when this parameter is used,
   * although those defined in [OpenID.Core] SHOULD be listed, if supported.
   */
  scopes_supported?: string[];
  /**
   * JSON array containing a list of the OAuth 2.0 `response_type` values that this OP supports.
   * Dynamic OpenID Providers MUST support the `code`, `id_token`, and the `id_token token` Response Type values.
   */
  response_types_supported: string[];
  /**
   * JSON array containing a list of the OAuth 2.0 `response_mode` values that this OP supports,
   * as specified in OAuth 2.0 Multiple Response Type Encoding Practices [OAuth.Responses].
   * If omitted, the default for Dynamic OpenID Providers is `["query", "fragment"]`.
   */
  response_modes_supported?: string[];
  /**
   * JSON array containing a list of the OAuth 2.0 Grant Type values that this OP supports.
   * Dynamic OpenID Providers MUST support the `authorization_code` and `implicit` Grant Type values and MAY support other Grant Types.
   * If omitted, the default value is `["authorization_code", "implicit"]`.
   */
  grant_types_supported?: string[];
  /**
   * JSON array containing a list of the Authentication Context Class References that this OP supports.
   */
  acr_values_supported?: string[];
  /**
   * JSON array containing a list of the Subject Identifier types that this OP supports.
   * Valid types include `pairwise` and `public`.
   */
  subject_types_supported: string[];
  /**
   * JSON array containing a list of the JWS signing algorithms (`alg` values) supported by the OP for the ID Token to encode the Claims in a JWT [JWT].
   * The algorithm `RS256` MUST be included.
   * The value `none` MAY be supported but MUST NOT be used unless the Response Type used returns no ID Token from the Authorization Endpoint (such as when using the Authorization Code Flow).
   */
  id_token_signing_alg_values_supported: string[];
  /**
   * JSON array containing a list of the JWE encryption algorithms (`alg` values) supported by the OP for the ID Token to encode the Claims in a JWT [JWT].
   */
  id_token_encryption_alg_values_supported?: string[];
  /**
   * JSON array containing a list of the JWE encryption algorithms (`enc` values) supported by the OP for the ID Token to encode the Claims in a JWT [JWT].
   */
  id_token_encryption_enc_values_supported?: string[];
  /**
   * JSON array containing a list of the JWS [JWS] signing algorithms (`alg` values) [JWA] supported by the UserInfo Endpoint to encode the Claims in a JWT [JWT].
   * The value `none` MAY be included.
   */
  userinfo_signing_alg_values_supported?: string[];
  /**
   * JSON array containing a list of the JWE [JWE] encryption algorithms (`alg` values) [JWA] supported by the UserInfo Endpoint to encode the Claims in a JWT [JWT].
   */
  userinfo_encryption_alg_values_supported?: string[];
  /**
   * JSON array containing a list of the JWE encryption algorithms (`enc` values) [JWA] supported by the UserInfo Endpoint to encode the Claims in a JWT [JWT].
   */
  userinfo_encryption_enc_values_supported?: string[];
  /**
   * JSON array containing a list of the JWS signing algorithms (`alg` values) supported by the OP for Request Objects,
   * which are described in Section 6.1 of OpenID Connect Core 1.0 [OpenID.Core].
   * These algorithms are used both when the Request Object is passed by value (using the `request` parameter)
   * and when it is passed by reference (using the `request_uri` parameter).
   * Servers SHOULD support `none` and `RS256`.
   */
  request_object_signing_alg_values_supported?: string[];
  /**
   * JSON array containing a list of the JWE encryption algorithms (`alg` values) supported by the OP for Request Objects.
   * These algorithms are used both when the Request Object is passed by value and when it is passed by reference.
   */
  request_object_encryption_alg_values_supported?: string[];
  /**
   * JSON array containing a list of the JWE encryption algorithms (`enc` values) supported by the OP for Request Objects.
   * These algorithms are used both when the Request Object is passed by value and when it is passed by reference.
   */
  request_object_encryption_enc_values_supported?: string[];
  /**
   * JSON array containing a list of Client Authentication methods supported by this Token Endpoint.
   * The options are `client_secret_post`, `client_secret_basic`, `client_secret_jwt`, and `private_key_jwt`,
   * as described in Section 9 of OpenID Connect Core 1.0 [OpenID.Core].
   * Other authentication methods MAY be defined by extensions.
   * If omitted, the default is `client_secret_basic` -- the HTTP Basic Authentication Scheme specified in Section 2.3.1 of OAuth 2.0 [RFC6749].
   */
  token_endpoint_auth_methods_supported?: string[];
  /**
   * JSON array containing a list of the JWS signing algorithms (`alg` values) supported by the Token Endpoint for the signature on the JWT [JWT]
   * used to authenticate the Client at the Token Endpoint for the `private_key_jwt` and `client_secret_jwt` authentication methods.
   * Servers SHOULD support `RS256`. The value `none` MUST NOT be used.
   */
  token_endpoint_auth_signing_alg_values_supported?: string[];
  /**
   * JSON array containing a list of the `display` parameter values that the OpenID Provider supports.
   * These values are described in Section 3.1.2.1 of OpenID Connect Core 1.0 [OpenID.Core].
   */
  display_values_supported?: string[];
  /**
   * JSON array containing a list of the Claim Types that the OpenID Provider supports.
   * Values defined by this specification are `normal`, `aggregated`, and `distributed`.
   * If omitted, the implementation supports only `normal` Claims.
   */
  claim_types_supported?: string[];
  /**
   * RECOMMENDED.
   * JSON array containing a list of the Claim Names of the Claims that the OpenID Provider MAY be able to supply values for.
   * Note that for privacy or other reasons, this might not be an exhaustive list.
   */
  claims_supported?: string[];
  /**
   * URL of a page containing human-readable information that developers might want or need to know when using the OpenID Provider.
   * In particular, if the OpenID Provider does not support Dynamic Client Registration,
   * then information on how to register Clients needs to be provided in this documentation.
   */
  service_documentation?: string;
  /**
   * Languages and scripts supported for values in Claims being returned, represented as a JSON array of BCP47 [RFC5646] language tag values.
   * Not all languages and scripts are necessarily supported for all Claim values.
   */
  claims_locales_supported?: string[];
  /**
   * Languages and scripts supported for the user interface, represented as a JSON array of BCP47 [RFC5646] language tag values.
   */
  ui_locales_supported?: string[];
  /**
   * Boolean value specifying whether the OP supports use of the `claims` parameter, with `true` indicating support.
   * If omitted, the default value is `false`.
   */
  claims_parameter_supported?: boolean;
  /**
   * Boolean value specifying whether the OP supports use of the `request` parameter, with `true` indicating support.
   * If omitted, the default value is `false`.
   */
  request_parameter_supported?: boolean;
  /**
   * Boolean value specifying whether the OP supports use of the `request_uri` parameter, with `true` indicating support.
   * If omitted, the default value is `true`.
   */
  request_uri_parameter_supported?: boolean;
  /**
   * Boolean value specifying whether the OP requires any `request_uri` values used to be pre-registered using the `request_uris` registration parameter.
   * Pre-registration is REQUIRED when the value is `true`.
   * If omitted, the default value is `false`.
   */
  require_request_uri_registration?: boolean;
  /**
   * URL that the OpenID Provider provides to the person registering the Client to read about the OP's policy for using data provided by the OP.
   * The registration process SHOULD display this URL to the person registering the Client if it is given.
   */
  op_policy_uri?: string;
  /**
   * URL that the OpenID Provider provides to the person registering the Client to read about the OP's terms of service.
   * The registration process SHOULD display this URL to the person registering the Client if it is given.
   */
  op_tos_uri?: string;
};

/**
 * @see https://openid.net/specs/openid-connect-core-1_0.md#IDToken
 * @example
 * ```json
 * {
 *   "iss": "https://server.example.com",
 *   "sub": "24400320",
 *   "aud": "s6BhdRkqt3",
 *   "nonce": "n-0S6_WzA2Mj",
 *   "exp": 1311281970,
 *   "iat": 1311280970,
 *   "auth_time": 1311280969,
 *   "acr": "urn:mace:incommon:iap:silver"
 *  }
 * ```
 */
type OpenIDTokenStandard = {
  /**
   * Issuer Identifier for the Issuer of the response.
   * The `iss` value is a case-sensitive URL using the `https` scheme that contains scheme, host, and optionally, port number and path components and no query or fragment components.
   */
  iss: string;
  /**
   * Subject Identifier.
   * A locally unique and never reassigned identifier within the Issuer for the End-User, which is intended to be consumed by the Client, e.g., `24400320` or `AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4`.
   * It MUST NOT exceed 255 ASCII [RFC20] characters in length. The `sub` value is a case-sensitive string.
   */
  sub: string;
  /**
   * Audience(s) that this ID Token is intended for.
   * It MUST contain the OAuth 2.0 `client_id` of the Relying Party as an audience value.
   * It MAY also contain identifiers for other audiences.
   * In the general case, the `aud` value is an array of case-sensitive strings.
   * In the common special case when there is one audience, the `aud` value MAY be a single case-sensitive string.
   */
  aud: string;
  /**
   * Expiration time on or after which the ID Token MUST NOT be accepted by the RP when performing authentication with the OP.
   * The processing of this parameter requires that the current date/time MUST be before the expiration date/time listed in the value.
   * Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew.
   * Its value is a JSON [RFC8259] number representing the number of seconds from 1970-01-01T00:00:00Z as measured in UTC until the date/time.
   * See RFC 3339 [RFC3339] for details regarding date/times in general and UTC in particular.
   * NOTE: The ID Token expiration time is unrelated the lifetime of the authenticated session between the RP and the OP.
   */
  exp: number;
  /**
   * Time at which the JWT was issued.
   * Its value is a JSON number representing the number of seconds from 1970-01-01T00:00:00Z as measured in UTC until the date/time.
   */
  iat: number;
  /**
   * Time when the End-User authentication occurred.
   * Its value is a JSON number representing the number of seconds from 1970-01-01T00:00:00Z as measured in UTC until the date/time.
   * When a `max_age` request is made or when `auth_time` is requested as an Essential Claim, then this Claim is REQUIRED; otherwise, its inclusion is OPTIONAL.
   * (The `auth_time` Claim semantically corresponds to the OpenID 2.0 PAPE [OpenID.PAPE] `auth_time` response parameter.)
   */
  auth_time?: number;
  /**
   * String value used to associate a Client session with an ID Token, and to mitigate replay attacks.
   * The value is passed through unmodified from the Authentication Request to the ID Token.
   * If present in the ID Token, Clients MUST verify that the `nonce` Claim Value is equal to the value of the `nonce` parameter sent in the Authentication Request.
   * If present in the Authentication Request, Authorization Servers MUST include a `nonce` Claim in the ID Token with the Claim Value being the `nonce` value sent in the Authentication Request.
   * Authorization Servers SHOULD perform no other processing on `nonce` values used.
   * The `nonce` value is a case-sensitive string.
   */
  nonce?: string;
  /**
   * Authentication Context Class Reference.
   * String specifying an Authentication Context Class Reference value that identifies the Authentication Context Class that the authentication performed satisfied.
   * The value `"0"` indicates the End-User authentication did not meet the requirements of ISO/IEC 29115 [ISO29115] level 1.
   * For historic reasons, the value `"0"` is used to indicate that there is no confidence that the same person is actually there.
   * Authentications with level 0 SHOULD NOT be used to authorize access to any resource of any monetary value.
   * (This corresponds to the OpenID 2.0 PAPE [OpenID.PAPE] `nist_auth_level` 0.)
   * An absolute URI or an RFC 6711 [RFC6711] registered name SHOULD be used as the `acr` value; registered names MUST NOT be used with a different meaning than that which is registered.
   * Parties using this claim will need to agree upon the meanings of the values used, which may be context specific.
   * The `acr` value is a case-sensitive string.
   */
  acr?: string;
  /**
   * Authentication Methods References.
   * JSON array of strings that are identifiers for authentication methods used in the authentication.
   * For instance, values might indicate that both password and OTP authentication methods were used.
   * The `amr` value is an array of case-sensitive strings.
   * Values used in the `amr` Claim SHOULD be from those registered in the IANA Authentication Method Reference Values registry [IANA.AMR] established by [RFC8176];
   * parties using this claim will need to agree upon the meanings of any unregistered values used, which may be context specific.
   */
  amr?: string[];
  /**
   * Authorized party - the party to which the ID Token was issued.
   * If present, it MUST contain the OAuth 2.0 Client ID of this party.
   * The `azp` value is a case-sensitive string containing a StringOrURI value.
   * Note that in practice, the `azp` Claim only occurs when extensions beyond the scope of this specification are used; therefore, implementations not using such extensions are encouraged to not use `azp` and to ignore it when it does occur.
   */
  azp?: string;
};

/**
 * The primary extension that OpenID Connect makes to OAuth 2.0 to enable End-Users to be Authenticated is the ID Token data structure.
 * The ID Token is a security token that contains
 * Claims about the Authentication of an End-User by an Authorization Server when using a Client,
 * and potentially other requested Claims.
 * The ID Token is represented as a JSON Web Token (JWT).
 * @see https://openid.net/specs/openid-connect-core-1_0.html#IDToken
 *
 * TODO: Add claims from https://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken, https://openid.net/specs/openid-connect-core-1_0.html#HybridIDToken, and https://openid.net/specs/openid-connect-core-1_0.html#SelfIssuedResponse.
 */
export type OpenIDToken = OpenIDTokenStandard & Partial<OpenIDStandardClaims>;

/**
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
 * @example
 * ```http
 * GET /authorize?
 *   response_type=code
 *   &scope=openid%20profile%20email
 *   &client_id=s6BhdRkqt3
 *   &state=af0ifjsldkj
 *   &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb HTTP/1.1
 * ```
 */
export type OpenIDAuthRequestParams = {
  /**
   * OpenID Connect requests MUST contain the `openid` scope value.
   * If the `openid` scope value is not present, the behavior is entirely unspecified.
   * Other scope values MAY be present.
   * Scope values used that are not understood by an implementation SHOULD be ignored.
   *
   * @see https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims
   * @see https://openid.net/specs/openid-connect-core-1_0.html#OfflineAccess
   */
  scope: string;
  /**
   * OAuth 2.0 Response Type value that determines the authorization processing flow to be used, including what parameters are returned from the endpoints used.
   * When using the Authorization Code Flow, this value is `code`.
   */
  response_type: string;
  /**
   * OAuth 2.0 Client Identifier valid at the Authorization Server.
   */
  client_id: string;
  /**
   * Redirection URI to which the response will be sent.
   * This URI MUST exactly match one of the Redirection URI values for the Client pre-registered at the OpenID Provider, with the matching performed as described in Section 6.2.1 of [RFC3986] (Simple String Comparison).
   * When using this flow, the Redirection URI SHOULD use the `https` scheme;
   * however, it MAY use the `http` scheme, provided that the Client Type is `confidential`, as defined in Section 2.1 of OAuth 2.0, and provided the OP allows the use of `http` Redirection URIs in this case.
   * Also, if the Client is a native application, it MAY use the `http` scheme with `localhost` or the IP loopback literals `127.0.0.1` or `[::1]` as the hostname.
   * The Redirection URI MAY use an alternate scheme, such as one that is intended to identify a callback into a native application.
   */
  redirect_uri: string;
  /**
   * RECOMMENDED.
   * Opaque value used to maintain state between the request and the callback.
   * Typically, Cross-Site Request Forgery (CSRF, XSRF) mitigation is done by cryptographically binding the value of this parameter with a browser cookie.
   */
  state?: string;
  /**
   * Informs the Authorization Server of the mechanism to be used for returning parameters from the Authorization Endpoint.
   * This use of this parameter is NOT RECOMMENDED when the Response Mode that would be requested is the default mode specified for the Response Type.
   */
  response_mode?: string;
  /**
   * String value used to associate a Client session with an ID Token, and to mitigate replay attacks.
   * The value is passed through unmodified from the Authentication Request to the ID Token.
   * Sufficient entropy MUST be present in the `nonce` values used to prevent attackers from guessing values.
   *
   * @see https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes
   */
  nonce?: string;
  /**
   * ASCII string value that specifies how the Authorization Server displays the authentication and consent user interface pages to the End-User.
   * The defined values are:
   * - page:
   *   The Authorization Server SHOULD display the authentication and consent UI consistent with a full User Agent page view. If the display parameter is not specified, this is the default display mode.
   * - popup:
   *   The Authorization Server SHOULD display the authentication and consent UI consistent with a popup User Agent window. The popup User Agent window should be of an appropriate size for a login-focused dialog and should not obscure the entire window that it is popping up over.
   * - touch:
   *   The Authorization Server SHOULD display the authentication and consent UI consistent with a device that leverages a touch interface.
   * - wap:
   *   The Authorization Server SHOULD display the authentication and consent UI consistent with a "feature phone" type display.
   *
   * The Authorization Server MAY also attempt to detect the capabilities of the User Agent and present an appropriate display.
   *
   * If an OP receives a `display` value outside the set defined above that it does not understand, it MAY return an error or it MAY ignore it;
   * in practice, not returning errors for not-understood values will help facilitate phasing in extensions using new `display` values.
   */
  display?: "page" | "popup" | "touch" | "wap";
  /**
   * Space-delimited, case-sensitive list of ASCII string values that specifies whether the Authorization Server prompts the End-User for reauthentication and consent.
   * The defined values are:
   * - none:
   * The Authorization Server MUST NOT display any authentication or consent user interface pages.
   * An error is returned if an End-User is not already authenticated or the Client does not have pre-configured consent for the requested Claims or does not fulfill other conditions for processing the request.
   * The error code will typically be `login_required`, `interaction_required`, or another code defined in Section 3.1.2.6.
   * This can be used as a method to check for existing authentication and/or consent.
   * - login:
   *   The Authorization Server SHOULD prompt the End-User for reauthentication. If it cannot reauthenticate the End-User, it MUST return an error, typically `login_required`.
   * - consent:
   *   The Authorization Server SHOULD prompt the End-User for consent before returning information to the Client.
   *   If it cannot obtain consent, it MUST return an error, typically `consent_required`.
   * - select_account:
   *   The Authorization Server SHOULD prompt the End-User to select a user account.
   *   This enables an End-User who has multiple accounts at the Authorization Server to select amongst the multiple accounts that they might have current sessions for.
   *   If it cannot obtain an account selection choice made by the End-User, it MUST return an error, typically `account_selection_required`.
   *
   * The `prompt` parameter can be used by the Client to make sure that the End-User is still present for the current session or to bring attention to the request.
   * If this parameter contains `none` with any other value, an error is returned.
   *
   * If an OP receives a `prompt` value outside the set defined above that it does not understand, it MAY return an error or it MAY ignore it;
   * in practice, not returning errors for not-understood values will help facilitate phasing in extensions using new `prompt` values.
   *
   * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthError
   */
  prompt?: "none" | "login" | "consent" | "select_account";
  /**
   * Maximum Authentication Age.
   * Specifies the allowable elapsed time in seconds since the last time the End-User was actively authenticated by the OP.
   * If the elapsed time is greater than this value, the OP MUST attempt to actively re-authenticate the End-User.
   * (The `max_age` request parameter corresponds to the OpenID 2.0 PAPE [OpenID.PAPE] `max_auth_age` request parameter.)
   * When `max_age` is used, the ID Token returned MUST include an `auth_time` Claim Value. Note that `max_age=0` is equivalent to `prompt=login`.
   */
  max_age?: number;
  /**
   * End-User's preferred languages and scripts for the user interface, represented as a space-separated list of BCP47 [RFC5646] language tag values, ordered by preference.
   * For instance, the value "fr-CA fr en" represents a preference for French as spoken in Canada, then French (without a region designation), followed by English (without a region designation).
   * An error SHOULD NOT result if some or all of the requested locales are not supported by the OpenID Provider.
   */
  ui_locales?: string;
  /**
   * ID Token previously issued by the Authorization Server being passed as a hint about the End-User's current or past authenticated session with the Client.
   * If the End-User identified by the ID Token is already logged in or is logged in as a result of the request (with the OP possibly evaluating other information beyond the ID Token in this decision),
   * then the Authorization Server returns a positive response; otherwise, it MUST return an error, such as `login_required`.
   * When possible, an `id_token_hint` SHOULD be present when `prompt=none` is used and an `invalid_request` error MAY be returned if it is not;
   * however, the server SHOULD respond successfully when possible, even if it is not present.
   * The Authorization Server need not be listed as an audience of the ID Token when it is used as an `id_token_hint` value.
   *
   * If the ID Token received by the RP from the OP is encrypted, to use it as an `id_token_hint`, the Client MUST decrypt the signed ID Token contained within the encrypted ID Token.
   * The Client MAY re-encrypt the signed ID token to the Authentication Server using a key that enables the server to decrypt the ID Token and use the re-encrypted ID token as the `id_token_hint` value.
   */
  id_token_hint?: string;
  /**
   * Hint to the Authorization Server about the login identifier the End-User might use to log in (if necessary).
   * This hint can be used by an RP if it first asks the End-User for their e-mail address (or other identifier) and then wants to pass that value as a hint to the discovered authorization service.
   * It is RECOMMENDED that the hint value match the value used for discovery.
   * This value MAY also be a phone number in the format specified for the `phone_number` Claim.
   * The use of this parameter is left to the OP's discretion.
   */
  login_hint?: string;
  /**
   * Requested Authentication Context Class Reference values.
   * Space-separated string that specifies the `acr` values that the Authorization Server is being requested to use for processing this Authentication Request, with the values appearing in order of preference.
   * The Authentication Context Class satisfied by the authentication performed is returned as the `acr` Claim Value, as specified in [ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken).
   * The `acr` Claim is requested as a Voluntary Claim by this parameter.
   */
  acr_values?: string;
};

/**
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AuthError
 */
export type OpenIDAuthErrorResponse = Omit<OAuth2AuthErrorResponse, 'error'> & {
  /**
   * In addition to the error codes defined in {@link OAuth2AuthErrorResponse}, this specification also defines the following error codes:
   *
   * - `interaction_required`
   *   The Authorization Server requires End-User interaction of some form to proceed.
   *   This error MAY be returned when the `prompt` parameter value in the Authentication Request is `none`,
   *   but the Authentication Request cannot be completed without displaying a user interface for End-User interaction.
   *
   * - `login_required`
   *   The Authorization Server requires End-User authentication.
   *   This error MAY be returned when the `prompt` parameter value in the Authentication Request is `none`,
   *   but the Authentication Request cannot be completed without displaying a user interface for End-User authentication.
   *
   * - `account_selection_required`
   *   The End-User is REQUIRED to select a session at the Authorization Server.
   *   The End-User MAY be authenticated at the Authorization Server with different associated accounts, but the End-User did not select a session.
   *   This error MAY be returned when the `prompt` parameter value in the Authentication Request is `none`,
   *   but the Authentication Request cannot be completed without displaying a user interface to prompt for a session to use.
   *
   * - `consent_required`
   *   The Authorization Server requires End-User consent.
   *   This error MAY be returned when the `prompt` parameter value in the Authentication Request is `none`,
   *   but the Authentication Request cannot be completed without displaying a user interface for End-User consent.
   *
   * - `invalid_request_uri`
   *   The `request_uri` in the Authorization Request returns an error or contains invalid data.
   *
   * - `invalid_request_object`
   *   The `request` parameter contains an invalid Request Object.
   *
   * - `request_not_supported`
   *   The OP does not support use of the `request` parameter defined in [Passing Request Parameters as JWTs](https://openid.net/specs/openid-connect-core-1_0.html#JWTRequests).
   *
   * - `request_uri_not_supported`
   *   The OP does not support use of the `request_uri` parameter defined in [Passing Request Parameters as JWTs](https://openid.net/specs/openid-connect-core-1_0.html#JWTRequests).
   *
   * - `registration_not_supported`
   *   The OP does not support use of the `registration` parameter defined in [Providing Information with the "registration" Request Parameter](https://openid.net/specs/openid-connect-core-1_0.html#RegistrationParameter).
   *
   * @override
   */
  error:
    | OAuth2AuthErrorResponse["error"]
    | "interaction_required"
    | "login_required"
    | "account_selection_required"
    | "consent_required"
    | "invalid_request_uri"
    | "invalid_request_object"
    | "request_not_supported"
    | "request_uri_not_supported"
    | "registration_not_supported";
};

/**
 * @see https://openid.net/specs/openid-connect-core-1_0.html#TokenResponse
 */
export type OpenIDSuccessTokenResponse = OAuth2AccessTokenSuccessResponse & {
  /** ID Token value associated with the authenticated session. */
  id_token: string;
};

/**
 * @see https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export type OpenIDStandardClaims = {
  /**
   * Subject - Identifier for the End-User at the Issuer.
   */
  sub: string;

  /**
   * End-User's full name in displayable form including all name parts, possibly including titles and suffixes, ordered according to the End-User's locale and preferences.
   */
  name: string;

  /**
   * Given name(s) or first name(s) of the End-User.
   * Note that in some cultures, people can have multiple given names;
   * all can be present, with the names being separated by space characters.
   */
  given_name: string;

  /**
   * Surname(s) or last name(s) of the End-User.
   * Note that in some cultures, people can have multiple family names or no family name;
   * all can be present, with the names being separated by space characters.
   */
  family_name: string;

  /**
   * Middle name(s) of the End-User.
   * Note that in some cultures, people can have multiple middle names;
   * all can be present, with the names being separated by space characters.
   * Also note that in some cultures, middle names are not used.
   */
  middle_name: string;

  /**
   * Casual name of the End-User that may or may not be the same as the `given_name`.
   * For instance, a `nickname` value of Mike might be returned alongside a `given_name` value of `Michael`.
   */
  nickname: string;

  /**
   * Shorthand name by which the End-User wishes to be referred to at the RP, such as `janedoe` or `j.doe`.
   * This value MAY be any valid JSON string including special characters such as `@`, `/`, or whitespace.
   * The RP MUST NOT rely upon this value being unique, as discussed in [Claim Stability and Uniqueness](https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability).
   */
  preferred_username: string;

  /**
   * URL of the End-User's profile page.
   * The contents of this Web page SHOULD be about the End-User.
   */
  profile: string;

  /**
   * URL of the End-User's profile picture.
   * This URL MUST refer to an image file (for example, a PNG, JPEG, or GIF image file), rather than to a Web page containing an image.
   * Note that this URL SHOULD specifically reference a profile photo of the End-User suitable for displaying when describing the End-User, rather than an arbitrary photo taken by the End-User.
   */
  picture: string;

  /**
   * URL of the End-User's Web page or blog.
   * This Web page SHOULD contain information published by the End-User or an organization that the End-User is affiliated with.
   */
  website: string;

  /**
   * End-User's preferred e-mail address.
   * Its value MUST conform to the RFC 5322 [RFC5322] addr-spec syntax.
   * The RP MUST NOT rely upon this value being unique, as discussed in [Claim Stability and Uniqueness](https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability).
   */
  email: string;

  /**
   * True if the End-User's e-mail address has been verified; otherwise false.
   * When this Claim Value is `true`, this means that the OP took affirmative steps to ensure that this e-mail address was controlled by the End-User at the time the verification was performed.
   * The means by which an e-mail address is verified is context specific, and dependent upon the trust framework or contractual agreements within which the parties are operating.
   */
  email_verified: boolean;

  /**
   * End-User's gender.
   * Values defined by this specification are `female` and `male`.
   * Other values MAY be used when neither of the defined values are applicable.
   */
  gender: "female" | "male" | string;

  /**
   * End-User's birthday, represented as an ISO 8601-1 [ISO8601‑1] `YYYY-MM-DD` format.
   * The year MAY be `0000`, indicating that it is omitted.
   * To represent only the year, `YYYY` format is allowed.
   * Note that depending on the underlying platform's date related function, providing just year can result in varying month and day,
   * so the implementers need to take this factor into account to correctly process the dates.
   */
  birthdate: string;

  /**
   * String from IANA Time Zone Database [IANA.time‑zones] representing the End-User's time zone.
   * For example, `Europe/Paris` or `America/Los_Angeles`.
   */
  zoneinfo: string;

  /**
   * End-User's locale, represented as a BCP47 [RFC5646] language tag.
   * This is typically an ISO 639 Alpha-2 [ISO639] language code in lowercase and an ISO 3166-1 Alpha-2 [ISO3166‑1] country code in uppercase, separated by a dash.
   * For example, `en-US` or `fr-CA`.
   * As a compatibility note, some implementations have used an underscore as the separator rather than a dash, for example, `en_US`;
   * Relying Parties MAY choose to accept this locale syntax as well.
   */
  locale: string;

  /**
   * End-User's preferred telephone number.
   * E.164 [E.164] is RECOMMENDED as the format of this Claim, for example, `+1 (425) 555-1212` or `+56 (2) 687 2400`.
   * If the phone number contains an extension, it is RECOMMENDED that the extension be represented using the RFC 3966 [RFC3966] extension syntax,
   * for example, `+1 (604) 555-1234;ext=5678`.
   */
  phone_number: string;

  /**
   * True if the End-User's phone number has been verified; otherwise false.
   * When this Claim Value is `true`, this means that the OP took affirmative steps to ensure that this phone number was controlled by the End-User at the time the verification was performed.
   * The means by which a phone number is verified is context specific, and dependent upon the trust framework or contractual agreements within which the parties are operating.
   * When `true`, the `phone_number` Claim MUST be in E.164 format and any extensions MUST be represented in RFC 3966 format.
   */
  phone_number_verified: boolean;

  /**
   * End-User's preferred postal address.
   * The value of the `address` member is a JSON [RFC8259] structure containing some or all of the members defined in [AddressClaim](https://openid.net/specs/openid-connect-core-1_0.html#AddressClaim).
   */
  address: OpenIDAddressClaim;

  /**
   * Time the End-User's information was last updated.
   * Its value is a JSON number representing the number of seconds from 1970-01-01T00:00:00Z as measured in UTC until the date/time.
   */
  updated_at: number;
};

/**
 * @see https://openid.net/specs/openid-connect-core-1_0.html#AddressClaim
 */
type OpenIDAddressClaim = {
  /**
   * Full mailing address, formatted for display or use on a mailing label.
   * This field MAY contain multiple lines, separated by newlines.
   * Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
   */
  formatted: string;
  /**
   * Full street address component, which MAY include house number, street name, Post Office Box, and multi-line extended street address information.
   * This field MAY contain multiple lines, separated by newlines.
   * Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
   */
  street_address: string;
  /** City or locality component. */
  locality: string;
  /** State, province, prefecture, or region component. */
  region: string;
  /** Zip code or postal code component. */
  postal_code: string;
  /** Country name component. */
  country: string;
}

/**
 * @see https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse
 */
export type OpenIDUserInfoSuccessResponse = {
  sub: string;
} & Partial<OpenIDStandardClaims>;
