# EmailEngine API

EmailEngine provides a RESTful API for managing email accounts, sending messages, and processing email data across multiple providers.

<h3>Authentication</h3>
All API requests require authentication using an Access Token. You can generate and manage your tokens from the <a href="/admin/tokens" target="_parent"><strong>Access Tokens</strong></a> page.

Include your token in requests using one of these methods:

- Query parameter: <code>?access_token=YOUR_TOKEN</code>
- Authorization header: <code>Authorization: Bearer YOUR_TOKEN</code>

<h3>Request Processing</h3>

<strong>Sequential Processing:</strong> Requests to the same email account are processed sequentially to maintain data consistency. Multiple simultaneous requests will be queued.

<strong>Timeouts:</strong> Long-running operations may cause queued requests to timeout. Configure appropriate timeout values using the <code>X-EE-Timeout</code> header (in milliseconds).

<h3>Getting Started</h3>
1. <a href="/admin/tokens" target="_parent">Generate an Access Token</a>
2. <a href="/admin/accounts" target="_parent">Add an email account</a>
3. Start making API requests using the endpoints below

## Version: 2.53.3

**Contact information:**  
EmailEngine Support  
https://emailengine.app/support  
support@emailengine.app

**License:** [EmailEngine License](https://emailengine.dev/LICENSE_EMAILENGINE.txt)

[EmailEngine Documentation](https://emailengine.app/)

### Security

**bearerAuth**

| apiKey      | _API Key_                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Name        | access_token                                                                                                                                   |
| In          | query                                                                                                                                          |
| Description | Access token for API authentication. Can be provided as a query parameter (?access_token=TOKEN) or in the Authorization header (Bearer TOKEN). |

### /v1/accounts

#### GET

##### Summary:

List accounts

##### Description:

Lists registered accounts

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| page         | query      | Page number (zero indexed, so use 0 for first page)                              | No       | integer |
| pageSize     | query      | How many entries per page                                                        | No       | integer |
| state        | query      | Filter accounts by state                                                         | No       | string  |
| query        | query      | Filter accounts by string match                                                  | No       | string  |

##### Responses

| Code | Description | Schema                                            |
| ---- | ----------- | ------------------------------------------------- |
| 200  | Successful  | [AccountsFilterResponse](#AccountsFilterResponse) |

### /v1/autoconfig

#### GET

##### Summary:

Discover Email settings

##### Description:

Try to discover IMAP and SMTP settings for an email account

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| email        | query      | Email address to discover email settings for                                     | Yes      | string  |

##### Responses

| Code | Description | Schema                                              |
| ---- | ----------- | --------------------------------------------------- |
| 200  | Successful  | [DiscoveredEmailSettings](#DiscoveredEmailSettings) |

### /v1/blocklists

#### GET

##### Summary:

List blocklists

##### Description:

List blocklists with blocked addresses

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| page         | query      | Page number (zero indexed, so use 0 for first page)                              | No       | integer |
| pageSize     | query      | How many entries per page                                                        | No       | integer |

##### Responses

| Code | Description | Schema                                    |
| ---- | ----------- | ----------------------------------------- |
| 200  | Successful  | [BlocklistsResponse](#BlocklistsResponse) |

### /v1/changes

#### GET

##### Summary:

Stream state changes

##### Description:

Stream account state changes as an EventSource

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |

##### Responses

| Code    | Description | Schema |
| ------- | ----------- | ------ |
| default | Successful  | string |

### /v1/gateways

#### GET

##### Summary:

List gateways

##### Description:

Lists registered gateways

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| page         | query      | Page number (zero indexed, so use 0 for first page)                              | No       | integer |
| pageSize     | query      | How many entries per page                                                        | No       | integer |

##### Responses

| Code | Description | Schema                                            |
| ---- | ----------- | ------------------------------------------------- |
| 200  | Successful  | [GatewaysFilterResponse](#GatewaysFilterResponse) |

### /v1/license

#### GET

##### Summary:

Request license info

##### Description:

Get active license information

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |

##### Responses

| Code | Description | Schema                              |
| ---- | ----------- | ----------------------------------- |
| 200  | Successful  | [LicenseResponse](#LicenseResponse) |

#### POST

##### Summary:

Register a license

##### Description:

Set up a license for EmailEngine to unlock all features

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                              |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                             |
| body         | body       |                                                                                  | No       | [RegisterLicense](#RegisterLicense) |

##### Responses

| Code | Description | Schema                              |
| ---- | ----------- | ----------------------------------- |
| 200  | Successful  | [LicenseResponse](#LicenseResponse) |

#### DELETE

##### Summary:

Remove license

##### Description:

Remove registered active license

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |

##### Responses

| Code | Description | Schema                                        |
| ---- | ----------- | --------------------------------------------- |
| 200  | Successful  | [EmptyLicenseResponse](#EmptyLicenseResponse) |

### /v1/oauth2

#### GET

##### Summary:

List OAuth2 applications

##### Description:

Lists registered OAuth2 applications

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| page         | query      | Page number (zero indexed, so use 0 for first page)                              | No       | integer |
| pageSize     | query      | How many entries per page                                                        | No       | integer |

##### Responses

| Code | Description | Schema                                        |
| ---- | ----------- | --------------------------------------------- |
| 200  | Successful  | [OAuth2FilterResponse](#OAuth2FilterResponse) |

#### POST

##### Summary:

Register OAuth2 application

##### Description:

Registers a new OAuth2 application for a specific provider

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                              |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                             |
| body         | body       |                                                                                  | No       | [CreateOAuth2App](#CreateOAuth2App) |

##### Responses

| Code | Description | Schema                                  |
| ---- | ----------- | --------------------------------------- |
| 200  | Successful  | [CreateAppResponse](#CreateAppResponse) |

### /v1/outbox

#### GET

##### Summary:

List queued messages

##### Description:

Lists messages in the Outbox

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| page         | query      | Page number (zero indexed, so use 0 for first page)                              | No       | integer |
| pageSize     | query      | How many entries per page                                                        | No       | integer |

##### Responses

| Code | Description | Schema                                    |
| ---- | ----------- | ----------------------------------------- |
| 200  | Successful  | [OutboxListResponse](#OutboxListResponse) |

### /v1/settings

#### GET

##### Summary:

List specific settings

##### Description:

List setting values for specific keys

##### Parameters

| Name                              | Located in | Description                                                                      | Required | Schema  |
| --------------------------------- | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout                      | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| eventTypes                        | query      |                                                                                  | No       | boolean |
| webhooksEnabled                   | query      |                                                                                  | No       | boolean |
| webhooks                          | query      |                                                                                  | No       | boolean |
| webhookEvents                     | query      |                                                                                  | No       | boolean |
| webhooksCustomHeaders             | query      |                                                                                  | No       | boolean |
| notifyHeaders                     | query      |                                                                                  | No       | boolean |
| serviceUrl                        | query      |                                                                                  | No       | boolean |
| notificationBaseUrl               | query      |                                                                                  | No       | boolean |
| trackSentMessages                 | query      |                                                                                  | No       | boolean |
| trackClicks                       | query      |                                                                                  | No       | boolean |
| trackOpens                        | query      |                                                                                  | No       | boolean |
| imapIndexer                       | query      |                                                                                  | No       | boolean |
| resolveGmailCategories            | query      |                                                                                  | No       | boolean |
| ignoreMailCertErrors              | query      |                                                                                  | No       | boolean |
| generateEmailSummary              | query      |                                                                                  | No       | boolean |
| generateRiskAssessment            | query      |                                                                                  | No       | boolean |
| openAiAPIKey                      | query      |                                                                                  | No       | boolean |
| openAiModel                       | query      |                                                                                  | No       | boolean |
| openAiAPIUrl                      | query      |                                                                                  | No       | boolean |
| documentStoreChatModel            | query      |                                                                                  | No       | boolean |
| openAiTemperature                 | query      |                                                                                  | No       | boolean |
| openAiTopP                        | query      |                                                                                  | No       | boolean |
| openAiPrompt                      | query      |                                                                                  | No       | boolean |
| openAiGenerateEmbeddings          | query      |                                                                                  | No       | boolean |
| inboxNewOnly                      | query      |                                                                                  | No       | boolean |
| serviceSecret                     | query      |                                                                                  | No       | boolean |
| authServer                        | query      |                                                                                  | No       | boolean |
| proxyEnabled                      | query      |                                                                                  | No       | boolean |
| proxyUrl                          | query      |                                                                                  | No       | boolean |
| smtpEhloName                      | query      |                                                                                  | No       | boolean |
| notifyText                        | query      |                                                                                  | No       | boolean |
| notifyWebSafeHtml                 | query      |                                                                                  | No       | boolean |
| notifyTextSize                    | query      |                                                                                  | No       | boolean |
| notifyAttachments                 | query      |                                                                                  | No       | boolean |
| notifyAttachmentSize              | query      |                                                                                  | No       | boolean |
| notifyCalendarEvents              | query      |                                                                                  | No       | boolean |
| gmailEnabled                      | query      |                                                                                  | No       | boolean |
| gmailClientId                     | query      |                                                                                  | No       | boolean |
| gmailClientSecret                 | query      |                                                                                  | No       | boolean |
| gmailRedirectUrl                  | query      |                                                                                  | No       | boolean |
| gmailExtraScopes                  | query      |                                                                                  | No       | boolean |
| outlookEnabled                    | query      |                                                                                  | No       | boolean |
| outlookClientId                   | query      |                                                                                  | No       | boolean |
| outlookClientSecret               | query      |                                                                                  | No       | boolean |
| outlookRedirectUrl                | query      |                                                                                  | No       | boolean |
| outlookAuthority                  | query      |                                                                                  | No       | boolean |
| outlookExtraScopes                | query      |                                                                                  | No       | boolean |
| mailRuEnabled                     | query      |                                                                                  | No       | boolean |
| mailRuClientId                    | query      |                                                                                  | No       | boolean |
| mailRuClientSecret                | query      |                                                                                  | No       | boolean |
| mailRuRedirectUrl                 | query      |                                                                                  | No       | boolean |
| mailRuExtraScopes                 | query      |                                                                                  | No       | boolean |
| serviceClient                     | query      |                                                                                  | No       | boolean |
| serviceKey                        | query      |                                                                                  | No       | boolean |
| serviceExtraScopes                | query      |                                                                                  | No       | boolean |
| documentStoreEnabled              | query      |                                                                                  | No       | boolean |
| documentStoreUrl                  | query      |                                                                                  | No       | boolean |
| documentStoreIndex                | query      |                                                                                  | No       | boolean |
| documentStoreAuthEnabled          | query      |                                                                                  | No       | boolean |
| documentStoreUsername             | query      |                                                                                  | No       | boolean |
| documentStorePassword             | query      |                                                                                  | No       | boolean |
| documentStoreGenerateEmbeddings   | query      |                                                                                  | No       | boolean |
| documentStorePreProcessingEnabled | query      |                                                                                  | No       | boolean |
| logs                              | query      |                                                                                  | No       | boolean |
| imapStrategy                      | query      |                                                                                  | No       | boolean |
| smtpStrategy                      | query      |                                                                                  | No       | boolean |
| localAddresses                    | query      |                                                                                  | No       | boolean |
| smtpServerEnabled                 | query      |                                                                                  | No       | boolean |
| smtpServerPort                    | query      |                                                                                  | No       | boolean |
| smtpServerHost                    | query      |                                                                                  | No       | boolean |
| smtpServerProxy                   | query      |                                                                                  | No       | boolean |
| smtpServerAuthEnabled             | query      |                                                                                  | No       | boolean |
| smtpServerPassword                | query      |                                                                                  | No       | boolean |
| smtpServerTLSEnabled              | query      |                                                                                  | No       | boolean |
| imapProxyServerEnabled            | query      |                                                                                  | No       | boolean |
| imapProxyServerPort               | query      |                                                                                  | No       | boolean |
| imapProxyServerHost               | query      |                                                                                  | No       | boolean |
| imapProxyServerProxy              | query      |                                                                                  | No       | boolean |
| imapProxyServerPassword           | query      |                                                                                  | No       | boolean |
| imapProxyServerTLSEnabled         | query      |                                                                                  | No       | boolean |
| queueKeep                         | query      |                                                                                  | No       | boolean |
| deliveryAttempts                  | query      |                                                                                  | No       | boolean |
| templateHeader                    | query      |                                                                                  | No       | boolean |
| templateHtmlHead                  | query      |                                                                                  | No       | boolean |
| scriptEnv                         | query      |                                                                                  | No       | boolean |
| enableApiProxy                    | query      |                                                                                  | No       | boolean |
| locale                            | query      |                                                                                  | No       | boolean |
| timezone                          | query      |                                                                                  | No       | boolean |
| pageBrandName                     | query      |                                                                                  | No       | boolean |
| openAiPreProcessingFn             | query      |                                                                                  | No       | boolean |
| imapClientName                    | query      |                                                                                  | No       | boolean |
| imapClientVersion                 | query      |                                                                                  | No       | boolean |
| imapClientVendor                  | query      |                                                                                  | No       | boolean |
| imapClientSupportUrl              | query      |                                                                                  | No       | boolean |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [SettingsQueryResponse](#SettingsQueryResponse) |

#### POST

##### Summary:

Set setting values

##### Description:

Set setting values for specific keys

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | --------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer               |
| body         | body       |                                                                                  | No       | [Settings](#Settings) |

##### Responses

| Code | Description | Schema                                              |
| ---- | ----------- | --------------------------------------------------- |
| 200  | Successful  | [SettingsUpdatedResponse](#SettingsUpdatedResponse) |

### /v1/stats

#### GET

##### Summary:

Return server stats

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| seconds      | query      | Duration for counters                                                            | No       | integer |

##### Responses

| Code | Description | Schema                                |
| ---- | ----------- | ------------------------------------- |
| 200  | Successful  | [SettingsResponse](#SettingsResponse) |

### /v1/templates

#### GET

##### Summary:

List account templates

##### Description:

Lists stored templates for the account

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | query      | Account ID to list the templates for                                             | No       | string  |
| page         | query      | Page number (zero indexed, so use 0 for first page)                              | No       | integer |
| pageSize     | query      | How many entries per page                                                        | No       | integer |

##### Responses

| Code | Description | Schema                                                |
| ---- | ----------- | ----------------------------------------------------- |
| 200  | Successful  | [AccountTemplatesResponse](#AccountTemplatesResponse) |

### /v1/tokens

#### GET

##### Summary:

List root tokens

##### Description:

Lists access tokens registered for root access

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |

##### Responses

| Code | Description | Schema                                    |
| ---- | ----------- | ----------------------------------------- |
| 200  | Successful  | [RootTokensResponse](#RootTokensResponse) |

### /v1/webhookRoutes

#### GET

##### Summary:

List webhook routes

##### Description:

List custom webhook routes

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| page         | query      | Page number (zero indexed, so use 0 for first page)                              | No       | integer |
| pageSize     | query      | How many entries per page                                                        | No       | integer |

##### Responses

| Code | Description | Schema                                                  |
| ---- | ----------- | ------------------------------------------------------- |
| 200  | Successful  | [WebhookRoutesListResponse](#WebhookRoutesListResponse) |

### /v1/account/{account}

#### GET

##### Summary:

Get account info

##### Description:

Returns stored information about the account. Passwords are not included.

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |
| quota        | query      | If true, then include quota information in the response                          | No       | boolean |

##### Responses

| Code | Description | Schema                              |
| ---- | ----------- | ----------------------------------- |
| 200  | Successful  | [AccountResponse](#AccountResponse) |

#### DELETE

##### Summary:

Remove account

##### Description:

Stop processing and clear the account's cache

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [DeleteRequestResponse](#DeleteRequestResponse) |

#### PUT

##### Summary:

Update account info

##### Description:

Updates account information

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                          |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                          |
| body         | body       |                                                                                  | No       | [UpdateAccount](#UpdateAccount) |

##### Responses

| Code | Description | Schema              |
| ---- | ----------- | ------------------- |
| 200  | Successful  | [Model18](#Model18) |

### /v1/blocklist/{listId}

#### GET

##### Summary:

List blocklist entries

##### Description:

List blocked addresses for a list

##### Parameters

| Name         | Located in | Description                                                                                                     | Required | Schema  |
| ------------ | ---------- | --------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)                                | No       | integer |
| listId       | path       | List ID. Must use a subdomain name format. Lists are registered ad-hoc, so a new identifier defines a new list. | Yes      | string  |
| page         | query      | Page number (zero indexed, so use 0 for first page)                                                             | No       | integer |
| pageSize     | query      | How many entries per page                                                                                       | No       | integer |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [BlocklistListResponse](#BlocklistListResponse) |

#### POST

##### Summary:

Add to blocklist

##### Description:

Add an email address to a blocklist

##### Parameters

| Name         | Located in | Description                                                                                                     | Required | Schema                                              |
| ------------ | ---------- | --------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)                                | No       | integer                                             |
| listId       | path       | List ID. Must use a subdomain name format. Lists are registered ad-hoc, so a new identifier defines a new list. | Yes      | string                                              |
| body         | body       |                                                                                                                 | No       | [BlocklistListAddPayload](#BlocklistListAddPayload) |

##### Responses

| Code | Description | Schema                                                |
| ---- | ----------- | ----------------------------------------------------- |
| 200  | Successful  | [BlocklistListAddResponse](#BlocklistListAddResponse) |

#### DELETE

##### Summary:

Remove from blocklist

##### Description:

Delete a blocked email address from a list

##### Parameters

| Name         | Located in | Description                                                                                                     | Required | Schema  |
| ------------ | ---------- | --------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)                                | No       | integer |
| listId       | path       | List ID. Must use a subdomain name format. Lists are registered ad-hoc, so a new identifier defines a new list. | Yes      | string  |
| recipient    | query      | Email address to remove from the list                                                                           | Yes      | string  |

##### Responses

| Code | Description | Schema                                              |
| ---- | ----------- | --------------------------------------------------- |
| 200  | Successful  | [DeleteBlocklistResponse](#DeleteBlocklistResponse) |

### /v1/gateway/{gateway}

#### GET

##### Summary:

Get gateway info

##### Description:

Returns stored information about the gateway. Passwords are not included.

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| gateway      | path       | Gateway ID                                                                       | Yes      | string  |

##### Responses

| Code | Description | Schema                              |
| ---- | ----------- | ----------------------------------- |
| 200  | Successful  | [GatewayResponse](#GatewayResponse) |

#### DELETE

##### Summary:

Remove SMTP gateway

##### Description:

Delete SMTP gateway data

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| gateway      | path       | Gateway ID                                                                       | Yes      | string  |

##### Responses

| Code | Description | Schema              |
| ---- | ----------- | ------------------- |
| 200  | Successful  | [Model13](#Model13) |

### /v1/logs/{account}

#### GET

##### Summary:

Return IMAP logs for an account

##### Description:

Output is a downloadable text file

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |

##### Responses

| Code    | Description | Schema |
| ------- | ----------- | ------ |
| default | Successful  | string |

### /v1/oauth2/{app}

#### GET

##### Summary:

Get application info

##### Description:

Returns stored information about an OAuth2 application. Secrets are not included.

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| app          | path       | OAuth2 application ID                                                            | Yes      | string  |

##### Responses

| Code | Description | Schema                                      |
| ---- | ----------- | ------------------------------------------- |
| 200  | Successful  | [ApplicationResponse](#ApplicationResponse) |

#### DELETE

##### Summary:

Remove OAuth2 application

##### Description:

Delete OAuth2 application data

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| app          | path       | OAuth2 application ID                                                            | Yes      | string  |

##### Responses

| Code | Description | Schema                                                |
| ---- | ----------- | ----------------------------------------------------- |
| 200  | Successful  | [DeleteAppRequestResponse](#DeleteAppRequestResponse) |

#### PUT

##### Summary:

Update OAuth2 application

##### Description:

Updates OAuth2 application information

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                            |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | --------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                           |
| app          | path       | OAuth2 application ID                                                            | Yes      | string                            |
| body         | body       |                                                                                  | No       | [UpdateOAuthApp](#UpdateOAuthApp) |

##### Responses

| Code | Description | Schema                                            |
| ---- | ----------- | ------------------------------------------------- |
| 200  | Successful  | [UpdateOAuthAppResponse](#UpdateOAuthAppResponse) |

### /v1/outbox/{queueId}

#### GET

##### Summary:

Get queued message

##### Description:

Gets a queued message in the Outbox

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| queueId      | path       | Queue identifier for scheduled email                                             | Yes      | string  |

##### Responses

| Code | Description | Schema                      |
| ---- | ----------- | --------------------------- |
| 200  | Successful  | [OutboxEntry](#OutboxEntry) |

#### DELETE

##### Summary:

Remove a message

##### Description:

Remove a message from the outbox

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| queueId      | path       | Queue identifier for scheduled email                                             | Yes      | string  |

##### Responses

| Code | Description | Schema                                                  |
| ---- | ----------- | ------------------------------------------------------- |
| 200  | Successful  | [DeleteOutboxEntryResponse](#DeleteOutboxEntryResponse) |

### /v1/account/{account}/server-signatures

#### GET

##### Summary:

List Account Signatures

##### Description:

Returns signatures associated with the account. Currently only Gmail is supported, and only "new message" signatures from the "sendAs" list are returned.

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |

##### Responses

| Code | Description | Schema                                        |
| ---- | ----------- | --------------------------------------------- |
| 200  | Successful  | [AccountTokenResponse](#AccountTokenResponse) |

### /v1/account/{account}/messages

#### GET

##### Summary:

List messages in a folder

##### Description:

Lists messages in a mailbox folder

##### Parameters

| Name         | Located in | Description                                                                                                                                                                                                        | Required | Schema  |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)                                                                                                                                   | No       | integer |
| account      | path       | Unique identifier for the email account                                                                                                                                                                            | Yes      | string  |
| path         | query      | Mailbox folder path. Can use special use labels like "\Sent". Special value "\All" is available for Gmail IMAP, Gmail API, MS Graph API accounts.                                                                  | Yes      | string  |
| cursor       | query      | Paging cursor from `nextPageCursor` or `prevPageCursor` value                                                                                                                                                      | No       | string  |
| page         | query      | Page number (zero-indexed, so use 0 for the first page). Only supported for IMAP accounts. Deprecated; use the paging cursor instead. If the page cursor value is provided, then the page number value is ignored. | No       | integer |
| pageSize     | query      | How many entries per page                                                                                                                                                                                          | No       | integer |

##### Responses

| Code | Description | Schema                      |
| ---- | ----------- | --------------------------- |
| 200  | Successful  | [MessageList](#MessageList) |

#### PUT

##### Summary:

Update messages

##### Description:

Update message information for matching emails

##### Parameters

| Name         | Located in | Description                                                                                                                                       | Required | Schema                                          |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)                                                                  | No       | integer                                         |
| account      | path       | Unique identifier for the email account                                                                                                           | Yes      | string                                          |
| path         | query      | Mailbox folder path. Can use special use labels like "\Sent". Special value "\All" is available for Gmail IMAP, Gmail API, MS Graph API accounts. | Yes      | string                                          |
| body         | body       |                                                                                                                                                   | No       | [MessagesUpdateRequest](#MessagesUpdateRequest) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [MessageUpdateResponse](#MessageUpdateResponse) |

### /v1/account/{account}/mailboxes

#### GET

##### Summary:

List mailboxes

##### Description:

Lists all available mailboxes

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |
| counters     | query      | If true, then includes message counters in the response                          | No       | boolean |

##### Responses

| Code | Description | Schema                                              |
| ---- | ----------- | --------------------------------------------------- |
| 200  | Successful  | [MailboxesFilterResponse](#MailboxesFilterResponse) |

### /v1/account/{account}/oauth-token

#### GET

##### Summary:

Get OAuth2 access token

##### Description:

Get the active OAuth2 access token for an account. NB! This endpoint is disabled by default and needs activation on the Service configuration page.

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |

##### Responses

| Code | Description | Schema            |
| ---- | ----------- | ----------------- |
| 200  | Successful  | [Model2](#Model2) |

### /v1/delivery-test/check/{deliveryTest}

#### GET

##### Summary:

Check test status

##### Description:

Check delivery test status

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| deliveryTest | path       | Test ID                                                                          | Yes      | string  |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [DeliveryCheckResponse](#DeliveryCheckResponse) |

### /v1/settings/queue/{queue}

#### GET

##### Summary:

Show queue information

##### Description:

Show queue status and current state

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| queue        | path       | Queue ID                                                                         | Yes      | string  |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [SettingsQueueResponse](#SettingsQueueResponse) |

#### PUT

##### Summary:

Set queue settings

##### Description:

Set queue settings

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                                              |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                                             |
| queue        | path       | Queue ID                                                                         | Yes      | string                                              |
| body         | body       |                                                                                  | No       | [SettingsPutQueuePayload](#SettingsPutQueuePayload) |

##### Responses

| Code | Description | Schema                                                |
| ---- | ----------- | ----------------------------------------------------- |
| 200  | Successful  | [SettingsPutQueueResponse](#SettingsPutQueueResponse) |

### /v1/templates/template/{template}

#### GET

##### Summary:

Get template information

##### Description:

Retrieve template content and information

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| template     | path       | Template ID                                                                      | Yes      | string  |

##### Responses

| Code | Description | Schema                                              |
| ---- | ----------- | --------------------------------------------------- |
| 200  | Successful  | [AccountTemplateResponse](#AccountTemplateResponse) |

#### DELETE

##### Summary:

Remove a template

##### Description:

Delete a stored template

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| template     | path       | Template ID                                                                      | Yes      | string  |

##### Responses

| Code | Description | Schema              |
| ---- | ----------- | ------------------- |
| 200  | Successful  | [Model14](#Model14) |

#### PUT

##### Summary:

Update a template

##### Description:

Update a stored template.

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                            |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | --------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                           |
| template     | path       | Template ID                                                                      | Yes      | string                            |
| body         | body       |                                                                                  | No       | [UpdateTemplate](#UpdateTemplate) |

##### Responses

| Code | Description | Schema                                            |
| ---- | ----------- | ------------------------------------------------- |
| 200  | Successful  | [UpdateTemplateResponse](#UpdateTemplateResponse) |

### /v1/tokens/account/{account}

#### GET

##### Summary:

List account tokens

##### Description:

Lists access tokens registered for an account

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |

##### Responses

| Code | Description | Schema                                            |
| ---- | ----------- | ------------------------------------------------- |
| 200  | Successful  | [AccountsTokensResponse](#AccountsTokensResponse) |

### /v1/webhookRoutes/webhookRoute/{webhookRoute}

#### GET

##### Summary:

Get webhook route information

##### Description:

Retrieve webhook route content and information

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| webhookRoute | path       | Webhook ID                                                                       | Yes      | string  |

##### Responses

| Code | Description | Schema                                        |
| ---- | ----------- | --------------------------------------------- |
| 200  | Successful  | [WebhookRouteResponse](#WebhookRouteResponse) |

### /v1/account/{account}/message/{message}

#### GET

##### Summary:

Get message information

##### Description:

Returns details of a specific message. By default text content is not included, use textType value to force retrieving text

##### Parameters

| Name                | Located in | Description                                                                                                                             | Required | Schema  |
| ------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout        | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)                                                        | No       | integer |
| account             | path       | Unique identifier for the email account                                                                                                 | Yes      | string  |
| message             | path       | Message ID                                                                                                                              | Yes      | string  |
| maxBytes            | query      | Max length of text content                                                                                                              | No       | integer |
| textType            | query      | Which text content to return, use \* for all. By default text content is not returned.                                                  | No       | string  |
| webSafeHtml         | query      | Shorthand option to fetch and preprocess HTML and inlined images. Overrides `textType`, `preProcessHtml`, and `preProcessHtml` options. | No       | boolean |
| embedAttachedImages | query      | If true, then fetches attached images and embeds these in the HTML as data URIs                                                         | No       | boolean |
| preProcessHtml      | query      | If true, then pre-processes HTML for compatibility                                                                                      | No       | boolean |
| markAsSeen          | query      | If true, then marks unseen email as seen while returning the message                                                                    | No       | boolean |

##### Responses

| Code | Description | Schema                            |
| ---- | ----------- | --------------------------------- |
| 200  | Successful  | [MessageDetails](#MessageDetails) |

#### DELETE

##### Summary:

Delete message

##### Description:

Move message to Trash or delete it if already in Trash

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |
| message      | path       | Message ID                                                                       | Yes      | string  |
| force        | query      | Delete message even if not in Trash. Not supported for Gmail API accounts.       | No       | boolean |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [MessageDeleteResponse](#MessageDeleteResponse) |

#### PUT

##### Summary:

Update message

##### Description:

Update message information. Mainly this means changing message flag values

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                          |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                          |
| message      | path       | Message ID                                                                       | Yes      | string                          |
| body         | body       |                                                                                  | No       | [MessageUpdate](#MessageUpdate) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [MessageUpdateResponse](#MessageUpdateResponse) |

### /v1/account/{account}/attachment/{attachment}

#### GET

##### Summary:

Download attachment

##### Description:

Fetches attachment file as a binary stream

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |
| attachment   | path       | Attachment ID                                                                    | Yes      | string  |

##### Responses

| Code    | Description | Schema |
| ------- | ----------- | ------ |
| default | Successful  | string |

### /v1/account/{account}/text/{text}

#### GET

##### Summary:

Retrieve message text

##### Description:

Retrieves message text

##### Parameters

| Name         | Located in | Description                                                                         | Required | Schema  |
| ------------ | ---------- | ----------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)    | No       | integer |
| account      | path       | Unique identifier for the email account                                             | Yes      | string  |
| text         | path       | Message text ID                                                                     | Yes      | string  |
| maxBytes     | query      | Max length of text content                                                          | No       | integer |
| textType     | query      | Which text content to return, use \* for all. By default all contents are returned. | No       | string  |

##### Responses

| Code | Description | Schema                        |
| ---- | ----------- | ----------------------------- |
| 200  | Successful  | [TextResponse](#TextResponse) |

### /v1/account/{account}/message/{message}/source

#### GET

##### Summary:

Download raw message

##### Description:

Fetches raw message as a stream

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |
| message      | path       | Message ID                                                                       | Yes      | string  |

##### Responses

| Code    | Description | Schema |
| ------- | ----------- | ------ |
| default | Successful  | string |

### /v1/account

#### POST

##### Summary:

Register new account

##### Description:

Registers new IMAP account to be synced

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                          |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| body         | body       |                                                                                  | No       | [CreateAccount](#CreateAccount) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [CreateAccountResponse](#CreateAccountResponse) |

### /v1/gateway

#### POST

##### Summary:

Register new gateway

##### Description:

Registers a new SMP gateway

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                          |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| body         | body       |                                                                                  | No       | [CreateGateway](#CreateGateway) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [CreateGatewayResponse](#CreateGatewayResponse) |

### /v1/token

#### POST

##### Summary:

Provision an access token

##### Description:

Provisions a new access token for an account

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                      |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | --------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                     |
| body         | body       |                                                                                  | No       | [CreateToken](#CreateToken) |

##### Responses

| Code | Description | Schema                                      |
| ---- | ----------- | ------------------------------------------- |
| 200  | Successful  | [CreateTokenResponse](#CreateTokenResponse) |

### /v1/verifyAccount

#### POST

##### Summary:

Verify IMAP and SMTP settings

##### Description:

Checks if can connect and authenticate using provided account info

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                          |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| body         | body       |                                                                                  | No       | [VerifyAccount](#VerifyAccount) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [VerifyAccountResponse](#VerifyAccountResponse) |

### /v1/authentication/form

#### POST

##### Summary:

Generate authentication link

##### Description:

Generates a redirect link to the hosted authentication form

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                              |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                             |
| body         | body       |                                                                                  | No       | [RequestAuthForm](#RequestAuthForm) |

##### Responses

| Code | Description | Schema                                              |
| ---- | ----------- | --------------------------------------------------- |
| 200  | Successful  | [RequestAuthFormResponse](#RequestAuthFormResponse) |

### /v1/templates/template

#### POST

##### Summary:

Create template

##### Description:

Create a new stored template. Templates can be used when sending emails as the content of the message.

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                            |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | --------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                           |
| body         | body       |                                                                                  | No       | [CreateTemplate](#CreateTemplate) |

##### Responses

| Code | Description | Schema                                            |
| ---- | ----------- | ------------------------------------------------- |
| 200  | Successful  | [CreateTemplateResponse](#CreateTemplateResponse) |

### /v1/account/{account}/message

#### POST

##### Summary:

Upload message

##### Description:

Upload a message structure, compile it into an EML file and store it into selected mailbox.

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                          |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                          |
| body         | body       |                                                                                  | No       | [MessageUpload](#MessageUpload) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [MessageUploadResponse](#MessageUploadResponse) |

### /v1/account/{account}/mailbox

#### POST

##### Summary:

Create mailbox

##### Description:

Create new mailbox folder

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                          |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                          |
| body         | body       |                                                                                  | No       | [CreateMailbox](#CreateMailbox) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [CreateMailboxResponse](#CreateMailboxResponse) |

#### DELETE

##### Summary:

Delete mailbox

##### Description:

Delete existing mailbox folder

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |
| path         | query      | Mailbox folder path to delete                                                    | Yes      | string  |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [DeleteMailboxResponse](#DeleteMailboxResponse) |

#### PUT

##### Summary:

Rename mailbox

##### Description:

Rename an existing mailbox folder

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                          |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                          |
| body         | body       |                                                                                  | No       | [RenameMailbox](#RenameMailbox) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [RenameMailboxResponse](#RenameMailboxResponse) |

### /v1/account/{account}/search

#### POST

##### Summary:

Search for messages

##### Description:

Filter messages from a mailbox folder by search options. Search is performed against a specific folder and not for the entire account.

##### Parameters

| Name             | Located in | Description                                                                                                                                                                                                                                                                                                                                                                                                            | Required | Schema            |
| ---------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------- |
| x-ee-timeout     | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)                                                                                                                                                                                                                                                                                                                                       | No       | integer           |
| account          | path       | Unique identifier for the email account                                                                                                                                                                                                                                                                                                                                                                                | Yes      | string            |
| path             | query      | Mailbox folder path. Can use special use labels like "\Sent". Special value "\All" is available for Gmail IMAP, Gmail API, MS Graph API accounts.                                                                                                                                                                                                                                                                      | No       | string            |
| cursor           | query      | Paging cursor from `nextPageCursor` or `prevPageCursor` value                                                                                                                                                                                                                                                                                                                                                          | No       | string            |
| page             | query      | Page number (zero-indexed, so use 0 for the first page). Only supported for IMAP accounts. Deprecated; use the paging cursor instead. If the page cursor value is provided, then the page number value is ignored.                                                                                                                                                                                                     | No       | integer           |
| pageSize         | query      | How many entries per page                                                                                                                                                                                                                                                                                                                                                                                              | No       | integer           |
| useOutlookSearch | query      | MS Graph only. If enabled, uses the $search parameter for MS Graph search queries instead of $filter. This allows searching the "to", "cc", "bcc", "larger", "smaller", "body", "before", "sentBefore", "since", and the "sentSince" fields. Note that $search returns up to 1,000 results, does not indicate the total number of matching results or pages, and returns results sorted by relevance rather than date. | No       | boolean           |
| body             | body       |                                                                                                                                                                                                                                                                                                                                                                                                                        | No       | [Model9](#Model9) |

##### Responses

| Code | Description | Schema                      |
| ---- | ----------- | --------------------------- |
| 200  | Successful  | [MessageList](#MessageList) |

### /v1/account/{account}/submit

#### POST

##### Summary:

Submit message for delivery

##### Description:

Submit message for delivery. If reference message ID is provided then EmailEngine adds all headers and flags required for a reply/forward automatically.

##### Parameters

| Name            | Located in | Description                                                                      | Required | Schema                          |
| --------------- | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout    | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| idempotency-key | header     | Unique key to prevent duplicate processing of the same request                   | No       | string                          |
| account         | path       | Unique identifier for the email account                                          | Yes      | string                          |
| body            | body       |                                                                                  | No       | [SubmitMessage](#SubmitMessage) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [SubmitMessageResponse](#SubmitMessageResponse) |

### /v1/delivery-test/account/{account}

#### POST

##### Summary:

Create delivery test

##### Description:

Initiate a delivery test

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                                        |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                                       |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                                        |
| body         | body       |                                                                                  | No       | [DeliveryStartRequest](#DeliveryStartRequest) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [DeliveryStartResponse](#DeliveryStartResponse) |

### /v1/token/{token}

#### DELETE

##### Summary:

Remove a token

##### Description:

Delete an access token

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| token        | path       | Access token                                                                     | Yes      | string  |

##### Responses

| Code | Description | Schema                                                    |
| ---- | ----------- | --------------------------------------------------------- |
| 200  | Successful  | [DeleteTokenRequestResponse](#DeleteTokenRequestResponse) |

### /v1/templates/account/{account}

#### DELETE

##### Summary:

Flush templates

##### Description:

Delete all stored templates for an account

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema  |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer |
| account      | path       | Unique identifier for the email account                                          | Yes      | string  |
| force        | query      | Must be true in order to flush templates                                         | No       | boolean |

##### Responses

| Code | Description | Schema                                                          |
| ---- | ----------- | --------------------------------------------------------------- |
| 200  | Successful  | [DeleteTemplateRequestResponse](#DeleteTemplateRequestResponse) |

### /v1/account/{account}/sync

#### PUT

##### Summary:

Request syncing

##### Description:

Immediately trigger account syncing for IMAP accounts

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                      |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | --------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                     |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                      |
| body         | body       |                                                                                  | No       | [RequestSync](#RequestSync) |

##### Responses

| Code | Description | Schema                                      |
| ---- | ----------- | ------------------------------------------- |
| 200  | Successful  | [RequestSyncResponse](#RequestSyncResponse) |

### /v1/account/{account}/reconnect

#### PUT

##### Summary:

Request reconnect

##### Description:

Requests connection to be reconnected

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                                |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                               |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                                |
| body         | body       |                                                                                  | No       | [RequestReconnect](#RequestReconnect) |

##### Responses

| Code | Description | Schema                                                |
| ---- | ----------- | ----------------------------------------------------- |
| 200  | Successful  | [RequestReconnectResponse](#RequestReconnectResponse) |

### /v1/account/{account}/flush

#### PUT

##### Summary:

Request account flush

##### Description:

Deletes all email indexes from Redis and ElasticSearch and re-creates the index for that account. You can only run a single flush operation at a time, so you must wait until the previous flush has finished before initiating a new one.

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                        |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ----------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                       |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                        |
| body         | body       |                                                                                  | No       | [RequestFlush](#RequestFlush) |

##### Responses

| Code | Description | Schema                                        |
| ---- | ----------- | --------------------------------------------- |
| 200  | Successful  | [RequestFlushResponse](#RequestFlushResponse) |

### /v1/gateway/edit/{gateway}

#### PUT

##### Summary:

Update gateway info

##### Description:

Updates gateway information

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                          |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | ------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                         |
| gateway      | path       | Gateway ID                                                                       | Yes      | string                          |
| body         | body       |                                                                                  | No       | [UpdateGateway](#UpdateGateway) |

##### Responses

| Code | Description | Schema                                          |
| ---- | ----------- | ----------------------------------------------- |
| 200  | Successful  | [UpdateGatewayResponse](#UpdateGatewayResponse) |

### /v1/account/{account}/messages/move

#### PUT

##### Summary:

Move messages

##### Description:

Move messages matching to a search query to another folder

##### Parameters

| Name         | Located in | Description                                                                                                                                       | Required | Schema                                      |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)                                                                  | No       | integer                                     |
| account      | path       | Unique identifier for the email account                                                                                                           | Yes      | string                                      |
| path         | query      | Mailbox folder path. Can use special use labels like "\Sent". Special value "\All" is available for Gmail IMAP, Gmail API, MS Graph API accounts. | Yes      | string                                      |
| body         | body       |                                                                                                                                                   | No       | [MessagesMoveRequest](#MessagesMoveRequest) |

##### Responses

| Code | Description | Schema                                        |
| ---- | ----------- | --------------------------------------------- |
| 200  | Successful  | [MessagesMoveResponse](#MessagesMoveResponse) |

### /v1/account/{account}/messages/delete

#### PUT

##### Summary:

Delete messages

##### Description:

Move messages to Trash or delete these if already in Trash

##### Parameters

| Name         | Located in | Description                                                                                                                                       | Required | Schema                                          |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable)                                                                  | No       | integer                                         |
| account      | path       | Unique identifier for the email account                                                                                                           | Yes      | string                                          |
| path         | query      | Mailbox folder path. Can use special use labels like "\Sent". Special value "\All" is available for Gmail IMAP, Gmail API, MS Graph API accounts. | Yes      | string                                          |
| force        | query      | Delete messages even if not in Trash                                                                                                              | No       | boolean                                         |
| body         | body       |                                                                                                                                                   | No       | [MessagesDeleteRequest](#MessagesDeleteRequest) |

##### Responses

| Code | Description | Schema                                            |
| ---- | ----------- | ------------------------------------------------- |
| 200  | Successful  | [MessagesDeleteResponse](#MessagesDeleteResponse) |

### /v1/account/{account}/message/{message}/move

#### PUT

##### Summary:

Move a message to a specified folder

##### Description:

Moves a message to a target folder

##### Parameters

| Name         | Located in | Description                                                                      | Required | Schema                      |
| ------------ | ---------- | -------------------------------------------------------------------------------- | -------- | --------------------------- |
| x-ee-timeout | header     | Request timeout in milliseconds (overrides EENGINE_TIMEOUT environment variable) | No       | integer                     |
| account      | path       | Unique identifier for the email account                                          | Yes      | string                      |
| message      | path       | Message ID                                                                       | Yes      | string                      |
| body         | body       |                                                                                  | No       | [MessageMove](#MessageMove) |

##### Responses

| Code | Description | Schema                                      |
| ---- | ----------- | ------------------------------------------- |
| 200  | Successful  | [MessageMoveResponse](#MessageMoveResponse) |

### Models

#### type

Account type

| Name | Type   | Description  | Required |
| ---- | ------ | ------------ | -------- |
| type | string | Account type |          |

#### state

Account state

| Name  | Type   | Description   | Required |
| ----- | ------ | ------------- | -------- |
| state | string | Account state |          |

#### AccountCountersEvents

Cumulative event counters for the account lifetime

| Name                  | Type   | Description                                        | Required |
| --------------------- | ------ | -------------------------------------------------- | -------- |
| AccountCountersEvents | object | Cumulative event counters for the account lifetime |          |

#### AccountCounters

| Name   | Type                                            | Description | Required |
| ------ | ----------------------------------------------- | ----------- | -------- |
| events | [AccountCountersEvents](#AccountCountersEvents) |             | No       |

#### grant

OAuth2 grant type being requested

| Name  | Type   | Description                       | Required |
| ----- | ------ | --------------------------------- | -------- |
| grant | string | OAuth2 grant type being requested |          |

#### OauthScopes

Requested OAuth2 permission scopes

| Name        | Type  | Description                        | Required |
| ----------- | ----- | ---------------------------------- | -------- |
| OauthScopes | array | Requested OAuth2 permission scopes |          |

#### response

Raw error response from the OAuth2 server

| Name     | Type   | Description                               | Required |
| -------- | ------ | ----------------------------------------- | -------- |
| response | object | Raw error response from the OAuth2 server |          |

#### tokenRequest

Details about the failed OAuth2 token request

| Name     | Type                        | Description                              | Required |
| -------- | --------------------------- | ---------------------------------------- | -------- |
| grant    | [grant](#grant)             |                                          | No       |
| provider | string                      | OAuth2 provider name                     | No       |
| status   | integer                     | HTTP status code from the OAuth2 server  | No       |
| clientId | string                      | OAuth2 client ID used for authentication | No       |
| scopes   | [OauthScopes](#OauthScopes) |                                          | No       |
| response | [response](#response)       |                                          | No       |

#### AccountErrorEntry

| Name               | Type                          | Description                  | Required |
| ------------------ | ----------------------------- | ---------------------------- | -------- |
| response           | string                        | Human-readable error message | No       |
| serverResponseCode | string                        | Error code or classification | No       |
| tokenRequest       | [tokenRequest](#tokenRequest) |                              | No       |

#### AccountResponseItem

| Name         | Type                                    | Description                                                              | Required |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------ | -------- |
| account      | string                                  | Unique identifier for the email account                                  | Yes      |
| name         | string                                  | Display name for the account                                             | No       |
| email        | string                                  | Default email address of the account                                     | No       |
| type         | [type](#type)                           |                                                                          | Yes      |
| app          | string                                  | OAuth2 application ID                                                    | No       |
| state        | [state](#state)                         |                                                                          | Yes      |
| webhooks     | string                                  | Account-specific webhook URL                                             | No       |
| proxy        | string                                  | Proxy server URL for outbound connections                                | No       |
| smtpEhloName | string                                  | Hostname to use in SMTP EHLO/HELO commands (defaults to system hostname) | No       |
| counters     | [AccountCounters](#AccountCounters)     |                                                                          | No       |
| syncTime     | dateTime                                | Last sync time                                                           | No       |
| lastError    | [AccountErrorEntry](#AccountErrorEntry) |                                                                          | No       |

#### AccountEntries

| Name           | Type  | Description | Required |
| -------------- | ----- | ----------- | -------- |
| AccountEntries | array |             |          |

#### AccountsFilterResponse

| Name     | Type                              | Description                  | Required |
| -------- | --------------------------------- | ---------------------------- | -------- |
| total    | integer                           | How many matching entries    | No       |
| page     | integer                           | Current page (0-based index) | No       |
| pages    | integer                           | Total page count             | No       |
| accounts | [AccountEntries](#AccountEntries) |                              | No       |

#### DetectedAuthenticationInfo

| Name | Type   | Description      | Required |
| ---- | ------ | ---------------- | -------- |
| user | string | Account username | No       |

#### ResolvedServerSettings

| Name   | Type                                                      | Description                                          | Required |
| ------ | --------------------------------------------------------- | ---------------------------------------------------- | -------- |
| auth   | [DetectedAuthenticationInfo](#DetectedAuthenticationInfo) |                                                      | No       |
| host   | string                                                    | Hostname to connect to                               | Yes      |
| port   | integer                                                   | Service port number                                  | Yes      |
| secure | boolean                                                   | Should connection use TLS. Usually true for port 993 | No       |

#### DiscoveredServerSettings

| Name   | Type                                                      | Description                                          | Required |
| ------ | --------------------------------------------------------- | ---------------------------------------------------- | -------- |
| auth   | [DetectedAuthenticationInfo](#DetectedAuthenticationInfo) |                                                      | No       |
| host   | string                                                    | Hostname to connect to                               | Yes      |
| port   | integer                                                   | Service port number                                  | Yes      |
| secure | boolean                                                   | Should connection use TLS. Usually true for port 993 | No       |

#### DiscoveredEmailSettings

| Name     | Type                                                  | Description                  | Required |
| -------- | ----------------------------------------------------- | ---------------------------- | -------- |
| imap     | [ResolvedServerSettings](#ResolvedServerSettings)     |                              | No       |
| smtp     | [DiscoveredServerSettings](#DiscoveredServerSettings) |                              | No       |
| \_source | string                                                | Source for the detected info | No       |

#### BlocklistsResponseItem

| Name   | Type    | Description                             | Required |
| ------ | ------- | --------------------------------------- | -------- |
| listId | string  | List ID                                 | Yes      |
| count  | integer | Count of blocked addresses in this list | No       |

#### BlocklistsEntries

| Name              | Type  | Description | Required |
| ----------------- | ----- | ----------- | -------- |
| BlocklistsEntries | array |             |          |

#### BlocklistsResponse

| Name       | Type                                    | Description                  | Required |
| ---------- | --------------------------------------- | ---------------------------- | -------- |
| total      | integer                                 | How many matching entries    | No       |
| page       | integer                                 | Current page (0-based index) | No       |
| pages      | integer                                 | Total page count             | No       |
| blocklists | [BlocklistsEntries](#BlocklistsEntries) |                              | No       |

#### GatewayResponseItem

| Name       | Type                                    | Description                                  | Required |
| ---------- | --------------------------------------- | -------------------------------------------- | -------- |
| gateway    | string                                  | Gateway ID                                   | Yes      |
| name       | string                                  | Display name for the gateway                 | No       |
| deliveries | integer                                 | Count of email deliveries using this gateway | No       |
| lastUse    | dateTime                                | Last delivery time                           | No       |
| lastError  | [AccountErrorEntry](#AccountErrorEntry) |                                              | No       |

#### GatewayEntries

| Name           | Type  | Description | Required |
| -------------- | ----- | ----------- | -------- |
| GatewayEntries | array |             |          |

#### GatewaysFilterResponse

| Name     | Type                              | Description                  | Required |
| -------- | --------------------------------- | ---------------------------- | -------- |
| total    | integer                           | How many matching entries    | No       |
| page     | integer                           | Current page (0-based index) | No       |
| pages    | integer                           | Total page count             | No       |
| gateways | [GatewayEntries](#GatewayEntries) |                              | No       |

#### LicenseDetails

| Name        | Type   | Description                                         | Required |
| ----------- | ------ | --------------------------------------------------- | -------- |
| application | string | Licensed application identifier                     | No       |
| key         | string | License key                                         | No       |
| licensedTo  | string | Organization or individual the license is issued to | No       |
| hostname    | string | Licensed hostname or environment                    | No       |
| created     | date   | License creation date                               | No       |

#### LicenseResponse

| Name      | Type                              | Description                                                  | Required |
| --------- | --------------------------------- | ------------------------------------------------------------ | -------- |
| active    | boolean                           | Whether a valid license is currently active                  | No       |
| type      | string                            | License type/product name                                    | No       |
| details   | [LicenseDetails](#LicenseDetails) |                                                              | No       |
| suspended | boolean                           | Whether email operations are suspended due to license issues | No       |

#### OAuth2Provider

OAuth2 provider

| Name           | Type   | Description     | Required |
| -------------- | ------ | --------------- | -------- |
| OAuth2Provider | string | OAuth2 provider |          |

#### googleProjectId

Google Cloud Project ID

| Name            | Type   | Description             | Required |
| --------------- | ------ | ----------------------- | -------- |
| googleProjectId | string | Google Cloud Project ID |          |

#### googleTopicName

Google Pub/Sub topic name for Gmail push notifications

| Name            | Type   | Description                                            | Required |
| --------------- | ------ | ------------------------------------------------------ | -------- |
| googleTopicName | string | Google Pub/Sub topic name for Gmail push notifications |          |

#### googleSubscriptionName

Google Pub/Sub subscription name

| Name                   | Type   | Description                      | Required |
| ---------------------- | ------ | -------------------------------- | -------- |
| googleSubscriptionName | string | Google Pub/Sub subscription name |          |

#### OAuth2ResponseItem

| Name                    | Type                                              | Description                                                                                  | Required |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| id                      | string                                            | OAuth2 application ID                                                                        | Yes      |
| name                    | string                                            | Display name for the app                                                                     | No       |
| description             | string                                            | OAuth2 application description                                                               | No       |
| title                   | string                                            | Title for the application button                                                             | No       |
| provider                | [OAuth2Provider](#OAuth2Provider)                 |                                                                                              | Yes      |
| enabled                 | boolean                                           | Is the application enabled                                                                   | No       |
| legacy                  | boolean                                           | `true` for older OAuth2 apps set via the settings endpoint                                   | No       |
| created                 | dateTime                                          | The time this entry was added                                                                | Yes      |
| updated                 | dateTime                                          | The time this entry was updated                                                              | No       |
| includeInListing        | boolean                                           | Is the application listed in the hosted authentication form                                  | No       |
| clientId                | string                                            | Client or Application ID for 3-legged OAuth2 applications                                    | No       |
| clientSecret            | string                                            | Client secret for 3-legged OAuth2 applications. Actual value is not revealed.                | No       |
| authority               | string                                            | Authorization tenant value for Outlook OAuth2 applications                                   | No       |
| redirectUrl             | string                                            | Redirect URL for 3-legged OAuth2 applications                                                | No       |
| serviceClient           | string                                            | Service client ID for 2-legged OAuth2 applications                                           | No       |
| googleProjectId         | [googleProjectId](#googleProjectId)               |                                                                                              | No       |
| googleWorkspaceAccounts | boolean                                           | Restrict OAuth2 login to Google Workspace accounts only                                      | No       |
| googleTopicName         | [googleTopicName](#googleTopicName)               |                                                                                              | No       |
| googleSubscriptionName  | [googleSubscriptionName](#googleSubscriptionName) |                                                                                              | No       |
| serviceClientEmail      | string                                            | Service Client Email for 2-legged OAuth2 applications                                        | No       |
| serviceKey              | string                                            | PEM formatted service secret for 2-legged OAuth2 applications. Actual value is not revealed. | No       |
| lastError               | [AccountErrorEntry](#AccountErrorEntry)           |                                                                                              | No       |

#### OAuth2Entries

| Name          | Type  | Description | Required |
| ------------- | ----- | ----------- | -------- |
| OAuth2Entries | array |             |          |

#### OAuth2FilterResponse

| Name  | Type                            | Description                  | Required |
| ----- | ------------------------------- | ---------------------------- | -------- |
| total | integer                         | How many matching entries    | No       |
| page  | integer                         | Current page (0-based index) | No       |
| pages | integer                         | Total page count             | No       |
| apps  | [OAuth2Entries](#OAuth2Entries) |                              | No       |

#### source

How this message entered the queue

| Name   | Type   | Description                        | Required |
| ------ | ------ | ---------------------------------- | -------- |
| source | string | How this message entered the queue |          |

#### to

| Name | Type  | Description | Required |
| ---- | ----- | ----------- | -------- |
| to   | array |             |          |

#### envelope

SMTP envelope information

| Name | Type      | Description | Required |
| ---- | --------- | ----------- | -------- |
| from | string    |             | No       |
| to   | [to](#to) |             | No       |

#### status

Current delivery status

| Name   | Type   | Description             | Required |
| ------ | ------ | ----------------------- | -------- |
| status | string | Current delivery status |          |

#### OutboxListProgressError

Error details (when status is "error")

| Name       | Type   | Description        | Required |
| ---------- | ------ | ------------------ | -------- |
| message    | string | Error description  | No       |
| code       | string | Error code         | No       |
| statusCode | string | SMTP response code | No       |

#### OutboxEntryProgress

| Name     | Type                                                | Description                                        | Required |
| -------- | --------------------------------------------------- | -------------------------------------------------- | -------- |
| status   | [status](#status)                                   |                                                    | No       |
| response | string                                              | SMTP server response (when status is "processing") | No       |
| error    | [OutboxListProgressError](#OutboxListProgressError) |                                                    | No       |

#### OutboxEntry

| Name         | Type                                        | Description                                        | Required |
| ------------ | ------------------------------------------- | -------------------------------------------------- | -------- |
| queueId      | string                                      | Unique queue entry identifier                      | No       |
| account      | string                                      | Unique identifier for the email account            | Yes      |
| source       | [source](#source)                           |                                                    | No       |
| messageId    | string                                      | Message-ID header value                            | No       |
| envelope     | [envelope](#envelope)                       |                                                    | No       |
| subject      | string                                      | Email subject line                                 | No       |
| created      | dateTime                                    | When this message was added to the queue           | No       |
| scheduled    | dateTime                                    | Scheduled delivery time                            | No       |
| nextAttempt  | dateTime                                    | Next delivery attempt time                         | No       |
| attemptsMade | integer                                     | Number of delivery attempts made                   | No       |
| attempts     | integer                                     | Maximum delivery attempts before marking as failed | No       |
| progress     | [OutboxEntryProgress](#OutboxEntryProgress) |                                                    | No       |

#### OutboxListEntries

| Name              | Type  | Description | Required |
| ----------------- | ----- | ----------- | -------- |
| OutboxListEntries | array |             |          |

#### OutboxListResponse

| Name     | Type                                    | Description                  | Required |
| -------- | --------------------------------------- | ---------------------------- | -------- |
| total    | integer                                 | How many matching entries    | No       |
| page     | integer                                 | Current page (0-based index) | No       |
| pages    | integer                                 | Total page count             | No       |
| messages | [OutboxListEntries](#OutboxListEntries) |                              | No       |

#### webhookEvents

List of event types that will trigger webhook notifications

| Name          | Type  | Description                                                 | Required |
| ------------- | ----- | ----------------------------------------------------------- | -------- |
| webhookEvents | array | List of event types that will trigger webhook notifications |          |

#### WebhooksCustomHeader

| Name  | Type   | Description | Required |
| ----- | ------ | ----------- | -------- |
| key   | string |             | Yes      |
| value | string |             | No       |

#### WebhooksCustomHeaders

Additional HTTP headers to include with every webhook request for authentication or tracking

| Name                  | Type  | Description                                                                                  | Required |
| --------------------- | ----- | -------------------------------------------------------------------------------------------- | -------- |
| WebhooksCustomHeaders | array | Additional HTTP headers to include with every webhook request for authentication or tracking |          |

#### notifyHeaders

Email headers to include in webhook payloads for additional context

| Name          | Type  | Description                                                         | Required |
| ------------- | ----- | ------------------------------------------------------------------- | -------- |
| notifyHeaders | array | Email headers to include in webhook payloads for additional context |          |

#### imapIndexer

IMAP indexing strategy:
• full – Detect new, changed, and deleted messages (slower but complete)
• fast – Detect only new messages

| Name        | Type   | Description                                                                                                                        | Required |
| ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------- |
| imapIndexer | string | IMAP indexing strategy: • full – Detect new, changed, and deleted messages (slower but complete) • fast – Detect only new messages |          |

#### LogSettings

| Name        | Type    | Description                                         | Required |
| ----------- | ------- | --------------------------------------------------- | -------- |
| all         | boolean | Enable detailed logging for all email accounts      | No       |
| maxLogLines | integer | Maximum number of log entries to retain per account | No       |

#### imapStrategy

IP address selection strategy for outbound IMAP connections when multiple local addresses are available

| Name         | Type   | Description                                                                                             | Required |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------- | -------- |
| imapStrategy | string | IP address selection strategy for outbound IMAP connections when multiple local addresses are available |          |

#### smtpStrategy

IP address selection strategy for outbound SMTP connections when multiple local addresses are available

| Name         | Type   | Description                                                                                             | Required |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------- | -------- |
| smtpStrategy | string | IP address selection strategy for outbound SMTP connections when multiple local addresses are available |          |

#### localAddresses

List of local IP addresses to use for outbound connections (requires appropriate network configuration)

| Name           | Type  | Description                                                                                             | Required |
| -------------- | ----- | ------------------------------------------------------------------------------------------------------- | -------- |
| localAddresses | array | List of local IP addresses to use for outbound connections (requires appropriate network configuration) |          |

#### locale

Default language/locale for the user interface

| Name   | Type   | Description                                    | Required |
| ------ | ------ | ---------------------------------------------- | -------- |
| locale | string | Default language/locale for the user interface |          |

#### SettingsQueryResponse

| Name                      | Type                                            | Description                                                                                                     | Required |
| ------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| webhooksEnabled           | boolean                                         | Enable or disable webhook delivery for all accounts                                                             | No       |
| webhooks                  | string                                          | Target URL that will receive webhook notifications via POST requests                                            | No       |
| webhookEvents             | [webhookEvents](#webhookEvents)                 |                                                                                                                 | No       |
| webhooksCustomHeaders     | [WebhooksCustomHeaders](#WebhooksCustomHeaders) |                                                                                                                 | No       |
| notifyHeaders             | [notifyHeaders](#notifyHeaders)                 |                                                                                                                 | No       |
| serviceUrl                | string                                          | Base URL of this EmailEngine instance (used for generating public URLs, path component is ignored)              | No       |
| notificationBaseUrl       | string                                          | Public callback URL for external OAuth providers. Falls back to serviceUrl if not set                           | No       |
| trackClicks               | boolean                                         | Rewrite links in outgoing HTML emails to track click-through rates                                              | No       |
| trackOpens                | boolean                                         | Insert a tracking pixel in outgoing HTML emails to detect when messages are opened                              | No       |
| imapIndexer               | [imapIndexer](#imapIndexer)                     |                                                                                                                 | No       |
| resolveGmailCategories    | boolean                                         | Automatically detect and categorize Gmail tabs (Primary, Social, Promotions, etc.) for IMAP connections         | No       |
| ignoreMailCertErrors      | boolean                                         | Allow connections to mail servers with self-signed or invalid TLS certificates (not recommended for production) | No       |
| generateEmailSummary      | boolean                                         | Generate AI-powered summaries for incoming emails using OpenAI                                                  | No       |
| openAiAPIKey              | string                                          | Your OpenAI API key for AI features                                                                             | No       |
| openAiModel               | string                                          | OpenAI model to use for text generation                                                                         | No       |
| openAiAPIUrl              | string                                          | Base URL for OpenAI API (change for OpenAI-compatible services)                                                 | No       |
| openAiTemperature         | number                                          | Controls randomness in AI responses (0 = deterministic, 2 = very creative)                                      | No       |
| openAiTopP                | number                                          | Nucleus sampling parameter for AI text generation (0-1, lower = more focused)                                   | No       |
| openAiPrompt              | string                                          | Custom system prompt to guide AI behavior when processing emails                                                | No       |
| openAiGenerateEmbeddings  | boolean                                         | Generate vector embeddings for semantic search and similarity matching                                          | No       |
| inboxNewOnly              | boolean                                         | Trigger "messageNew" webhooks only for messages arriving in the Inbox folder                                    | No       |
| serviceSecret             | string                                          | HMAC secret for signing API requests and validating webhooks                                                    | No       |
| authServer                | string                                          | External authentication service URL for retrieving mailbox credentials dynamically                              | No       |
| proxyEnabled              | boolean                                         | Route outbound connections through a proxy server                                                               | No       |
| proxyUrl                  | string                                          | Proxy server URL for outbound connections                                                                       | No       |
| smtpEhloName              | string                                          | Hostname to use in SMTP EHLO/HELO commands (defaults to system hostname)                                        | No       |
| notifyText                | boolean                                         | Include plain text message content in webhook payloads                                                          | No       |
| notifyWebSafeHtml         | boolean                                         | Sanitize HTML content to remove potentially dangerous elements before including in webhooks                     | No       |
| notifyTextSize            | integer                                         | Maximum size (in bytes) of text content to include in webhook payloads                                          | No       |
| notifyAttachments         | boolean                                         | Include attachment data in webhook payloads                                                                     | No       |
| notifyAttachmentSize      | integer                                         | Maximum size (in bytes) per attachment to include in webhook payloads                                           | No       |
| notifyCalendarEvents      | boolean                                         | Include parsed calendar event data in webhook payloads                                                          | No       |
| logs                      | [LogSettings](#LogSettings)                     |                                                                                                                 | No       |
| imapStrategy              | [imapStrategy](#imapStrategy)                   |                                                                                                                 | No       |
| smtpStrategy              | [smtpStrategy](#smtpStrategy)                   |                                                                                                                 | No       |
| localAddresses            | [localAddresses](#localAddresses)               |                                                                                                                 | No       |
| smtpServerEnabled         | boolean                                         | Enable the built-in SMTP server for receiving emails                                                            | No       |
| smtpServerPort            | integer                                         | Port number for the built-in SMTP server                                                                        | No       |
| smtpServerHost            | string                                          | IP address to bind the SMTP server to (empty = all interfaces)                                                  | No       |
| smtpServerProxy           | boolean                                         | Enable PROXY protocol support for the SMTP server                                                               | No       |
| smtpServerAuthEnabled     | boolean                                         | Require SMTP authentication for incoming connections                                                            | No       |
| smtpServerPassword        | string                                          | Password for SMTP authentication (null = disable authentication)                                                | No       |
| smtpServerTLSEnabled      | boolean                                         | Enable TLS/STARTTLS support for the SMTP server                                                                 | No       |
| imapProxyServerEnabled    | boolean                                         | Enable the IMAP proxy server                                                                                    | No       |
| imapProxyServerPort       | integer                                         | Port number for the IMAP proxy server                                                                           | No       |
| imapProxyServerHost       | string                                          | IP address to bind the IMAP proxy to (empty = all interfaces)                                                   | No       |
| imapProxyServerProxy      | boolean                                         | Enable PROXY protocol support for the IMAP proxy                                                                | No       |
| imapProxyServerPassword   | string                                          | Password for IMAP proxy authentication (null = disable authentication)                                          | No       |
| imapProxyServerTLSEnabled | boolean                                         | Enable TLS support for the IMAP proxy                                                                           | No       |
| queueKeep                 | integer                                         | Number of completed and failed queue entries to retain for debugging                                            | No       |
| deliveryAttempts          | integer                                         | Maximum number of delivery attempts before marking a message as permanently failed                              | No       |
| templateHeader            | string                                          | Custom HTML to inject at the top of hosted pages (e.g., for branding)                                           | No       |
| templateHtmlHead          | string                                          | Custom HTML to inject into the <head> section of hosted pages (e.g., for analytics)                             | No       |
| scriptEnv                 | string                                          | JSON object containing environment variables available to pre-processing scripts                                | No       |
| enableApiProxy            | boolean                                         | Trust X-Forwarded-\* headers when behind a reverse proxy                                                        | No       |
| locale                    | [locale](#locale)                               |                                                                                                                 | No       |
| timezone                  | string                                          | Default timezone for date/time display (IANA timezone identifier)                                               | No       |
| pageBrandName             | string                                          | Brand name displayed in page titles                                                                             | No       |
| openAiPreProcessingFn     | string                                          | JavaScript function to filter emails before AI processing (return true to process, false to skip)               | No       |
| imapClientName            | string                                          | Client name advertised via IMAP ID extension                                                                    | No       |
| imapClientVersion         | string                                          | Client version advertised via IMAP ID extension                                                                 | No       |
| imapClientVendor          | string                                          | Vendor name advertised via IMAP ID extension                                                                    | No       |
| imapClientSupportUrl      | string                                          | Support URL advertised via IMAP ID extension                                                                    | No       |

#### ConnectionsStats

Counts of accounts in different connection states

| Name                | Type    | Description                              | Required |
| ------------------- | ------- | ---------------------------------------- | -------- |
| init                | integer | Accounts not yet initialized             | No       |
| connected           | integer | Successfully connected accounts          | No       |
| connecting          | integer | Connection is being established          | No       |
| authenticationError | integer | Authentication failed                    | No       |
| connectError        | integer | Connection failed due to technical error | No       |
| unset               | integer | Accounts without valid IMAP settings     | No       |
| disconnected        | integer | IMAP connection was closed               | No       |

#### CounterStats

| Name         | Type   | Description | Required |
| ------------ | ------ | ----------- | -------- |
| CounterStats | object |             |          |

#### SettingsResponse

| Name        | Type                                  | Description                   | Required |
| ----------- | ------------------------------------- | ----------------------------- | -------- |
| version     | string                                | EmailEngine version number    | No       |
| license     | string                                | EmailEngine license           | No       |
| accounts    | integer                               | Number of registered accounts | No       |
| node        | string                                | Node.js Version               | No       |
| redis       | string                                | Redis Version                 | No       |
| connections | [ConnectionsStats](#ConnectionsStats) |                               | No       |
| counters    | [CounterStats](#CounterStats)         |                               | No       |

#### format

Markup language for HTML ("html" or "markdown")

| Name   | Type   | Description                                     | Required |
| ------ | ------ | ----------------------------------------------- | -------- |
| format | string | Markup language for HTML ("html" or "markdown") |          |

#### AccountTemplate

| Name        | Type              | Description                             | Required |
| ----------- | ----------------- | --------------------------------------- | -------- |
| id          | string            | Template ID                             | Yes      |
| name        | string            | Name of the template                    | Yes      |
| description | string            | Optional description of the template    | No       |
| format      | [format](#format) |                                         | No       |
| created     | dateTime          | The time this template was created      | No       |
| updated     | dateTime          | The time this template was last updated | No       |

#### AccountTemplatesList

| Name                 | Type  | Description | Required |
| -------------------- | ----- | ----------- | -------- |
| AccountTemplatesList | array |             |          |

#### AccountTemplatesResponse

| Name      | Type                                          | Description                             | Required |
| --------- | --------------------------------------------- | --------------------------------------- | -------- |
| account   | string                                        | Unique identifier for the email account | Yes      |
| total     | integer                                       | How many matching entries               | No       |
| page      | integer                                       | Current page (0-based index)            | No       |
| pages     | integer                                       | Total page count                        | No       |
| templates | [AccountTemplatesList](#AccountTemplatesList) |                                         | No       |

#### RootTokensItem

| Name        | Type   | Description                             | Required |
| ----------- | ------ | --------------------------------------- | -------- |
| account     | string | Unique identifier for the email account | Yes      |
| description | string | Token description                       | Yes      |
| metadata    | string | Related metadata in JSON format         | No       |
| ip          | string | IP address of the requester             | No       |

#### RootTokensEntries

| Name              | Type  | Description | Required |
| ----------------- | ----- | ----------- | -------- |
| RootTokensEntries | array |             |          |

#### RootTokensResponse

| Name   | Type                                    | Description | Required |
| ------ | --------------------------------------- | ----------- | -------- |
| tokens | [RootTokensEntries](#RootTokensEntries) |             | No       |

#### WebhookRoutesListEntry

| Name        | Type     | Description                                                          | Required |
| ----------- | -------- | -------------------------------------------------------------------- | -------- |
| id          | string   | Webhook ID                                                           | Yes      |
| name        | string   | Name of the route                                                    | Yes      |
| description | string   | Optional description of the webhook route                            | No       |
| created     | dateTime | The time this route was created                                      | No       |
| updated     | dateTime | The time this route was last updated                                 | No       |
| enabled     | boolean  | Is the route enabled                                                 | No       |
| targetUrl   | string   | Target URL that will receive webhook notifications via POST requests | No       |
| tcount      | integer  | How many times this route has been applied                           | No       |

#### WebhookRoutesList

| Name              | Type  | Description | Required |
| ----------------- | ----- | ----------- | -------- |
| WebhookRoutesList | array |             |          |

#### WebhookRoutesListResponse

| Name     | Type                                    | Description                  | Required |
| -------- | --------------------------------------- | ---------------------------- | -------- |
| total    | integer                                 | How many matching entries    | No       |
| page     | integer                                 | Current page (0-based index) | No       |
| pages    | integer                                 | Total page count             | No       |
| webhooks | [WebhookRoutesList](#WebhookRoutesList) |                              | No       |

#### AccountPath

Mailbox folders to monitor for changes (IMAP only). Use "\*" to monitor all folders (default). While you can still access unmonitored folders via API, you won't receive webhooks for changes in those folders.

| Name        | Type  | Description                                                                                                                                                                                                     | Required |
| ----------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AccountPath | array | Mailbox folders to monitor for changes (IMAP only). Use "\*" to monitor all folders (default). While you can still access unmonitored folders via API, you won't receive webhooks for changes in those folders. |          |

#### IMAPIndexer

Override global IMAP indexing strategy for this account. "full" tracks all changes including deletions, "fast" only detects new messages.

| Name        | Type   | Description                                                                                                                               | Required |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| IMAPIndexer | string | Override global IMAP indexing strategy for this account. "full" tracks all changes including deletions, "fast" only detects new messages. |          |

#### SubconnectionPaths

Additional mailbox paths to monitor with dedicated IMAP connections for faster change detection. Use sparingly as connection limits are strict.

| Name               | Type  | Description                                                                                                                                     | Required |
| ------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| SubconnectionPaths | array | Additional mailbox paths to monitor with dedicated IMAP connections for faster change detection. Use sparingly as connection limits are strict. |          |

#### accessToken

OAuth2 access token (when using OAuth2 instead of password authentication)

| Name        | Type   | Description                                                                | Required |
| ----------- | ------ | -------------------------------------------------------------------------- | -------- |
| accessToken | string | OAuth2 access token (when using OAuth2 instead of password authentication) |          |

#### Authentication

Authentication credentials for the IMAP server

| Name        | Type                        | Description                                       | Required |
| ----------- | --------------------------- | ------------------------------------------------- | -------- |
| user        | string                      | Username or email address for IMAP authentication | Yes      |
| accessToken | [accessToken](#accessToken) |                                                   | No       |
| pass        | string                      | Password for IMAP authentication                  | No       |

#### TLS

Advanced TLS configuration options

| Name               | Type    | Description                                                 | Required |
| ------------------ | ------- | ----------------------------------------------------------- | -------- |
| rejectUnauthorized | boolean | Reject connections to servers with invalid TLS certificates | No       |
| minVersion         | string  | Minimum TLS version to accept (e.g., "TLSv1.2", "TLSv1.3")  | No       |

#### IMAPResponse

IMAP configuration

| Name            | Type                              | Description                                                                                                       | Required |
| --------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- |
| auth            | [Authentication](#Authentication) |                                                                                                                   | No       |
| useAuthServer   | boolean                           | Use external authentication server to retrieve credentials dynamically                                            | No       |
| host            | string                            | IMAP server hostname                                                                                              | No       |
| port            | integer                           | IMAP server port (typically 993 for IMAP over TLS, 143 for STARTTLS)                                              | No       |
| secure          | boolean                           | Use TLS encryption for the connection (true for port 993, false for STARTTLS on port 143)                         | No       |
| tls             | [TLS](#TLS)                       |                                                                                                                   | No       |
| resyncDelay     | integer                           | Delay in seconds between full mailbox resynchronizations                                                          | No       |
| disabled        | boolean                           | Temporarily disable IMAP operations for this account                                                              | No       |
| sentMailPath    | string                            | Custom folder path for sent messages. Defaults to auto-detected "Sent" folder. Set to null to use default.        | No       |
| draftsMailPath  | string                            | Custom folder path for draft messages. Defaults to auto-detected "Drafts" folder. Set to null to use default.     | No       |
| junkMailPath    | string                            | Custom folder path for spam/junk messages. Defaults to auto-detected "Junk" folder. Set to null to use default.   | No       |
| trashMailPath   | string                            | Custom folder path for deleted messages. Defaults to auto-detected "Trash" folder. Set to null to use default.    | No       |
| archiveMailPath | string                            | Custom folder path for archived messages. Defaults to auto-detected "Archive" folder. Set to null to use default. | No       |

#### Model1

Authentication credentials for the SMTP server

| Name        | Type                        | Description                                       | Required |
| ----------- | --------------------------- | ------------------------------------------------- | -------- |
| user        | string                      | Username or email address for SMTP authentication | Yes      |
| accessToken | [accessToken](#accessToken) |                                                   | No       |
| pass        | string                      | Password for SMTP authentication                  | No       |

#### SMTPResponse

SMTP configuration

| Name          | Type              | Description                                                                               | Required |
| ------------- | ----------------- | ----------------------------------------------------------------------------------------- | -------- |
| auth          | [Model1](#Model1) |                                                                                           | No       |
| useAuthServer | boolean           | Use external authentication server to retrieve credentials dynamically                    | No       |
| host          | string            | SMTP server hostname                                                                      | Yes      |
| port          | integer           | SMTP server port (typically 587 for STARTTLS, 465 for SMTP over TLS, 25 for unencrypted)  | Yes      |
| secure        | boolean           | Use TLS encryption from the start (true for port 465, false for STARTTLS on ports 587/25) | No       |
| tls           | [TLS](#TLS)       |                                                                                           | No       |

#### OAuth2Authentication

| Name             | Type   | Description                                                                                                                                       | Required |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| user             | string | Primary email account username                                                                                                                    | No       |
| delegatedUser    | string | Shared mailbox username (Microsoft 365 delegation)                                                                                                | No       |
| delegatedAccount | string | Account ID to use for authenticating the shared mailbox. When provided, EmailEngine uses this account's credentials instead of creating new ones. | No       |

#### Oauth2Response

OAuth2 configuration

| Name          | Type                                          | Description                                                                                                             | Required |
| ------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| authorize     | boolean                                       | Request an OAuth2 authorization URL instead of directly configuring credentials                                         | No       |
| redirectUrl   | string                                        | URL to redirect to after OAuth2 authorization completes (only used when authorize=true)                                 | No       |
| provider      | string                                        | OAuth2 Application ID configured in EmailEngine                                                                         | No       |
| auth          | [OAuth2Authentication](#OAuth2Authentication) |                                                                                                                         | Yes      |
| useAuthServer | boolean                                       | Use external authentication server for token management instead of EmailEngine                                          | No       |
| accessToken   | string                                        | OAuth2 access token for the email account                                                                               | No       |
| refreshToken  | string                                        | OAuth2 refresh token for obtaining new access tokens                                                                    | No       |
| authority     | string                                        | Microsoft account type: "consumers" (personal), "organizations" (work/school), "common" (both), or a specific tenant ID | No       |
| expires       | dateTime                                      | Access token expiration timestamp                                                                                       | No       |

#### AccountInfoState

Informational account state

| Name             | Type   | Description                 | Required |
| ---------------- | ------ | --------------------------- | -------- |
| AccountInfoState | string | Informational account state |          |

#### SMTPStatusStatus

Was the last SMTP attempt successful or not

| Name             | Type   | Description                                 | Required |
| ---------------- | ------ | ------------------------------------------- | -------- |
| SMTPStatusStatus | string | Was the last SMTP attempt successful or not |          |

#### SMTPInfoStatus

Information about the last SMTP connection attempt

| Name         | Type                                  | Description                                          | Required |
| ------------ | ------------------------------------- | ---------------------------------------------------- | -------- |
| created      | dateTime                              | When was the status for SMTP connection last updated | No       |
| status       | [SMTPStatusStatus](#SMTPStatusStatus) |                                                      | No       |
| response     | string                                | SMTP response message for delivery attempt           | No       |
| description  | string                                | Error information                                    | No       |
| responseCode | integer                               | Error status code                                    | No       |
| code         | string                                | Error type identifier                                | No       |
| command      | string                                | SMTP command that failed                             | No       |

#### AccountWebhooksCustomHeaders

Additional HTTP headers to include with every webhook request for authentication or tracking

| Name                         | Type  | Description                                                                                  | Required |
| ---------------------------- | ----- | -------------------------------------------------------------------------------------------- | -------- |
| AccountWebhooksCustomHeaders | array | Additional HTTP headers to include with every webhook request for authentication or tracking |          |

#### baseScopes

OAuth2 Base Scopes

| Name       | Type   | Description        | Required |
| ---------- | ------ | ------------------ | -------- |
| baseScopes | string | OAuth2 Base Scopes |          |

#### AccountQuota

Account quota information if query argument quota=true. This value will be false if the server does not provide quota information.

| Name   | Type    | Description                                     | Required |
| ------ | ------- | ----------------------------------------------- | -------- |
| usage  | integer | How many bytes has the account stored in emails | No       |
| limit  | integer | How many bytes can the account store emails     | No       |
| status | string  | Textual information about the usage             | No       |

#### AccountResponse

| Name                  | Type                                                          | Description                                                                                             | Required |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- |
| account               | string                                                        | Unique identifier for the email account                                                                 | Yes      |
| name                  | string                                                        | Display name for the account                                                                            | No       |
| email                 | string                                                        | Default email address of the account                                                                    | No       |
| copy                  | boolean                                                       | Copy submitted messages to Sent folder                                                                  | No       |
| logs                  | boolean                                                       | Store recent logs                                                                                       | No       |
| notifyFrom            | dateTime                                                      | Only send webhooks for messages received after this date. Defaults to account creation time. IMAP only. | No       |
| path                  | [AccountPath](#AccountPath)                                   |                                                                                                         | No       |
| imapIndexer           | [IMAPIndexer](#IMAPIndexer)                                   |                                                                                                         | No       |
| subconnections        | [SubconnectionPaths](#SubconnectionPaths)                     |                                                                                                         | No       |
| webhooks              | string                                                        | Account-specific webhook URL                                                                            | No       |
| proxy                 | string                                                        | Proxy server URL for outbound connections                                                               | No       |
| smtpEhloName          | string                                                        | Hostname to use in SMTP EHLO/HELO commands (defaults to system hostname)                                | No       |
| imap                  | [IMAPResponse](#IMAPResponse)                                 |                                                                                                         | No       |
| smtp                  | [SMTPResponse](#SMTPResponse)                                 |                                                                                                         | No       |
| oauth2                | [Oauth2Response](#Oauth2Response)                             |                                                                                                         | No       |
| state                 | [AccountInfoState](#AccountInfoState)                         |                                                                                                         | No       |
| smtpStatus            | [SMTPInfoStatus](#SMTPInfoStatus)                             |                                                                                                         | No       |
| webhooksCustomHeaders | [AccountWebhooksCustomHeaders](#AccountWebhooksCustomHeaders) |                                                                                                         | No       |
| locale                | string                                                        | Optional locale                                                                                         | No       |
| tz                    | string                                                        | Optional timezone                                                                                       | No       |
| type                  | [type](#type)                                                 |                                                                                                         | Yes      |
| app                   | string                                                        | OAuth2 application ID                                                                                   | No       |
| baseScopes            | [baseScopes](#baseScopes)                                     |                                                                                                         | No       |
| counters              | [AccountCounters](#AccountCounters)                           |                                                                                                         | No       |
| quota                 | [AccountQuota](#AccountQuota)                                 |                                                                                                         | No       |
| syncTime              | dateTime                                                      | Last sync time                                                                                          | No       |
| lastError             | [AccountErrorEntry](#AccountErrorEntry)                       |                                                                                                         | No       |

#### BlocklistListResponseItem

| Name          | Type     | Description                               | Required |
| ------------- | -------- | ----------------------------------------- | -------- |
| recipient     | string   | Listed email address                      | Yes      |
| account       | string   | Unique identifier for the email account   | Yes      |
| messageId     | string   | Message ID                                | No       |
| source        | string   | Which mechanism was used to add the entry | No       |
| reason        | string   | Why this entry was added                  | No       |
| remoteAddress | string   | Which IP address triggered the entry      | No       |
| userAgent     | string   | Which user agent triggered the entry      | No       |
| created       | dateTime | The time this entry was added or updated  | Yes      |

#### BlocklistListEntries

| Name                 | Type  | Description | Required |
| -------------------- | ----- | ----------- | -------- |
| BlocklistListEntries | array |             |          |

#### BlocklistListResponse

| Name      | Type                                          | Description                  | Required |
| --------- | --------------------------------------------- | ---------------------------- | -------- |
| listId    | string                                        | List ID                      | Yes      |
| total     | integer                                       | How many matching entries    | No       |
| page      | integer                                       | Current page (0-based index) | No       |
| pages     | integer                                       | Total page count             | No       |
| addresses | [BlocklistListEntries](#BlocklistListEntries) |                              | No       |

#### GatewayResponse

| Name       | Type                                    | Description                                          | Required |
| ---------- | --------------------------------------- | ---------------------------------------------------- | -------- |
| gateway    | string                                  | Gateway ID                                           | Yes      |
| name       | string                                  | Display name for the gateway                         | Yes      |
| deliveries | integer                                 | Count of email deliveries using this gateway         | No       |
| lastUse    | dateTime                                | Last delivery time                                   | No       |
| user       | string                                  |                                                      | No       |
| pass       | string                                  |                                                      | No       |
| host       | string                                  | Hostname to connect to                               | No       |
| port       | integer                                 | Service port number                                  | No       |
| secure     | boolean                                 | Should connection use TLS. Usually true for port 465 | No       |
| lastError  | [AccountErrorEntry](#AccountErrorEntry) |                                                      | No       |

#### ApplicationResponse

| Name                    | Type                                              | Description                                                                                  | Required |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| id                      | string                                            | OAuth2 application ID                                                                        | Yes      |
| name                    | string                                            | Display name for the app                                                                     | No       |
| description             | string                                            | OAuth2 application description                                                               | No       |
| title                   | string                                            | Title for the application button                                                             | No       |
| provider                | [OAuth2Provider](#OAuth2Provider)                 |                                                                                              | Yes      |
| enabled                 | boolean                                           | Is the application enabled                                                                   | No       |
| legacy                  | boolean                                           | `true` for older OAuth2 apps set via the settings endpoint                                   | No       |
| created                 | dateTime                                          | The time this entry was added                                                                | Yes      |
| updated                 | dateTime                                          | The time this entry was updated                                                              | No       |
| includeInListing        | boolean                                           | Is the application listed in the hosted authentication form                                  | No       |
| clientId                | string                                            | Client or Application ID for 3-legged OAuth2 applications                                    | No       |
| clientSecret            | string                                            | Client secret for 3-legged OAuth2 applications. Actual value is not revealed.                | No       |
| authority               | string                                            | Authorization tenant value for Outlook OAuth2 applications                                   | No       |
| redirectUrl             | string                                            | Redirect URL for 3-legged OAuth2 applications                                                | No       |
| googleProjectId         | [googleProjectId](#googleProjectId)               |                                                                                              | No       |
| googleWorkspaceAccounts | boolean                                           | Restrict OAuth2 login to Google Workspace accounts only                                      | No       |
| googleTopicName         | [googleTopicName](#googleTopicName)               |                                                                                              | No       |
| googleSubscriptionName  | [googleSubscriptionName](#googleSubscriptionName) |                                                                                              | No       |
| serviceClientEmail      | string                                            | Service Client Email for 2-legged OAuth2 applications                                        | No       |
| serviceClient           | string                                            | Service client ID for 2-legged OAuth2 applications                                           | No       |
| serviceKey              | string                                            | PEM formatted service secret for 2-legged OAuth2 applications. Actual value is not revealed. | No       |
| accounts                | integer                                           | The number of accounts registered with this application. Not available for legacy apps.      | No       |
| lastError               | [AccountErrorEntry](#AccountErrorEntry)           |                                                                                              | No       |

#### SignatureResponseItem

| Name      | Type   | Description                                 | Required |
| --------- | ------ | ------------------------------------------- | -------- |
| address   | string | Email address associated with the signature | Yes      |
| signature | string | Signature HTML code                         | Yes      |

#### SignatureEntries

| Name             | Type  | Description | Required |
| ---------------- | ----- | ----------- | -------- |
| SignatureEntries | array |             |          |

#### AccountTokenResponse

| Name       | Type                                  | Description | Required |
| ---------- | ------------------------------------- | ----------- | -------- |
| signatures | [SignatureEntries](#SignatureEntries) |             | No       |

#### FromAddress

Sender email address

| Name    | Type   | Description | Required |
| ------- | ------ | ----------- | -------- |
| name    | string |             | No       |
| address | string |             | Yes      |

#### RcptAddressEntry

| Name    | Type   | Description | Required |
| ------- | ------ | ----------- | -------- |
| name    | string |             | No       |
| address | string |             | Yes      |

#### AddressList

List of email addresses

| Name        | Type  | Description             | Required |
| ----------- | ----- | ----------------------- | -------- |
| AddressList | array | List of email addresses |          |

#### FlagList

IMAP flags set on this message

| Name     | Type  | Description                    | Required |
| -------- | ----- | ------------------------------ | -------- |
| FlagList | array | IMAP flags set on this message |          |

#### LabelList

Gmail labels applied to this message

| Name      | Type  | Description                          | Required |
| --------- | ----- | ------------------------------------ | -------- |
| LabelList | array | Gmail labels applied to this message |          |

#### AttachmentEntry

| Name        | Type    | Description                                                                                       | Required |
| ----------- | ------- | ------------------------------------------------------------------------------------------------- | -------- |
| id          | string  | Unique identifier for the attachment                                                              | No       |
| contentType | string  | MIME type of the attachment                                                                       | No       |
| encodedSize | integer | Size of the attachment in bytes as stored (base64 encoded size, actual file size will be smaller) | No       |
| embedded    | boolean | Whether the attachment is embedded in the HTML content                                            | No       |
| inline      | boolean | Whether the attachment should be displayed inline rather than as a download                       | No       |
| contentId   | string  | Content-ID header value used for embedding images in HTML                                         | No       |
| filename    | string  | Original filename of the attachment                                                               | No       |
| method      | string  | Calendar method (REQUEST, REPLY, CANCEL, etc.) for iCalendar attachments                          | No       |

#### AttachmentList

List of attachments

| Name           | Type  | Description         | Required |
| -------------- | ----- | ------------------- | -------- |
| AttachmentList | array | List of attachments |          |

#### encodedSize

Sizes of different message parts

| Name  | Type    | Description                          | Required |
| ----- | ------- | ------------------------------------ | -------- |
| plain | integer | Size of the plain text part in bytes | No       |
| html  | integer | Size of the HTML part in bytes       | No       |

#### TextInfo

| Name        | Type                        | Description                                   | Required |
| ----------- | --------------------------- | --------------------------------------------- | -------- |
| id          | string                      | Identifier for fetching the full message text | No       |
| encodedSize | [encodedSize](#encodedSize) |                                               | No       |

#### MessageListEntry

| Name        | Type                              | Description                                                                    | Required |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------ | -------- |
| id          | string                            | EmailEngine message identifier                                                 | No       |
| uid         | integer                           | IMAP UID (unique identifier within the mailbox)                                | No       |
| emailId     | string                            | Globally unique email identifier (when supported by the email server)          | No       |
| threadId    | string                            | Thread identifier for email conversations (when supported by the email server) | No       |
| date        | dateTime                          | Date when the message was received by the mail server                          | No       |
| draft       | boolean                           | Whether this message is a draft                                                | No       |
| unseen      | boolean                           | Whether this message is unread                                                 | No       |
| flagged     | boolean                           | Whether this message is flagged/starred                                        | No       |
| size        | integer                           | Message size in bytes                                                          | No       |
| subject     | string                            | Message subject line                                                           | No       |
| from        | [FromAddress](#FromAddress)       |                                                                                | No       |
| replyTo     | [AddressList](#AddressList)       |                                                                                | No       |
| to          | [AddressList](#AddressList)       |                                                                                | No       |
| cc          | [AddressList](#AddressList)       |                                                                                | No       |
| bcc         | [AddressList](#AddressList)       |                                                                                | No       |
| messageId   | string                            | Message-ID header value                                                        | No       |
| inReplyTo   | string                            | Message-ID of the message this is replying to                                  | No       |
| flags       | [FlagList](#FlagList)             |                                                                                | No       |
| labels      | [LabelList](#LabelList)           |                                                                                | No       |
| attachments | [AttachmentList](#AttachmentList) |                                                                                | No       |
| text        | [TextInfo](#TextInfo)             |                                                                                | No       |
| preview     | string                            | Short preview of the message content                                           | No       |

#### PageMessages

| Name         | Type  | Description | Required |
| ------------ | ----- | ----------- | -------- |
| PageMessages | array |             |          |

#### MessageList

| Name           | Type                          | Description                                                                             | Required |
| -------------- | ----------------------------- | --------------------------------------------------------------------------------------- | -------- |
| total          | integer                       | Total number of messages matching the query (exact for IMAP, approximate for Gmail API) | No       |
| page           | integer                       | Current page number (zero-based)                                                        | No       |
| pages          | integer                       | Total number of pages available (exact for IMAP, approximate for Gmail API)             | No       |
| nextPageCursor | string                        | Cursor for fetching the next page (null when no more pages)                             | No       |
| prevPageCursor | string                        | Cursor for fetching the previous page                                                   | No       |
| messages       | [PageMessages](#PageMessages) |                                                                                         | No       |

#### MailboxSpecialUse

Special folder type (Inbox, Sent, Drafts, etc.)

| Name              | Type   | Description                                     | Required |
| ----------------- | ------ | ----------------------------------------------- | -------- |
| MailboxSpecialUse | string | Special folder type (Inbox, Sent, Drafts, etc.) |          |

#### MailboxSpecialUseSource

How the special use was determined: "user" (set via API), "extension" (server-provided), or "name" (guessed from folder name)

| Name                    | Type   | Description                                                                                                                   | Required |
| ----------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- | -------- |
| MailboxSpecialUseSource | string | How the special use was determined: "user" (set via API), "extension" (server-provided), or "name" (guessed from folder name) |          |

#### MailboxResponseStatus

Additional mailbox statistics

| Name     | Type    | Description                              | Required |
| -------- | ------- | ---------------------------------------- | -------- |
| messages | integer | Message count from STATUS command        | No       |
| unseen   | integer | Unread message count from STATUS command | No       |

#### MailboxResponseItem

| Name             | Type                                                | Description                                          | Required |
| ---------------- | --------------------------------------------------- | ---------------------------------------------------- | -------- |
| path             | string                                              | Full path to the mailbox                             | Yes      |
| delimiter        | string                                              | Hierarchy delimiter character used in paths          | No       |
| parentPath       | string                                              | Path to the parent mailbox                           | Yes      |
| name             | string                                              | Display name of the mailbox                          | Yes      |
| listed           | boolean                                             | Whether this mailbox appears in LIST command results | No       |
| subscribed       | boolean                                             | Whether the user is subscribed to this mailbox       | No       |
| specialUse       | [MailboxSpecialUse](#MailboxSpecialUse)             |                                                      | No       |
| specialUseSource | [MailboxSpecialUseSource](#MailboxSpecialUseSource) |                                                      | No       |
| noInferiors      | boolean                                             | Whether this mailbox can contain child mailboxes     | No       |
| messages         | integer                                             | Total number of messages in the mailbox              | No       |
| uidNext          | integer                                             | Next UID value that will be assigned                 | No       |
| status           | [MailboxResponseStatus](#MailboxResponseStatus)     |                                                      | No       |

#### MailboxesList

| Name          | Type  | Description | Required |
| ------------- | ----- | ----------- | -------- |
| MailboxesList | array |             |          |

#### MailboxesFilterResponse

| Name      | Type                            | Description | Required |
| --------- | ------------------------------- | ----------- | -------- |
| mailboxes | [MailboxesList](#MailboxesList) |             | No       |

#### Model2

| Name        | Type                              | Description                             | Required |
| ----------- | --------------------------------- | --------------------------------------- | -------- |
| account     | string                            | Unique identifier for the email account | Yes      |
| user        | string                            | Username                                | Yes      |
| accessToken | string                            | Access Token                            | Yes      |
| provider    | [OAuth2Provider](#OAuth2Provider) |                                         | Yes      |

#### dkim

DKIM results

| Name | Type   | Description  | Required |
| ---- | ------ | ------------ | -------- |
| dkim | object | DKIM results |          |

#### spf

SPF results

| Name | Type   | Description | Required |
| ---- | ------ | ----------- | -------- |
| spf  | object | SPF results |          |

#### dmarc

DMARC results

| Name  | Type   | Description   | Required |
| ----- | ------ | ------------- | -------- |
| dmarc | object | DMARC results |          |

#### bimi

BIMI results

| Name | Type   | Description  | Required |
| ---- | ------ | ------------ | -------- |
| bimi | object | BIMI results |          |

#### arc

ARC results

| Name | Type   | Description | Required |
| ---- | ------ | ----------- | -------- |
| arc  | object | ARC results |          |

#### mainSig

Primary DKIM signature. `status.aligned` should be set, otherwise DKIM check should not be considered as passed.

| Name    | Type   | Description                                                                                                      | Required |
| ------- | ------ | ---------------------------------------------------------------------------------------------------------------- | -------- |
| mainSig | object | Primary DKIM signature. `status.aligned` should be set, otherwise DKIM check should not be considered as passed. |          |

#### DeliveryCheckResponse

| Name    | Type                | Description            | Required |
| ------- | ------------------- | ---------------------- | -------- |
| success | boolean             | Was the test completed | No       |
| dkim    | [dkim](#dkim)       |                        | No       |
| spf     | [spf](#spf)         |                        | No       |
| dmarc   | [dmarc](#dmarc)     |                        | No       |
| bimi    | [bimi](#bimi)       |                        | No       |
| arc     | [arc](#arc)         |                        | No       |
| mainSig | [mainSig](#mainSig) |                        | No       |

#### queue

Queue ID

| Name  | Type   | Description | Required |
| ----- | ------ | ----------- | -------- |
| queue | string | Queue ID    |          |

#### QueueJobs

| Name    | Type    | Description                                                                      | Required |
| ------- | ------- | -------------------------------------------------------------------------------- | -------- |
| active  | integer | Jobs that are currently being processed                                          | No       |
| delayed | integer | Jobs that are processed in the future                                            | No       |
| paused  | integer | Jobs that would be processed once queue processing is resumed                    | No       |
| waiting | integer | Jobs that should be processed, but are waiting until there are any free handlers | No       |

#### SettingsQueueResponse

| Name   | Type                    | Description                | Required |
| ------ | ----------------------- | -------------------------- | -------- |
| queue  | [queue](#queue)         |                            | Yes      |
| jobs   | [QueueJobs](#QueueJobs) |                            | No       |
| paused | boolean                 | Is the queue paused or not | No       |

#### RequestTemplateContent

| Name        | Type              | Description                                                | Required |
| ----------- | ----------------- | ---------------------------------------------------------- | -------- |
| subject     | string            | Email subject line                                         | No       |
| text        | string            | Plain text message content                                 | No       |
| html        | string            | HTML message content                                       | No       |
| previewText | string            | Preview text shown in email clients after the subject line | No       |
| format      | [format](#format) |                                                            | No       |

#### AccountTemplateResponse

| Name        | Type                                              | Description                             | Required |
| ----------- | ------------------------------------------------- | --------------------------------------- | -------- |
| account     | string                                            | Unique identifier for the email account | Yes      |
| id          | string                                            | Template ID                             | Yes      |
| name        | string                                            | Name of the template                    | Yes      |
| description | string                                            | Optional description of the template    | No       |
| format      | [format](#format)                                 |                                         | No       |
| created     | dateTime                                          | The time this template was created      | No       |
| updated     | dateTime                                          | The time this template was last updated | No       |
| content     | [RequestTemplateContent](#RequestTemplateContent) |                                         | No       |

#### ReferrerAllowlist

HTTP referrer patterns that are allowed to use this token (wildcards supported)

| Name              | Type  | Description                                                                     | Required |
| ----------------- | ----- | ------------------------------------------------------------------------------- | -------- |
| ReferrerAllowlist | array | HTTP referrer patterns that are allowed to use this token (wildcards supported) |          |

#### AddressAllowlist

IP addresses or CIDR ranges allowed to use this token

| Name             | Type  | Description                                           | Required |
| ---------------- | ----- | ----------------------------------------------------- | -------- |
| AddressAllowlist | array | IP addresses or CIDR ranges allowed to use this token |          |

#### AddressRateLimit

Rate limiting configuration for this token

| Name        | Type    | Description                                 | Required |
| ----------- | ------- | ------------------------------------------- | -------- |
| maxRequests | integer | Maximum requests allowed in the time window | No       |
| timeWindow  | integer | Time window duration in seconds             | No       |

#### TokenRestrictions

Security restrictions for API token usage

| Name      | Type                                    | Description | Required |
| --------- | --------------------------------------- | ----------- | -------- |
| referrers | [ReferrerAllowlist](#ReferrerAllowlist) |             | No       |
| addresses | [AddressAllowlist](#AddressAllowlist)   |             | No       |
| rateLimit | [AddressRateLimit](#AddressRateLimit)   |             | No       |

#### AccountTokensItem

| Name         | Type                                    | Description                             | Required |
| ------------ | --------------------------------------- | --------------------------------------- | -------- |
| account      | string                                  | Unique identifier for the email account | Yes      |
| description  | string                                  | Token description                       | Yes      |
| metadata     | string                                  | Related metadata in JSON format         | No       |
| restrictions | [TokenRestrictions](#TokenRestrictions) |                                         | No       |
| ip           | string                                  | IP address of the requester             | No       |

#### AccountTokensEntries

| Name                 | Type  | Description | Required |
| -------------------- | ----- | ----------- | -------- |
| AccountTokensEntries | array |             |          |

#### AccountsTokensResponse

| Name   | Type                                          | Description | Required |
| ------ | --------------------------------------------- | ----------- | -------- |
| tokens | [AccountTokensEntries](#AccountTokensEntries) |             | No       |

#### WebhookRouteContent

| Name | Type   | Description      | Required |
| ---- | ------ | ---------------- | -------- |
| fn   | string | Filter function  | No       |
| map  | string | Mapping function | No       |

#### WebhookRouteResponse

| Name        | Type                                        | Description                                                          | Required |
| ----------- | ------------------------------------------- | -------------------------------------------------------------------- | -------- |
| id          | string                                      | Webhook ID                                                           | Yes      |
| name        | string                                      | Name of the route                                                    | Yes      |
| description | string                                      | Optional description of the webhook route                            | No       |
| created     | dateTime                                    | The time this route was created                                      | No       |
| updated     | dateTime                                    | The time this route was last updated                                 | No       |
| enabled     | boolean                                     | Is the route enabled                                                 | No       |
| targetUrl   | string                                      | Target URL that will receive webhook notifications via POST requests | No       |
| tcount      | integer                                     | How many times this route has been applied                           | No       |
| content     | [WebhookRouteContent](#WebhookRouteContent) |                                                                      | No       |

#### MessageHeaders

Raw email headers as key-value pairs (arrays contain multiple values for headers that appear multiple times). Not available for MS Graph API.

| Name           | Type   | Description                                                                                                                                   | Required |
| -------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| MessageHeaders | object | Raw email headers as key-value pairs (arrays contain multiple values for headers that appear multiple times). Not available for MS Graph API. |          |

#### TextInfoDetails

| Name        | Type                        | Description                                                                                         | Required |
| ----------- | --------------------------- | --------------------------------------------------------------------------------------------------- | -------- |
| id          | string                      | Identifier for fetching additional text content                                                     | No       |
| encodedSize | [encodedSize](#encodedSize) |                                                                                                     | No       |
| plain       | string                      | Plain text version of the message                                                                   | No       |
| html        | string                      | HTML version of the message                                                                         | No       |
| hasMore     | boolean                     | Whether the message content was truncated (true if more content is available via separate API call) | No       |

#### BounceResponse

| Name    | Type   | Description                             | Required |
| ------- | ------ | --------------------------------------- | -------- |
| message | string | Error message from the receiving server | No       |
| status  | string | SMTP status code                        | No       |

#### BounceEntry

| Name      | Type                              | Description                                       | Required |
| --------- | --------------------------------- | ------------------------------------------------- | -------- |
| message   | string                            | EmailEngine identifier of the bounce notification | Yes      |
| recipient | string                            | Email address that bounced                        | No       |
| action    | string                            | Bounce action (failed, delayed, etc.)             | No       |
| response  | [BounceResponse](#BounceResponse) |                                                   | No       |
| date      | dateTime                          | When the bounce was detected                      | No       |

#### BounceList

| Name       | Type  | Description | Required |
| ---------- | ----- | ----------- | -------- |
| BounceList | array |             |          |

#### Model3

Special folder type of the mailbox containing this message

| Name   | Type   | Description                                                | Required |
| ------ | ------ | ---------------------------------------------------------- | -------- |
| Model3 | string | Special folder type of the mailbox containing this message |          |

#### MessageSpecialUse

Special folder type where this message is stored

| Name              | Type   | Description                                      | Required |
| ----------------- | ------ | ------------------------------------------------ | -------- |
| MessageSpecialUse | string | Special folder type where this message is stored |          |

#### MessageDetails

| Name              | Type                                    | Description                                                                                     | Required |
| ----------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| id                | string                                  | EmailEngine message identifier                                                                  | No       |
| uid               | integer                                 | IMAP UID (unique identifier within the mailbox)                                                 | No       |
| emailId           | string                                  | Globally unique email identifier (when supported by the email server)                           | No       |
| threadId          | string                                  | Thread identifier for email conversations (when supported by the email server)                  | No       |
| date              | dateTime                                | Date when the message was received by the mail server                                           | No       |
| draft             | boolean                                 | Whether this message is a draft                                                                 | No       |
| unseen            | boolean                                 | Whether this message is unread                                                                  | No       |
| flagged           | boolean                                 | Whether this message is flagged/starred                                                         | No       |
| size              | integer                                 | Message size in bytes                                                                           | No       |
| subject           | string                                  | Message subject line                                                                            | No       |
| from              | [FromAddress](#FromAddress)             |                                                                                                 | No       |
| sender            | [FromAddress](#FromAddress)             |                                                                                                 | No       |
| to                | [AddressList](#AddressList)             |                                                                                                 | No       |
| cc                | [AddressList](#AddressList)             |                                                                                                 | No       |
| bcc               | [AddressList](#AddressList)             |                                                                                                 | No       |
| replyTo           | [AddressList](#AddressList)             |                                                                                                 | No       |
| messageId         | string                                  | Message-ID header value                                                                         | No       |
| inReplyTo         | string                                  | Message-ID of the message this is replying to                                                   | No       |
| flags             | [FlagList](#FlagList)                   |                                                                                                 | No       |
| labels            | [LabelList](#LabelList)                 |                                                                                                 | No       |
| attachments       | [AttachmentList](#AttachmentList)       |                                                                                                 | No       |
| headers           | [MessageHeaders](#MessageHeaders)       |                                                                                                 | No       |
| text              | [TextInfoDetails](#TextInfoDetails)     |                                                                                                 | No       |
| bounces           | [BounceList](#BounceList)               |                                                                                                 | No       |
| isAutoReply       | boolean                                 | Whether this message appears to be an automatic reply (out of office, vacation responder, etc.) | No       |
| specialUse        | [Model3](#Model3)                       |                                                                                                 | No       |
| messageSpecialUse | [MessageSpecialUse](#MessageSpecialUse) |                                                                                                 | No       |

#### TextResponse

| Name    | Type    | Description                              | Required |
| ------- | ------- | ---------------------------------------- | -------- |
| plain   | string  | Plaintext content                        | No       |
| html    | string  | HTML content                             | No       |
| hasMore | boolean | Is the current text output capped or not | No       |

#### ImapConfiguration

IMAP configuration

| Name            | Type                              | Description                                                                                                       | Required |
| --------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- |
| auth            | [Authentication](#Authentication) |                                                                                                                   | No       |
| useAuthServer   | boolean                           | Use external authentication server to retrieve credentials dynamically                                            | No       |
| host            | string                            | IMAP server hostname                                                                                              | No       |
| port            | integer                           | IMAP server port (typically 993 for IMAP over TLS, 143 for STARTTLS)                                              | No       |
| secure          | boolean                           | Use TLS encryption for the connection (true for port 993, false for STARTTLS on port 143)                         | No       |
| tls             | [TLS](#TLS)                       |                                                                                                                   | No       |
| resyncDelay     | integer                           | Delay in seconds between full mailbox resynchronizations                                                          | No       |
| disabled        | boolean                           | Temporarily disable IMAP operations for this account                                                              | No       |
| sentMailPath    | string                            | Custom folder path for sent messages. Defaults to auto-detected "Sent" folder. Set to null to use default.        | No       |
| draftsMailPath  | string                            | Custom folder path for draft messages. Defaults to auto-detected "Drafts" folder. Set to null to use default.     | No       |
| junkMailPath    | string                            | Custom folder path for spam/junk messages. Defaults to auto-detected "Junk" folder. Set to null to use default.   | No       |
| trashMailPath   | string                            | Custom folder path for deleted messages. Defaults to auto-detected "Trash" folder. Set to null to use default.    | No       |
| archiveMailPath | string                            | Custom folder path for archived messages. Defaults to auto-detected "Archive" folder. Set to null to use default. | No       |

#### SmtpConfiguration

SMTP configuration

| Name          | Type              | Description                                                                               | Required |
| ------------- | ----------------- | ----------------------------------------------------------------------------------------- | -------- |
| auth          | [Model1](#Model1) |                                                                                           | No       |
| useAuthServer | boolean           | Use external authentication server to retrieve credentials dynamically                    | No       |
| host          | string            | SMTP server hostname                                                                      | Yes      |
| port          | integer           | SMTP server port (typically 587 for STARTTLS, 465 for SMTP over TLS, 25 for unencrypted)  | Yes      |
| secure        | boolean           | Use TLS encryption from the start (true for port 465, false for STARTTLS on ports 587/25) | No       |
| tls           | [TLS](#TLS)       |                                                                                           | No       |

#### OAuth2

OAuth2 configuration

| Name          | Type                                          | Description                                                                                                             | Required |
| ------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| authorize     | boolean                                       | Request an OAuth2 authorization URL instead of directly configuring credentials                                         | No       |
| redirectUrl   | string                                        | URL to redirect to after OAuth2 authorization completes (only used when authorize=true)                                 | No       |
| provider      | string                                        | OAuth2 Application ID configured in EmailEngine                                                                         | No       |
| auth          | [OAuth2Authentication](#OAuth2Authentication) |                                                                                                                         | Yes      |
| useAuthServer | boolean                                       | Use external authentication server for token management instead of EmailEngine                                          | No       |
| accessToken   | string                                        | OAuth2 access token for the email account                                                                               | No       |
| refreshToken  | string                                        | OAuth2 refresh token for obtaining new access tokens                                                                    | No       |
| authority     | string                                        | Microsoft account type: "consumers" (personal), "organizations" (work/school), "common" (both), or a specific tenant ID | No       |
| expires       | dateTime                                      | Access token expiration timestamp                                                                                       | No       |

#### CreateAccount

| Name                  | Type                                                          | Description                                                                                                                                                             | Required |
| --------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| account               | string                                                        | Account ID. If set to `null`, a unique ID will be generated automatically. If you provide an existing account ID, the settings for that account will be updated instead | Yes      |
| name                  | string                                                        | Display name for the account                                                                                                                                            | Yes      |
| email                 | string                                                        | Default email address of the account                                                                                                                                    | No       |
| path                  | [AccountPath](#AccountPath)                                   |                                                                                                                                                                         | No       |
| subconnections        | [SubconnectionPaths](#SubconnectionPaths)                     |                                                                                                                                                                         | No       |
| webhooks              | string                                                        | Account-specific webhook URL                                                                                                                                            | No       |
| copy                  | boolean                                                       | Copy submitted messages to Sent folder. Set to `null` to unset and use provider specific default.                                                                       | No       |
| logs                  | boolean                                                       | Store recent logs                                                                                                                                                       | No       |
| notifyFrom            | dateTime                                                      | Only send webhooks for messages received after this date. Defaults to account creation time. IMAP only.                                                                 | No       |
| proxy                 | string                                                        | Proxy server URL for outbound connections                                                                                                                               | No       |
| smtpEhloName          | string                                                        | Hostname to use in SMTP EHLO/HELO commands (defaults to system hostname)                                                                                                | No       |
| imapIndexer           | [IMAPIndexer](#IMAPIndexer)                                   |                                                                                                                                                                         | No       |
| imap                  | [ImapConfiguration](#ImapConfiguration)                       |                                                                                                                                                                         | No       |
| smtp                  | [SmtpConfiguration](#SmtpConfiguration)                       |                                                                                                                                                                         | No       |
| oauth2                | [OAuth2](#OAuth2)                                             |                                                                                                                                                                         | No       |
| webhooksCustomHeaders | [AccountWebhooksCustomHeaders](#AccountWebhooksCustomHeaders) |                                                                                                                                                                         | No       |
| locale                | string                                                        | Optional locale                                                                                                                                                         | No       |
| tz                    | string                                                        | Optional timezone                                                                                                                                                       | No       |

#### CreateAccountState

Is the account new or updated existing

| Name               | Type   | Description                            | Required |
| ------------------ | ------ | -------------------------------------- | -------- |
| CreateAccountState | string | Is the account new or updated existing |          |

#### CreateAccountResponse

| Name    | Type                                      | Description                             | Required |
| ------- | ----------------------------------------- | --------------------------------------- | -------- |
| account | string                                    | Unique identifier for the email account | Yes      |
| state   | [CreateAccountState](#CreateAccountState) |                                         | Yes      |

#### CreateGateway

| Name    | Type    | Description                                          | Required |
| ------- | ------- | ---------------------------------------------------- | -------- |
| gateway | string  | Gateway ID                                           | Yes      |
| name    | string  | Account Name                                         | Yes      |
| user    | string  |                                                      | No       |
| pass    | string  |                                                      | No       |
| host    | string  | Hostname to connect to                               | Yes      |
| port    | integer | Service port number                                  | Yes      |
| secure  | boolean | Should connection use TLS. Usually true for port 465 | No       |

#### CreateGatewayState

Is the gateway new or updated existing

| Name               | Type   | Description                            | Required |
| ------------------ | ------ | -------------------------------------- | -------- |
| CreateGatewayState | string | Is the gateway new or updated existing |          |

#### CreateGatewayResponse

| Name    | Type                                      | Description | Required |
| ------- | ----------------------------------------- | ----------- | -------- |
| gateway | string                                    | Gateway ID  | Yes      |
| state   | [CreateGatewayState](#CreateGatewayState) |             | Yes      |

#### RegisterLicense

| Name    | Type   | Description  | Required |
| ------- | ------ | ------------ | -------- |
| license | string | License file | Yes      |

#### provider

OAuth2 provider type

| Name     | Type   | Description          | Required |
| -------- | ------ | -------------------- | -------- |
| provider | string | OAuth2 provider type |          |

#### Model4

Connection type (IMAP, API, or Pub/Sub)

| Name   | Type   | Description                             | Required |
| ------ | ------ | --------------------------------------- | -------- |
| Model4 | string | Connection type (IMAP, API, or Pub/Sub) |          |

#### pubSubApp

Pub/Sub application ID for Gmail push notifications

| Name      | Type   | Description                                         | Required |
| --------- | ------ | --------------------------------------------------- | -------- |
| pubSubApp | string | Pub/Sub application ID for Gmail push notifications |          |

#### extraScopes

| Name        | Type  | Description | Required |
| ----------- | ----- | ----------- | -------- |
| extraScopes | array |             |          |

#### skipScopes

| Name       | Type  | Description | Required |
| ---------- | ----- | ----------- | -------- |
| skipScopes | array |             |          |

#### CreateOAuth2App

| Name                    | Type                                              | Description                                                                     | Required |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| name                    | string                                            | Display name for the OAuth2 application                                         | Yes      |
| description             | string                                            | Detailed description of the application                                         | No       |
| title                   | string                                            | Short title shown on the OAuth2 button                                          | No       |
| provider                | [provider](#provider)                             |                                                                                 | Yes      |
| enabled                 | boolean                                           | Whether this OAuth2 app is active                                               | No       |
| clientId                | string                                            | OAuth2 client ID from the provider                                              | No       |
| clientSecret            | string                                            | OAuth2 client secret from the provider                                          | No       |
| baseScopes              | [Model4](#Model4)                                 |                                                                                 | No       |
| pubSubApp               | [pubSubApp](#pubSubApp)                           |                                                                                 | No       |
| extraScopes             | [extraScopes](#extraScopes)                       |                                                                                 | No       |
| skipScopes              | [skipScopes](#skipScopes)                         |                                                                                 | No       |
| serviceClient           | string                                            | Service account unique ID (for 2-legged OAuth2)                                 | Yes      |
| googleProjectId         | [googleProjectId](#googleProjectId)               |                                                                                 | No       |
| googleWorkspaceAccounts | boolean                                           | Restrict OAuth2 login to Google Workspace accounts only                         | No       |
| googleTopicName         | [googleTopicName](#googleTopicName)               |                                                                                 | No       |
| googleSubscriptionName  | [googleSubscriptionName](#googleSubscriptionName) |                                                                                 | No       |
| serviceClientEmail      | string                                            | Service account email address                                                   | Yes      |
| serviceKey              | string                                            | Service account private key in PEM format                                       | Yes      |
| authority               | string                                            | Microsoft tenant configuration (common, organizations, consumers, or tenant ID) | Yes      |
| cloud                   | string                                            | Microsoft Azure cloud environment                                               | No       |
| redirectUrl             | string                                            | OAuth2 redirect URI configured in the provider                                  | No       |

#### CreateAppResponse

| Name    | Type    | Description           | Required |
| ------- | ------- | --------------------- | -------- |
| id      | string  | OAuth2 application ID | Yes      |
| created | boolean | Was the app created   | No       |

#### Settings

| Name                      | Type                                            | Description                                                                                                     | Required |
| ------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| webhooksEnabled           | boolean                                         | Enable or disable webhook delivery for all accounts                                                             | No       |
| webhooks                  | string                                          | Target URL that will receive webhook notifications via POST requests                                            | No       |
| webhookEvents             | [webhookEvents](#webhookEvents)                 |                                                                                                                 | No       |
| webhooksCustomHeaders     | [WebhooksCustomHeaders](#WebhooksCustomHeaders) |                                                                                                                 | No       |
| notifyHeaders             | [notifyHeaders](#notifyHeaders)                 |                                                                                                                 | No       |
| serviceUrl                | string                                          | Base URL of this EmailEngine instance (used for generating public URLs, path component is ignored)              | No       |
| notificationBaseUrl       | string                                          | Public callback URL for external OAuth providers. Falls back to serviceUrl if not set                           | No       |
| trackClicks               | boolean                                         | Rewrite links in outgoing HTML emails to track click-through rates                                              | No       |
| trackOpens                | boolean                                         | Insert a tracking pixel in outgoing HTML emails to detect when messages are opened                              | No       |
| imapIndexer               | [imapIndexer](#imapIndexer)                     |                                                                                                                 | No       |
| resolveGmailCategories    | boolean                                         | Automatically detect and categorize Gmail tabs (Primary, Social, Promotions, etc.) for IMAP connections         | No       |
| ignoreMailCertErrors      | boolean                                         | Allow connections to mail servers with self-signed or invalid TLS certificates (not recommended for production) | No       |
| generateEmailSummary      | boolean                                         | Generate AI-powered summaries for incoming emails using OpenAI                                                  | No       |
| openAiAPIKey              | string                                          | Your OpenAI API key for AI features                                                                             | No       |
| openAiModel               | string                                          | OpenAI model to use for text generation                                                                         | No       |
| openAiAPIUrl              | string                                          | Base URL for OpenAI API (change for OpenAI-compatible services)                                                 | No       |
| openAiTemperature         | number                                          | Controls randomness in AI responses (0 = deterministic, 2 = very creative)                                      | No       |
| openAiTopP                | number                                          | Nucleus sampling parameter for AI text generation (0-1, lower = more focused)                                   | No       |
| openAiPrompt              | string                                          | Custom system prompt to guide AI behavior when processing emails                                                | No       |
| openAiGenerateEmbeddings  | boolean                                         | Generate vector embeddings for semantic search and similarity matching                                          | No       |
| inboxNewOnly              | boolean                                         | Trigger "messageNew" webhooks only for messages arriving in the Inbox folder                                    | No       |
| serviceSecret             | string                                          | HMAC secret for signing API requests and validating webhooks                                                    | No       |
| authServer                | string                                          | External authentication service URL for retrieving mailbox credentials dynamically                              | No       |
| proxyEnabled              | boolean                                         | Route outbound connections through a proxy server                                                               | No       |
| proxyUrl                  | string                                          | Proxy server URL for outbound connections                                                                       | No       |
| smtpEhloName              | string                                          | Hostname to use in SMTP EHLO/HELO commands (defaults to system hostname)                                        | No       |
| notifyText                | boolean                                         | Include plain text message content in webhook payloads                                                          | No       |
| notifyWebSafeHtml         | boolean                                         | Sanitize HTML content to remove potentially dangerous elements before including in webhooks                     | No       |
| notifyTextSize            | integer                                         | Maximum size (in bytes) of text content to include in webhook payloads                                          | No       |
| notifyAttachments         | boolean                                         | Include attachment data in webhook payloads                                                                     | No       |
| notifyAttachmentSize      | integer                                         | Maximum size (in bytes) per attachment to include in webhook payloads                                           | No       |
| notifyCalendarEvents      | boolean                                         | Include parsed calendar event data in webhook payloads                                                          | No       |
| logs                      | [LogSettings](#LogSettings)                     |                                                                                                                 | No       |
| imapStrategy              | [imapStrategy](#imapStrategy)                   |                                                                                                                 | No       |
| smtpStrategy              | [smtpStrategy](#smtpStrategy)                   |                                                                                                                 | No       |
| localAddresses            | [localAddresses](#localAddresses)               |                                                                                                                 | No       |
| smtpServerEnabled         | boolean                                         | Enable the built-in SMTP server for receiving emails                                                            | No       |
| smtpServerPort            | integer                                         | Port number for the built-in SMTP server                                                                        | No       |
| smtpServerHost            | string                                          | IP address to bind the SMTP server to (empty = all interfaces)                                                  | No       |
| smtpServerProxy           | boolean                                         | Enable PROXY protocol support for the SMTP server                                                               | No       |
| smtpServerAuthEnabled     | boolean                                         | Require SMTP authentication for incoming connections                                                            | No       |
| smtpServerPassword        | string                                          | Password for SMTP authentication (null = disable authentication)                                                | No       |
| smtpServerTLSEnabled      | boolean                                         | Enable TLS/STARTTLS support for the SMTP server                                                                 | No       |
| imapProxyServerEnabled    | boolean                                         | Enable the IMAP proxy server                                                                                    | No       |
| imapProxyServerPort       | integer                                         | Port number for the IMAP proxy server                                                                           | No       |
| imapProxyServerHost       | string                                          | IP address to bind the IMAP proxy to (empty = all interfaces)                                                   | No       |
| imapProxyServerProxy      | boolean                                         | Enable PROXY protocol support for the IMAP proxy                                                                | No       |
| imapProxyServerPassword   | string                                          | Password for IMAP proxy authentication (null = disable authentication)                                          | No       |
| imapProxyServerTLSEnabled | boolean                                         | Enable TLS support for the IMAP proxy                                                                           | No       |
| queueKeep                 | integer                                         | Number of completed and failed queue entries to retain for debugging                                            | No       |
| deliveryAttempts          | integer                                         | Maximum number of delivery attempts before marking a message as permanently failed                              | No       |
| templateHeader            | string                                          | Custom HTML to inject at the top of hosted pages (e.g., for branding)                                           | No       |
| templateHtmlHead          | string                                          | Custom HTML to inject into the <head> section of hosted pages (e.g., for analytics)                             | No       |
| scriptEnv                 | string                                          | JSON object containing environment variables available to pre-processing scripts                                | No       |
| enableApiProxy            | boolean                                         | Trust X-Forwarded-\* headers when behind a reverse proxy                                                        | No       |
| locale                    | [locale](#locale)                               |                                                                                                                 | No       |
| timezone                  | string                                          | Default timezone for date/time display (IANA timezone identifier)                                               | No       |
| pageBrandName             | string                                          | Brand name displayed in page titles                                                                             | No       |
| openAiPreProcessingFn     | string                                          | JavaScript function to filter emails before AI processing (return true to process, false to skip)               | No       |
| imapClientName            | string                                          | Client name advertised via IMAP ID extension                                                                    | No       |
| imapClientVersion         | string                                          | Client version advertised via IMAP ID extension                                                                 | No       |
| imapClientVendor          | string                                          | Vendor name advertised via IMAP ID extension                                                                    | No       |
| imapClientSupportUrl      | string                                          | Support URL advertised via IMAP ID extension                                                                    | No       |

#### UpdatedSettings

List of updated setting keys

| Name            | Type  | Description                  | Required |
| --------------- | ----- | ---------------------------- | -------- |
| UpdatedSettings | array | List of updated setting keys |          |

#### SettingsUpdatedResponse

| Name    | Type                                | Description | Required |
| ------- | ----------------------------------- | ----------- | -------- |
| updated | [UpdatedSettings](#UpdatedSettings) |             | No       |

#### TokenScope

| Name       | Type   | Description | Required |
| ---------- | ------ | ----------- | -------- |
| TokenScope | string |             |          |

#### Scopes

| Name   | Type  | Description | Required |
| ------ | ----- | ----------- | -------- |
| Scopes | array |             |          |

#### CreateToken

| Name         | Type                                    | Description                             | Required |
| ------------ | --------------------------------------- | --------------------------------------- | -------- |
| account      | string                                  | Unique identifier for the email account | Yes      |
| description  | string                                  | Token description                       | Yes      |
| scopes       | [Scopes](#Scopes)                       |                                         | Yes      |
| metadata     | string                                  | Related metadata in JSON format         | No       |
| restrictions | [TokenRestrictions](#TokenRestrictions) |                                         | No       |
| ip           | string                                  | IP address of the requester             | No       |

#### CreateTokenResponse

| Name  | Type   | Description  | Required |
| ----- | ------ | ------------ | -------- |
| token | string | Access token | Yes      |

#### VerifyAccount

| Name         | Type                                    | Description                                                              | Required |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------ | -------- |
| mailboxes    | boolean                                 | Include mailbox listing in response                                      | No       |
| imap         | [ImapConfiguration](#ImapConfiguration) |                                                                          | No       |
| smtp         | [SmtpConfiguration](#SmtpConfiguration) |                                                                          | No       |
| proxy        | string                                  | Proxy server URL for outbound connections                                | No       |
| smtpEhloName | string                                  | Hostname to use in SMTP EHLO/HELO commands (defaults to system hostname) | No       |

#### imap

| Name    | Type    | Description                                                         | Required |
| ------- | ------- | ------------------------------------------------------------------- | -------- |
| success | boolean | Was IMAP account verified                                           | No       |
| error   | string  | Error messages for IMAP verification. Only present if success=false | No       |
| code    | string  | Error code. Only present if success=false                           | No       |

#### smtp

| Name    | Type    | Description                                                         | Required |
| ------- | ------- | ------------------------------------------------------------------- | -------- |
| success | boolean | Was SMTP account verified                                           | No       |
| error   | string  | Error messages for SMTP verification. Only present if success=false | No       |
| code    | string  | Error code. Only present if success=false                           | No       |

#### MailboxShortResponseItem

| Name       | Type                                    | Description                                          | Required |
| ---------- | --------------------------------------- | ---------------------------------------------------- | -------- |
| path       | string                                  | Full path to the mailbox                             | Yes      |
| delimiter  | string                                  | Hierarchy delimiter character used in paths          | No       |
| parentPath | string                                  | Path to the parent mailbox                           | Yes      |
| name       | string                                  | Display name of the mailbox                          | Yes      |
| listed     | boolean                                 | Whether this mailbox appears in LIST command results | No       |
| subscribed | boolean                                 | Whether the user is subscribed to this mailbox       | No       |
| specialUse | [MailboxSpecialUse](#MailboxSpecialUse) |                                                      | No       |

#### mailboxes

| Name      | Type  | Description | Required |
| --------- | ----- | ----------- | -------- |
| mailboxes | array |             |          |

#### VerifyAccountResponse

| Name      | Type                    | Description | Required |
| --------- | ----------------------- | ----------- | -------- |
| imap      | [imap](#imap)           |             | No       |
| smtp      | [smtp](#smtp)           |             | No       |
| mailboxes | [mailboxes](#mailboxes) |             | No       |

#### AccountFormPath

Mailbox folders to monitor for changes (IMAP only). Use "\*" to monitor all folders (default). While you can still access unmonitored folders via API, you won't receive webhooks for changes in those folders.

| Name            | Type  | Description                                                                                                                                                                                                     | Required |
| --------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AccountFormPath | array | Mailbox folders to monitor for changes (IMAP only). Use "\*" to monitor all folders (default). While you can still access unmonitored folders via API, you won't receive webhooks for changes in those folders. |          |

#### DefaultAccountType

Pre-select a specific account type (use "imap" or an OAuth2 app ID) instead of showing the selection screen

| Name               | Type   | Description                                                                                                 | Required |
| ------------------ | ------ | ----------------------------------------------------------------------------------------------------------- | -------- |
| DefaultAccountType | string | Pre-select a specific account type (use "imap" or an OAuth2 app ID) instead of showing the selection screen |          |

#### RequestAuthForm

| Name           | Type                                      | Description                                                                                                                                                             | Required |
| -------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| account        | string                                    | Account ID. If set to `null`, a unique ID will be generated automatically. If you provide an existing account ID, the settings for that account will be updated instead | No       |
| name           | string                                    | Display name for the account                                                                                                                                            | No       |
| email          | string                                    | Specifies the default email address for this account. Users can change it if needed.                                                                                    | No       |
| delegated      | boolean                                   | If true, configures this account as a shared mailbox. Currently supported by MS365 OAuth2 accounts                                                                      | No       |
| notifyFrom     | dateTime                                  | Only send webhooks for messages received after this date. Defaults to account creation time. IMAP only.                                                                 | No       |
| subconnections | [SubconnectionPaths](#SubconnectionPaths) |                                                                                                                                                                         | No       |
| path           | [AccountFormPath](#AccountFormPath)       |                                                                                                                                                                         | No       |
| redirectUrl    | string                                    | After the authentication process is completed, the user is redirected to this URL                                                                                       | Yes      |
| type           | [DefaultAccountType](#DefaultAccountType) |                                                                                                                                                                         | No       |

#### RequestAuthFormResponse

| Name | Type   | Description                                     | Required |
| ---- | ------ | ----------------------------------------------- | -------- |
| url  | string | Generated URL to the hosted authentication form | Yes      |

#### BlocklistListAddPayload

| Name      | Type   | Description                             | Required |
| --------- | ------ | --------------------------------------- | -------- |
| account   | string | Unique identifier for the email account | Yes      |
| recipient | string | Email address to add to the list        | Yes      |
| reason    | string | Identifier for the blocking reason      | No       |

#### BlocklistListAddResponse

| Name    | Type    | Description                       | Required |
| ------- | ------- | --------------------------------- | -------- |
| success | boolean | Was the request successful        | No       |
| added   | boolean | Was the address added to the list | No       |

#### CreateTemplateContent

| Name        | Type   | Description                                                | Required |
| ----------- | ------ | ---------------------------------------------------------- | -------- |
| subject     | string | Email subject line                                         | No       |
| text        | string | Plain text message content                                 | No       |
| html        | string | HTML message content                                       | No       |
| previewText | string | Preview text shown in email clients after the subject line | No       |

#### CreateTemplate

| Name        | Type                                            | Description                                  | Required |
| ----------- | ----------------------------------------------- | -------------------------------------------- | -------- |
| account     | string                                          | Account ID. Use `null` for public templates. | Yes      |
| name        | string                                          | Name of the template                         | Yes      |
| description | string                                          | Optional description of the template         | No       |
| format      | [format](#format)                               |                                              | No       |
| content     | [CreateTemplateContent](#CreateTemplateContent) |                                              | Yes      |

#### CreateTemplateResponse

| Name    | Type    | Description                             | Required |
| ------- | ------- | --------------------------------------- | -------- |
| created | boolean | Was the template created or not         | No       |
| account | string  | Unique identifier for the email account | Yes      |
| id      | string  | Template ID                             | Yes      |

#### Flags

Message flags

| Name  | Type  | Description   | Required |
| ----- | ----- | ------------- | -------- |
| Flags | array | Message flags |          |

#### action

Action type: "reply" (reply to sender), "reply-all" (reply to all recipients), or "forward" (forward to new recipients)

| Name   | Type   | Description                                                                                                             | Required |
| ------ | ------ | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| action | string | Action type: "reply" (reply to sender), "reply-all" (reply to all recipients), or "forward" (forward to new recipients) |          |

#### MessageReference

Configuration for replying to or forwarding an existing message

| Name               | Type              | Description                                                                        | Required |
| ------------------ | ----------------- | ---------------------------------------------------------------------------------- | -------- |
| message            | string            | EmailEngine message ID to reply to or forward                                      | Yes      |
| action             | [action](#action) |                                                                                    | No       |
| inline             | boolean           | Include the original message as quoted text in the response                        | No       |
| forwardAttachments | boolean           | Include original attachments when forwarding                                       | No       |
| ignoreMissing      | boolean           | Continue sending even if the referenced message cannot be found                    | No       |
| messageId          | string            | Verify the Message-ID of the referenced email matches this value before proceeding | No       |

#### Model5

| Name    | Type   | Description | Required |
| ------- | ------ | ----------- | -------- |
| name    | string |             | No       |
| address | string |             | Yes      |

#### Model6

List of addresses

| Name   | Type  | Description       | Required |
| ------ | ----- | ----------------- | -------- |
| Model6 | array | List of addresses |          |

#### Model7

List of addresses

| Name   | Type  | Description       | Required |
| ------ | ----- | ----------------- | -------- |
| Model7 | array | List of addresses |          |

#### Model8

List of addresses

| Name   | Type  | Description       | Required |
| ------ | ----- | ----------------- | -------- |
| Model8 | array | List of addresses |          |

#### contentDisposition

| Name               | Type   | Description | Required |
| ------------------ | ------ | ----------- | -------- |
| contentDisposition | string |             |          |

#### encoding

| Name     | Type   | Description | Required |
| -------- | ------ | ----------- | -------- |
| encoding | string |             |          |

#### reference

References an existing attachment by its ID instead of providing new attachment content. If this field is set, the `content` field must not be included. If not set, the `content` field is required.

| Name      | Type   | Description                                                                                                                                                                                           | Required |
| --------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| reference | string | References an existing attachment by its ID instead of providing new attachment content. If this field is set, the `content` field must not be included. If not set, the `content` field is required. |          |

#### UploadAttachment

| Name               | Type                                      | Description                          | Required |
| ------------------ | ----------------------------------------- | ------------------------------------ | -------- |
| filename           | string                                    |                                      | No       |
| content            | string                                    | Base64 formatted attachment file     | Yes      |
| contentType        | string                                    |                                      | No       |
| contentDisposition | [contentDisposition](#contentDisposition) |                                      | No       |
| cid                | string                                    | Content-ID value for embedded images | No       |
| encoding           | [encoding](#encoding)                     |                                      | No       |
| reference          | [reference](#reference)                   |                                      | No       |

#### UploadAttachmentList

List of attachments

| Name                 | Type  | Description         | Required |
| -------------------- | ----- | ------------------- | -------- |
| UploadAttachmentList | array | List of attachments |          |

#### CustomHeaders

Custom Headers

| Name          | Type   | Description    | Required |
| ------------- | ------ | -------------- | -------- |
| CustomHeaders | object | Custom Headers |          |

#### MessageUpload

| Name         | Type                                          | Description                                                                                                                                                           | Required |
| ------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| path         | string                                        | Target mailbox folder path                                                                                                                                            | Yes      |
| flags        | [Flags](#Flags)                               |                                                                                                                                                                       | No       |
| internalDate | dateTime                                      | Sets the internal date for this message                                                                                                                               | No       |
| reference    | [MessageReference](#MessageReference)         |                                                                                                                                                                       | No       |
| raw          | string                                        | A Base64-encoded email message in RFC 822 format. If you provide other fields along with raw, those fields will override the corresponding values in the raw message. | No       |
| from         | [FromAddress](#FromAddress)                   |                                                                                                                                                                       | No       |
| to           | [Model6](#Model6)                             |                                                                                                                                                                       | No       |
| cc           | [Model7](#Model7)                             |                                                                                                                                                                       | No       |
| bcc          | [Model8](#Model8)                             |                                                                                                                                                                       | No       |
| subject      | string                                        | Message subject                                                                                                                                                       | No       |
| text         | string                                        | Message Text                                                                                                                                                          | No       |
| html         | string                                        | Message HTML                                                                                                                                                          | No       |
| attachments  | [UploadAttachmentList](#UploadAttachmentList) |                                                                                                                                                                       | No       |
| messageId    | string                                        | Message ID                                                                                                                                                            | No       |
| headers      | [CustomHeaders](#CustomHeaders)               |                                                                                                                                                                       | No       |
| locale       | string                                        | Optional locale                                                                                                                                                       | No       |
| tz           | string                                        | Optional timezone                                                                                                                                                     | No       |

#### ResponseReference

Reference info if referencing was requested

| Name    | Type    | Description                                              | Required |
| ------- | ------- | -------------------------------------------------------- | -------- |
| message | string  | Referenced message ID                                    | Yes      |
| success | boolean | Was the referenced message processed                     | No       |
| error   | string  | An error message if referenced message processing failed | No       |

#### MessageUploadResponse

| Name        | Type                                    | Description                                                                                                                    | Required |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- |
| id          | string                                  | Unique identifier for the message. NB! This and other fields might not be present if server did not provide enough information | No       |
| path        | string                                  | Folder this message was uploaded to                                                                                            | No       |
| uid         | integer                                 | UID of uploaded message                                                                                                        | No       |
| uidValidity | string                                  | UIDVALIDTITY of the target folder. Numeric value cast as string.                                                               | No       |
| seq         | integer                                 | Sequence number of uploaded message                                                                                            | No       |
| messageId   | string                                  | Message ID                                                                                                                     | No       |
| reference   | [ResponseReference](#ResponseReference) |                                                                                                                                | No       |

#### MailboxPath

Mailbox path as an array or a string. If account is namespaced then namespace prefix is added by default.

| Name        | Type  | Description                                                                                               | Required |
| ----------- | ----- | --------------------------------------------------------------------------------------------------------- | -------- |
| MailboxPath | array | Mailbox path as an array or a string. If account is namespaced then namespace prefix is added by default. |          |

#### CreateMailbox

| Name | Type                        | Description | Required |
| ---- | --------------------------- | ----------- | -------- |
| path | [MailboxPath](#MailboxPath) |             | No       |

#### CreateMailboxResponse

| Name      | Type    | Description                        | Required |
| --------- | ------- | ---------------------------------- | -------- |
| path      | string  | Full path to mailbox               | Yes      |
| mailboxId | string  | Mailbox ID (if server has support) | No       |
| created   | boolean | Was the mailbox created            | No       |

#### Headers

Search specific email headers

| Name    | Type   | Description                   | Required |
| ------- | ------ | ----------------------------- | -------- |
| Headers | object | Search specific email headers |          |

#### EmailIds

List of specific email IDs to fetch. When provided, other search criteria are ignored. Useful for bulk operations on known messages.

| Name     | Type  | Description                                                                                                                          | Required |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| EmailIds | array | List of specific email IDs to fetch. When provided, other search criteria are ignored. Useful for bulk operations on known messages. |          |

#### SearchQuery

Search criteria for filtering messages

| Name       | Type                  | Description                                                                                                   | Required |
| ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| seq        | string                | Sequence number range (e.g., "1:10" or "1,3,5"). Only supported for IMAP.                                     | No       |
| answered   | boolean               | Filter for messages that have been replied to. Only supported for IMAP.                                       | No       |
| deleted    | boolean               | Filter for messages marked for deletion. Only supported for IMAP.                                             | No       |
| draft      | boolean               | Filter for draft messages                                                                                     | No       |
| unseen     | boolean               | Filter for unread messages                                                                                    | No       |
| flagged    | boolean               | Filter for flagged/starred messages                                                                           | No       |
| seen       | boolean               | Filter for read messages                                                                                      | No       |
| from       | string                | Search in From addresses                                                                                      | No       |
| to         | string                | Search in To addresses. Not supported for MS Graph API.                                                       | No       |
| cc         | string                | Search in Cc addresses. Not supported for MS Graph API.                                                       | No       |
| bcc        | string                | Search in Bcc addresses. Not supported for MS Graph API.                                                      | No       |
| body       | string                | Search in message body content                                                                                | No       |
| subject    | string                | Search in message subject                                                                                     | No       |
| larger     | integer               | Find messages larger than specified size in bytes. Not supported for MS Graph API.                            | No       |
| smaller    | integer               | Find messages smaller than specified size in bytes. Not supported for MS Graph API.                           | No       |
| uid        | string                | UID range (e.g., "100:200" or "150,200,250"). Only supported for IMAP.                                        | No       |
| modseq     | integer               | Find messages with modification sequence higher than specified value. Only supported for IMAP with CONDSTORE. | No       |
| before     | date                  | Find messages received before this date                                                                       | No       |
| since      | date                  | Find messages received after this date                                                                        | No       |
| sentBefore | date                  | Find messages sent before this date                                                                           | No       |
| sentSince  | date                  | Find messages sent after this date                                                                            | No       |
| emailId    | string                | Globally unique email identifier (when supported by the email server)                                         | No       |
| threadId   | string                | Thread identifier for email conversations (when supported by the email server)                                | No       |
| header     | [Headers](#Headers)   |                                                                                                               | No       |
| gmailRaw   | string                | Gmail search syntax (only works with Gmail accounts)                                                          | No       |
| emailIds   | [EmailIds](#EmailIds) |                                                                                                               | No       |

#### Model9

| Name   | Type                        | Description | Required |
| ------ | --------------------------- | ----------- | -------- |
| search | [SearchQuery](#SearchQuery) |             | Yes      |

#### Model10

| Name    | Type  | Description | Required |
| ------- | ----- | ----------- | -------- |
| Model10 | array |             |          |

#### SMTPEnvelope

An optional object specifying the SMTP envelope used during email transmission. If not provided, the envelope is automatically derived from the email's message headers. This is useful when you need the envelope addresses to differ from those in the email headers.

| Name | Type                | Description | Required |
| ---- | ------------------- | ----------- | -------- |
| from | string              |             | No       |
| to   | [Model10](#Model10) |             | No       |

#### ReplyToAddress

| Name    | Type   | Description | Required |
| ------- | ------ | ----------- | -------- |
| name    | string |             | No       |
| address | string |             | Yes      |

#### ReplyTo

List of Reply-To addresses

| Name    | Type  | Description                | Required |
| ------- | ----- | -------------------------- | -------- |
| ReplyTo | array | List of Reply-To addresses |          |

#### ToAddress

| Name    | Type   | Description | Required |
| ------- | ------ | ----------- | -------- |
| name    | string |             | No       |
| address | string |             | Yes      |

#### ToAddressList

List of recipient addresses

| Name          | Type  | Description                 | Required |
| ------------- | ----- | --------------------------- | -------- |
| ToAddressList | array | List of recipient addresses |          |

#### CcAddress

| Name    | Type   | Description | Required |
| ------- | ------ | ----------- | -------- |
| name    | string |             | No       |
| address | string |             | Yes      |

#### CcAddressList

List of CC addresses

| Name          | Type  | Description          | Required |
| ------------- | ----- | -------------------- | -------- |
| CcAddressList | array | List of CC addresses |          |

#### BccAddress

| Name    | Type   | Description | Required |
| ------- | ------ | ----------- | -------- |
| name    | string |             | No       |
| address | string |             | Yes      |

#### BccAddressList

List of BCC addresses

| Name           | Type  | Description           | Required |
| -------------- | ----- | --------------------- | -------- |
| BccAddressList | array | List of BCC addresses |          |

#### RenderValues

An object of variables for the template renderer

| Name         | Type   | Description                                      | Required |
| ------------ | ------ | ------------------------------------------------ | -------- |
| RenderValues | object | An object of variables for the template renderer |          |

#### TemplateRender

Template rendering options

| Name   | Type                          | Description | Required |
| ------ | ----------------------------- | ----------- | -------- |
| format | [format](#format)             |             | No       |
| params | [RenderValues](#RenderValues) |             | No       |

#### MailMergeListEntry

| Name      | Type                          | Description                                                             | Required |
| --------- | ----------------------------- | ----------------------------------------------------------------------- | -------- |
| to        | [ToAddress](#ToAddress)       |                                                                         | Yes      |
| messageId | string                        | Message ID                                                              | No       |
| params    | [RenderValues](#RenderValues) |                                                                         | No       |
| sendAt    | dateTime                      | Send message at specified time. Overrides message level `sendAt` value. | No       |

#### MailMergeList

Mail merge options. A separate email is generated for each recipient. Using mail merge disables `messageId`, `envelope`, `to`, `cc`, `bcc`, `render` keys for the message root.

| Name          | Type  | Description                                                                                                                                                                     | Required |
| ------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| MailMergeList | array | Mail merge options. A separate email is generated for each recipient. Using mail merge disables `messageId`, `envelope`, `to`, `cc`, `bcc`, `render` keys for the message root. |          |

#### return

Specifies if only headers or the entire body of the message should be included in the response (RET)

| Name   | Type   | Description                                                                                          | Required |
| ------ | ------ | ---------------------------------------------------------------------------------------------------- | -------- |
| return | string | Specifies if only headers or the entire body of the message should be included in the response (RET) |          |

#### NotifyEntry

| Name        | Type   | Description | Required |
| ----------- | ------ | ----------- | -------- |
| NotifyEntry | string |             |          |

#### notify

Defines the conditions under which a DSN response should be sent

| Name   | Type  | Description                                                      | Required |
| ------ | ----- | ---------------------------------------------------------------- | -------- |
| notify | array | Defines the conditions under which a DSN response should be sent |          |

#### DSN

Request DSN notifications

| Name      | Type              | Description                                                            | Required |
| --------- | ----------------- | ---------------------------------------------------------------------- | -------- |
| id        | string            | The envelope identifier that would be included in the response (ENVID) | No       |
| return    | [return](#return) |                                                                        | Yes      |
| notify    | [notify](#notify) |                                                                        | No       |
| recipient | string            | The email address the DSN should be sent (ORCPT)                       | No       |

#### SubmitMessage

| Name             | Type                                          | Description                                                                                                                                                           | Required |
| ---------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| reference        | [MessageReference](#MessageReference)         |                                                                                                                                                                       | No       |
| envelope         | [SMTPEnvelope](#SMTPEnvelope)                 |                                                                                                                                                                       | No       |
| raw              | string                                        | A Base64-encoded email message in RFC 822 format. If you provide other fields along with raw, those fields will override the corresponding values in the raw message. | No       |
| from             | [FromAddress](#FromAddress)                   |                                                                                                                                                                       | No       |
| replyTo          | [ReplyTo](#ReplyTo)                           |                                                                                                                                                                       | No       |
| to               | [ToAddressList](#ToAddressList)               |                                                                                                                                                                       | No       |
| cc               | [CcAddressList](#CcAddressList)               |                                                                                                                                                                       | No       |
| bcc              | [BccAddressList](#BccAddressList)             |                                                                                                                                                                       | No       |
| subject          | string                                        | Email subject line                                                                                                                                                    | No       |
| text             | string                                        | Plain text message content                                                                                                                                            | No       |
| html             | string                                        | HTML message content                                                                                                                                                  | No       |
| previewText      | string                                        | Preview text shown in email clients after the subject line                                                                                                            | No       |
| template         | string                                        | Stored template ID to load the email content from                                                                                                                     | No       |
| render           | [TemplateRender](#TemplateRender)             |                                                                                                                                                                       | No       |
| mailMerge        | [MailMergeList](#MailMergeList)               |                                                                                                                                                                       | No       |
| attachments      | [UploadAttachmentList](#UploadAttachmentList) |                                                                                                                                                                       | No       |
| messageId        | string                                        | Message ID                                                                                                                                                            | No       |
| headers          | [CustomHeaders](#CustomHeaders)               |                                                                                                                                                                       | No       |
| trackOpens       | boolean                                       | Should EmailEngine track opens for this message                                                                                                                       | No       |
| trackClicks      | boolean                                       | Should EmailEngine track clicks for this message                                                                                                                      | No       |
| copy             | boolean                                       | If set then either copies the message to the Sent Mail folder or not. If not set then uses the account's default setting.                                             | No       |
| sentMailPath     | string                                        | Upload sent message to this folder. By default the account's Sent Mail folder is used.                                                                                | No       |
| locale           | string                                        | Optional locale                                                                                                                                                       | No       |
| tz               | string                                        | Optional timezone                                                                                                                                                     | No       |
| sendAt           | dateTime                                      | Send message at specified time                                                                                                                                        | No       |
| deliveryAttempts | integer                                       | How many delivery attempts to make until message is considered as failed                                                                                              | No       |
| gateway          | string                                        | Optional SMTP gateway ID for message routing                                                                                                                          | No       |
| listId           | string                                        | List ID for Mail Merge. Must use a subdomain name format. Lists are registered ad-hoc, so a new identifier defines a new list.                                        | No       |
| dsn              | [DSN](#DSN)                                   |                                                                                                                                                                       | No       |
| baseUrl          | string                                        | Optional base URL for trackers. This URL must point to your EmailEngine instance.                                                                                     | No       |
| proxy            | string                                        | Optional proxy URL to use when connecting to the SMTP server                                                                                                          | No       |
| localAddress     | string                                        | Optional local IP address to bind to when connecting to the SMTP server                                                                                               | No       |
| dryRun           | boolean                                       | If true, then EmailEngine does not send the email and returns an RFC822 formatted email file. Tracking information is not added to the email.                         | No       |

#### Model11

Reference info if referencing was requested

| Name    | Type    | Description                                              | Required |
| ------- | ------- | -------------------------------------------------------- | -------- |
| message | string  | Referenced message ID                                    | Yes      |
| success | boolean | Was the referenced message processed successfully        | No       |
| error   | string  | An error message if referenced message processing failed | No       |

#### ToAddressSingle

| Name    | Type   | Description | Required |
| ------- | ------ | ----------- | -------- |
| name    | string |             | No       |
| address | string |             | Yes      |

#### Model12

Reference info if referencing was requested

| Name    | Type    | Description                                              | Required |
| ------- | ------- | -------------------------------------------------------- | -------- |
| message | string  | Referenced message ID                                    | Yes      |
| success | boolean | Was the referenced message processed successfully        | No       |
| error   | string  | An error message if referenced message processing failed | No       |

#### skipped

Info about skipped message. If this value is set, then the message was not sent

| Name   | Type   | Description                  | Required |
| ------ | ------ | ---------------------------- | -------- |
| reason | string | Why this message was skipped | No       |
| listId | string |                              | No       |

#### BulkResponseEntry

| Name      | Type                                | Description                                                             | Required |
| --------- | ----------------------------------- | ----------------------------------------------------------------------- | -------- |
| success   | boolean                             | Was the referenced message processed successfully                       | No       |
| to        | [ToAddressSingle](#ToAddressSingle) |                                                                         | No       |
| messageId | string                              | Message ID                                                              | No       |
| queueId   | string                              | Queue identifier for scheduled email. Not present for bulk messages.    | No       |
| reference | [Model12](#Model12)                 |                                                                         | No       |
| sendAt    | dateTime                            | Send message at specified time. Overrides message level `sendAt` value. | No       |
| skipped   | [skipped](#skipped)                 |                                                                         | No       |

#### BulkResponseList

Bulk message responses

| Name             | Type  | Description            | Required |
| ---------------- | ----- | ---------------------- | -------- |
| BulkResponseList | array | Bulk message responses |          |

#### SubmitMessageResponse

| Name      | Type                                  | Description                                                          | Required |
| --------- | ------------------------------------- | -------------------------------------------------------------------- | -------- |
| response  | string                                |                                                                      | No       |
| messageId | string                                | Message-ID header value. Not present for bulk messages.              | No       |
| queueId   | string                                | Queue identifier for scheduled email. Not present for bulk messages. | No       |
| sendAt    | date                                  | Scheduled send time                                                  | No       |
| reference | [Model11](#Model11)                   |                                                                      | No       |
| preview   | string                                | Base64 encoded RFC822 email if a preview was requested               | No       |
| mailMerge | [BulkResponseList](#BulkResponseList) |                                                                      | No       |

#### gateway

Optional gateway ID

| Name    | Type   | Description         | Required |
| ------- | ------ | ------------------- | -------- |
| gateway | string | Optional gateway ID |          |

#### DeliveryStartRequest

| Name    | Type                | Description | Required |
| ------- | ------------------- | ----------- | -------- |
| gateway | [gateway](#gateway) |             | No       |

#### DeliveryStartResponse

| Name         | Type    | Description          | Required |
| ------------ | ------- | -------------------- | -------- |
| success      | boolean | Was the test started | No       |
| deliveryTest | string  | Test ID              | No       |

#### EmptyLicenseResponse

| Name    | Type    | Description | Required |
| ------- | ------- | ----------- | -------- |
| active  | boolean |             | No       |
| details | boolean |             | No       |
| type    | string  |             | No       |

#### DeleteRequestResponse

| Name    | Type    | Description                             | Required |
| ------- | ------- | --------------------------------------- | -------- |
| account | string  | Unique identifier for the email account | Yes      |
| deleted | boolean | Was the account deleted                 | No       |

#### DeleteBlocklistResponse

| Name    | Type    | Description                           | Required |
| ------- | ------- | ------------------------------------- | -------- |
| deleted | boolean | Was the address removed from the list | No       |

#### Model13

| Name    | Type    | Description             | Required |
| ------- | ------- | ----------------------- | -------- |
| gateway | string  | Gateway ID              | Yes      |
| deleted | boolean | Was the gateway deleted | No       |

#### DeleteAppRequestResponse

| Name     | Type    | Description                                                                             | Required |
| -------- | ------- | --------------------------------------------------------------------------------------- | -------- |
| id       | string  | OAuth2 application ID                                                                   | Yes      |
| deleted  | boolean | Was the gateway deleted                                                                 | No       |
| accounts | integer | The number of accounts registered with this application. Not available for legacy apps. | No       |

#### DeleteOutboxEntryResponse

| Name    | Type    | Description             | Required |
| ------- | ------- | ----------------------- | -------- |
| deleted | boolean | Was the message deleted | No       |

#### DeleteTokenRequestResponse

| Name    | Type    | Description             | Required |
| ------- | ------- | ----------------------- | -------- |
| deleted | boolean | Was the account deleted | No       |

#### DeleteMailboxResponse

| Name    | Type    | Description             | Required |
| ------- | ------- | ----------------------- | -------- |
| path    | string  | Full path to mailbox    | Yes      |
| deleted | boolean | Was the mailbox deleted | No       |

#### DeleteTemplateRequestResponse

| Name    | Type    | Description                             | Required |
| ------- | ------- | --------------------------------------- | -------- |
| deleted | boolean | Was the account flushed                 | No       |
| account | string  | Unique identifier for the email account | Yes      |

#### Model14

| Name    | Type    | Description                             | Required |
| ------- | ------- | --------------------------------------- | -------- |
| deleted | boolean | Was the template deleted                | No       |
| account | string  | Unique identifier for the email account | Yes      |
| id      | string  | Template ID                             | Yes      |

#### moved

Present if message was moved to Trash

| Name        | Type   | Description         | Required |
| ----------- | ------ | ------------------- | -------- |
| destination | string | Trash folder path   | Yes      |
| message     | string | Message ID in Trash | Yes      |

#### MessageDeleteResponse

| Name    | Type            | Description                    | Required |
| ------- | --------------- | ------------------------------ | -------- |
| deleted | boolean         | Was the delete action executed | No       |
| moved   | [moved](#moved) |                                | No       |

#### Model15

Advanced TLS configuration options

| Name               | Type    | Description                                                 | Required |
| ------------------ | ------- | ----------------------------------------------------------- | -------- |
| rejectUnauthorized | boolean | Reject connections to servers with invalid TLS certificates | No       |
| minVersion         | string  | Minimum TLS version to accept                               | No       |

#### IMAPUpdate

IMAP configuration

| Name            | Type                              | Description                                                                   | Required |
| --------------- | --------------------------------- | ----------------------------------------------------------------------------- | -------- |
| partial         | boolean                           | Update only the provided fields instead of replacing the entire configuration | No       |
| auth            | [Authentication](#Authentication) |                                                                               | No       |
| useAuthServer   | boolean                           | Use external authentication server to retrieve credentials dynamically        | No       |
| host            | string                            | IMAP server hostname                                                          | No       |
| port            | integer                           | IMAP server port                                                              | No       |
| secure          | boolean                           | Use TLS encryption for the connection                                         | No       |
| tls             | [Model15](#Model15)               |                                                                               | No       |
| resyncDelay     | integer                           | Delay in seconds between full mailbox resynchronizations                      | No       |
| disabled        | boolean                           | Temporarily disable IMAP operations for this account                          | No       |
| sentMailPath    | string                            | Custom folder path for sent messages. Set to null to use default.             | No       |
| draftsMailPath  | string                            | Custom folder path for draft messages. Set to null to use default.            | No       |
| junkMailPath    | string                            | Custom folder path for spam/junk messages. Set to null to use default.        | No       |
| trashMailPath   | string                            | Custom folder path for deleted messages. Set to null to use default.          | No       |
| archiveMailPath | string                            | Custom folder path for archived messages. Set to null to use default.         | No       |

#### Model16

Authentication credentials for the SMTP server

| Name        | Type                        | Description                                       | Required |
| ----------- | --------------------------- | ------------------------------------------------- | -------- |
| user        | string                      | Username or email address for SMTP authentication | Yes      |
| accessToken | [accessToken](#accessToken) |                                                   | No       |
| pass        | string                      | Password for SMTP authentication                  | No       |

#### Model17

Advanced TLS configuration options

| Name               | Type    | Description                                                 | Required |
| ------------------ | ------- | ----------------------------------------------------------- | -------- |
| rejectUnauthorized | boolean | Reject connections to servers with invalid TLS certificates | No       |
| minVersion         | string  | Minimum TLS version to accept                               | No       |

#### SMTPUpdate

SMTP configuration

| Name          | Type                | Description                                                                   | Required |
| ------------- | ------------------- | ----------------------------------------------------------------------------- | -------- |
| partial       | boolean             | Update only the provided fields instead of replacing the entire configuration | No       |
| auth          | [Model16](#Model16) |                                                                               | No       |
| useAuthServer | boolean             | Use external authentication server to retrieve credentials dynamically        | No       |
| host          | string              | SMTP server hostname                                                          | No       |
| port          | integer             | SMTP server port                                                              | No       |
| secure        | boolean             | Use TLS encryption from the start                                             | No       |
| tls           | [Model17](#Model17) |                                                                               | No       |

#### OAuth2Update

OAuth2 configuration

| Name          | Type                                          | Description                                                                                                             | Required |
| ------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| partial       | boolean                                       | Update only the provided fields instead of replacing the entire configuration                                           | No       |
| authorize     | boolean                                       | Request an OAuth2 authorization URL instead of directly configuring credentials                                         | No       |
| provider      | string                                        | OAuth2 Application ID configured in EmailEngine                                                                         | No       |
| auth          | [OAuth2Authentication](#OAuth2Authentication) |                                                                                                                         | Yes      |
| useAuthServer | boolean                                       | Use external authentication server for token management instead of EmailEngine                                          | No       |
| accessToken   | string                                        | OAuth2 access token for the email account                                                                               | No       |
| refreshToken  | string                                        | OAuth2 refresh token for obtaining new access tokens                                                                    | No       |
| authority     | string                                        | Microsoft account type: "consumers" (personal), "organizations" (work/school), "common" (both), or a specific tenant ID | No       |
| expires       | dateTime                                      | Access token expiration timestamp                                                                                       | No       |

#### UpdateAccount

| Name                  | Type                                                          | Description                                                                                             | Required |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- |
| name                  | string                                                        | Display name for the account                                                                            | No       |
| email                 | string                                                        | Default email address of the account                                                                    | No       |
| path                  | [AccountPath](#AccountPath)                                   |                                                                                                         | No       |
| subconnections        | [SubconnectionPaths](#SubconnectionPaths)                     |                                                                                                         | No       |
| webhooks              | string                                                        | Account-specific webhook URL                                                                            | No       |
| copy                  | boolean                                                       | Copy submitted messages to Sent folder. Set to `null` to unset and use provider specific default.       | No       |
| logs                  | boolean                                                       | Store recent logs                                                                                       | No       |
| notifyFrom            | dateTime                                                      | Only send webhooks for messages received after this date. Defaults to account creation time. IMAP only. | No       |
| proxy                 | string                                                        | Proxy server URL for outbound connections                                                               | No       |
| smtpEhloName          | string                                                        | Hostname to use in SMTP EHLO/HELO commands (defaults to system hostname)                                | No       |
| imap                  | [IMAPUpdate](#IMAPUpdate)                                     |                                                                                                         | No       |
| smtp                  | [SMTPUpdate](#SMTPUpdate)                                     |                                                                                                         | No       |
| oauth2                | [OAuth2Update](#OAuth2Update)                                 |                                                                                                         | No       |
| webhooksCustomHeaders | [AccountWebhooksCustomHeaders](#AccountWebhooksCustomHeaders) |                                                                                                         | No       |
| locale                | string                                                        | Optional locale                                                                                         | No       |
| tz                    | string                                                        | Optional timezone                                                                                       | No       |

#### Model18

| Name    | Type   | Description                             | Required |
| ------- | ------ | --------------------------------------- | -------- |
| account | string | Unique identifier for the email account | Yes      |

#### clientId

Client or Application ID for 3-legged OAuth2 applications

| Name     | Type   | Description                                               | Required |
| -------- | ------ | --------------------------------------------------------- | -------- |
| clientId | string | Client or Application ID for 3-legged OAuth2 applications |          |

#### Model19

OAuth2 Extra Scopes

| Name    | Type  | Description         | Required |
| ------- | ----- | ------------------- | -------- |
| Model19 | array | OAuth2 Extra Scopes |          |

#### Model20

OAuth2 scopes to skip from the base set

| Name    | Type  | Description                             | Required |
| ------- | ----- | --------------------------------------- | -------- |
| Model20 | array | OAuth2 scopes to skip from the base set |          |

#### serviceClient

Service client ID for 2-legged OAuth2 applications

| Name          | Type   | Description                                        | Required |
| ------------- | ------ | -------------------------------------------------- | -------- |
| serviceClient | string | Service client ID for 2-legged OAuth2 applications |          |

#### AzureCloud

Azure cloud type for Outlook OAuth2 applications

| Name       | Type   | Description                                      | Required |
| ---------- | ------ | ------------------------------------------------ | -------- |
| AzureCloud | string | Azure cloud type for Outlook OAuth2 applications |          |

#### redirectUrl

Redirect URL for 3-legged OAuth2 applications

| Name        | Type   | Description                                   | Required |
| ----------- | ------ | --------------------------------------------- | -------- |
| redirectUrl | string | Redirect URL for 3-legged OAuth2 applications |          |

#### UpdateOAuthApp

| Name                    | Type                                              | Description                                                   | Required |
| ----------------------- | ------------------------------------------------- | ------------------------------------------------------------- | -------- |
| name                    | string                                            | Application name                                              | No       |
| description             | string                                            | Application description                                       | No       |
| title                   | string                                            | Title for the application button                              | No       |
| enabled                 | boolean                                           | Enable this app                                               | No       |
| clientId                | [clientId](#clientId)                             |                                                               | No       |
| clientSecret            | string                                            | Client secret for 3-legged OAuth2 applications                | No       |
| pubSubApp               | string                                            | Cloud Pub/Sub app for Gmail API webhooks                      | No       |
| extraScopes             | [Model19](#Model19)                               |                                                               | No       |
| skipScopes              | [Model20](#Model20)                               |                                                               | No       |
| serviceClient           | [serviceClient](#serviceClient)                   |                                                               | No       |
| googleProjectId         | [googleProjectId](#googleProjectId)               |                                                               | No       |
| googleWorkspaceAccounts | boolean                                           | Restrict OAuth2 login to Google Workspace accounts only       | No       |
| googleTopicName         | [googleTopicName](#googleTopicName)               |                                                               | No       |
| googleSubscriptionName  | [googleSubscriptionName](#googleSubscriptionName) |                                                               | No       |
| serviceClientEmail      | string                                            | Service Client Email for 2-legged OAuth2 applications         | No       |
| serviceKey              | string                                            | PEM formatted service secret for 2-legged OAuth2 applications | No       |
| authority               | string                                            | Authorization tenant value for Outlook OAuth2 applications    | No       |
| cloud                   | [AzureCloud](#AzureCloud)                         |                                                               | No       |
| tenant                  | string                                            |                                                               | No       |
| redirectUrl             | [redirectUrl](#redirectUrl)                       |                                                               | No       |

#### UpdateOAuthAppResponse

| Name | Type   | Description   | Required |
| ---- | ------ | ------------- | -------- |
| id   | string | OAuth2 app ID | Yes      |

#### AddFlags

Flags to add to the message

| Name     | Type  | Description                 | Required |
| -------- | ----- | --------------------------- | -------- |
| AddFlags | array | Flags to add to the message |          |

#### DeleteFlags

Flags to remove from the message

| Name        | Type  | Description                      | Required |
| ----------- | ----- | -------------------------------- | -------- |
| DeleteFlags | array | Flags to remove from the message |          |

#### SetFlags

Replace all flags with this list

| Name     | Type  | Description                      | Required |
| -------- | ----- | -------------------------------- | -------- |
| SetFlags | array | Replace all flags with this list |          |

#### FlagUpdate

Flag operations to perform

| Name   | Type                        | Description | Required |
| ------ | --------------------------- | ----------- | -------- |
| add    | [AddFlags](#AddFlags)       |             | No       |
| delete | [DeleteFlags](#DeleteFlags) |             | No       |
| set    | [SetFlags](#SetFlags)       |             | No       |

#### AddLabels

Gmail labels to add (use label ID or path)

| Name      | Type  | Description                                | Required |
| --------- | ----- | ------------------------------------------ | -------- |
| AddLabels | array | Gmail labels to add (use label ID or path) |          |

#### DeleteLabels

Gmail labels to remove (use label ID or path)

| Name         | Type  | Description                                   | Required |
| ------------ | ----- | --------------------------------------------- | -------- |
| DeleteLabels | array | Gmail labels to remove (use label ID or path) |          |

#### LabelUpdate

Label operations to perform (Gmail only)

| Name   | Type                          | Description | Required |
| ------ | ----------------------------- | ----------- | -------- |
| add    | [AddLabels](#AddLabels)       |             | No       |
| delete | [DeleteLabels](#DeleteLabels) |             | No       |

#### MessageUpdate

| Name   | Type                        | Description | Required |
| ------ | --------------------------- | ----------- | -------- |
| flags  | [FlagUpdate](#FlagUpdate)   |             | No       |
| labels | [LabelUpdate](#LabelUpdate) |             | No       |

#### MessagesUpdateRequest

| Name   | Type                            | Description | Required |
| ------ | ------------------------------- | ----------- | -------- |
| search | [SearchQuery](#SearchQuery)     |             | Yes      |
| update | [MessageUpdate](#MessageUpdate) |             | No       |

#### FlagResponse

| Name   | Type    | Description | Required |
| ------ | ------- | ----------- | -------- |
| add    | boolean |             | No       |
| delete | boolean |             | No       |
| set    | boolean |             | No       |

#### MessageUpdateResponse

| Name   | Type                          | Description | Required |
| ------ | ----------------------------- | ----------- | -------- |
| flags  | [FlagResponse](#FlagResponse) |             | No       |
| labels | [FlagResponse](#FlagResponse) |             | No       |

#### TargetMailboxPath

New mailbox path as an array or a string. If account is namespaced then namespace prefix is added by default.

| Name              | Type  | Description                                                                                                   | Required |
| ----------------- | ----- | ------------------------------------------------------------------------------------------------------------- | -------- |
| TargetMailboxPath | array | New mailbox path as an array or a string. If account is namespaced then namespace prefix is added by default. |          |

#### RenameMailbox

| Name    | Type                                    | Description                   | Required |
| ------- | --------------------------------------- | ----------------------------- | -------- |
| path    | string                                  | Mailbox folder path to rename | Yes      |
| newPath | [TargetMailboxPath](#TargetMailboxPath) |                               | No       |

#### RenameMailboxResponse

| Name    | Type    | Description                   | Required |
| ------- | ------- | ----------------------------- | -------- |
| path    | string  | Mailbox folder path to rename | Yes      |
| newPath | string  | Full path to mailbox          | Yes      |
| renamed | boolean | Was the mailbox renamed       | No       |

#### RequestSync

| Name | Type    | Description       | Required |
| ---- | ------- | ----------------- | -------- |
| sync | boolean | Only sync if true | No       |

#### RequestSyncResponse

| Name | Type    | Description | Required |
| ---- | ------- | ----------- | -------- |
| sync | boolean | Sync status | No       |

#### RequestReconnect

| Name      | Type    | Description            | Required |
| --------- | ------- | ---------------------- | -------- |
| reconnect | boolean | Only reconnect if true | No       |

#### RequestReconnectResponse

| Name      | Type    | Description         | Required |
| --------- | ------- | ------------------- | -------- |
| reconnect | boolean | Reconnection status | No       |

#### RequestFlush

| Name        | Type                        | Description                                                                                             | Required |
| ----------- | --------------------------- | ------------------------------------------------------------------------------------------------------- | -------- |
| flush       | boolean                     | Only flush the account if true                                                                          | No       |
| notifyFrom  | dateTime                    | Only send webhooks for messages received after this date. Defaults to account creation time. IMAP only. | No       |
| imapIndexer | [IMAPIndexer](#IMAPIndexer) |                                                                                                         | No       |

#### RequestFlushResponse

| Name  | Type    | Description  | Required |
| ----- | ------- | ------------ | -------- |
| flush | boolean | Flush status | No       |

#### UpdateGateway

| Name   | Type    | Description                                          | Required |
| ------ | ------- | ---------------------------------------------------- | -------- |
| name   | string  | Account Name                                         | No       |
| user   | string  |                                                      | No       |
| pass   | string  |                                                      | No       |
| host   | string  | Hostname to connect to                               | No       |
| port   | integer | Service port number                                  | No       |
| secure | boolean | Should connection use TLS. Usually true for port 465 | No       |

#### UpdateGatewayResponse

| Name    | Type   | Description | Required |
| ------- | ------ | ----------- | -------- |
| gateway | string | Gateway ID  | Yes      |

#### SettingsPutQueuePayload

| Name   | Type    | Description               | Required |
| ------ | ------- | ------------------------- | -------- |
| paused | boolean | Set queue state to paused | No       |

#### SettingsPutQueueResponse

| Name   | Type            | Description                | Required |
| ------ | --------------- | -------------------------- | -------- |
| queue  | [queue](#queue) |                            | Yes      |
| paused | boolean         | Is the queue paused or not | No       |

#### UpdateTemplateContent

| Name        | Type   | Description                                                | Required |
| ----------- | ------ | ---------------------------------------------------------- | -------- |
| subject     | string | Email subject line                                         | No       |
| text        | string | Plain text message content                                 | No       |
| html        | string | HTML message content                                       | No       |
| previewText | string | Preview text shown in email clients after the subject line | No       |

#### UpdateTemplate

| Name        | Type                                            | Description                          | Required |
| ----------- | ----------------------------------------------- | ------------------------------------ | -------- |
| name        | string                                          | Name of the template                 | No       |
| description | string                                          | Optional description of the template | No       |
| format      | [format](#format)                               |                                      | No       |
| content     | [UpdateTemplateContent](#UpdateTemplateContent) |                                      | No       |

#### UpdateTemplateResponse

| Name    | Type    | Description                             | Required |
| ------- | ------- | --------------------------------------- | -------- |
| updated | boolean | Was the template updated or not         | No       |
| account | string  | Unique identifier for the email account | Yes      |
| id      | string  | Template ID                             | Yes      |

#### MessagesMoveRequest

| Name   | Type                        | Description                | Required |
| ------ | --------------------------- | -------------------------- | -------- |
| search | [SearchQuery](#SearchQuery) |                            | Yes      |
| path   | string                      | Target mailbox folder path | Yes      |

#### IdMapTuple

| Name       | Type  | Description | Required |
| ---------- | ----- | ----------- | -------- |
| IdMapTuple | array |             |          |

#### IdMapArray

An optional map of source and target ID values, if the server provided this info

| Name       | Type  | Description                                                                      | Required |
| ---------- | ----- | -------------------------------------------------------------------------------- | -------- |
| IdMapArray | array | An optional map of source and target ID values, if the server provided this info |          |

#### EmailIdsArray

An optional list of emailId values, if the server supports unique email IDs

| Name          | Type  | Description                                                                 | Required |
| ------------- | ----- | --------------------------------------------------------------------------- | -------- |
| EmailIdsArray | array | An optional list of emailId values, if the server supports unique email IDs |          |

#### MessagesMoveResponse

| Name     | Type                            | Description                | Required |
| -------- | ------------------------------- | -------------------------- | -------- |
| path     | string                          | Target mailbox folder path | Yes      |
| idMap    | [IdMapArray](#IdMapArray)       |                            | No       |
| emailIds | [EmailIdsArray](#EmailIdsArray) |                            | No       |

#### MessagesDeleteRequest

| Name   | Type                        | Description | Required |
| ------ | --------------------------- | ----------- | -------- |
| search | [SearchQuery](#SearchQuery) |             | Yes      |

#### MessagesMovedToTrash

Value is present if messages were moved to Trash

| Name        | Type                            | Description       | Required |
| ----------- | ------------------------------- | ----------------- | -------- |
| destination | string                          | Trash folder path | Yes      |
| idMap       | [IdMapArray](#IdMapArray)       |                   | No       |
| emailIds    | [EmailIdsArray](#EmailIdsArray) |                   | No       |

#### MessagesDeleteResponse

| Name    | Type                                          | Description                    | Required |
| ------- | --------------------------------------------- | ------------------------------ | -------- |
| deleted | boolean                                       | Was the delete action executed | No       |
| moved   | [MessagesMovedToTrash](#MessagesMovedToTrash) |                                | No       |

#### MessageMove

| Name   | Type   | Description                                                                               | Required |
| ------ | ------ | ----------------------------------------------------------------------------------------- | -------- |
| path   | string | Destination mailbox folder path                                                           | Yes      |
| source | string | Source mailbox folder path (Gmail API only). Needed to remove the label from the message. | No       |

#### MessageMoveResponse

| Name | Type    | Description                                                                                       | Required |
| ---- | ------- | ------------------------------------------------------------------------------------------------- | -------- |
| path | string  | Destination mailbox folder path                                                                   | Yes      |
| id   | string  | ID of the moved message. Only included if the server provides it.                                 | No       |
| uid  | integer | UID of the moved message, applies only to IMAP accounts. Only included if the server provides it. | No       |
