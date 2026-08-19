# OAuth Setup

## 1. Register a Self-Client

1. Go to the [Zoho API Console](https://api-console.zoho.com/) → **Add Client** → **Self Client**.
2. Note the generated **Client ID** and **Client Secret**.

## 2. Generate a grant token

In the API Console's **Self Client** tab, generate a grant token with the scopes this project needs:

```
ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.functions.execute
```

## 3. Exchange the grant token for a refresh token

```bash
curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "grant_type=authorization_code" \
  -d "client_id=$ZOHO_CLIENT_ID" \
  -d "client_secret=$ZOHO_CLIENT_SECRET" \
  -d "redirect_uri=https://localhost" \
  -d "code=<grant-token-from-step-2>"
```

The response includes a `refresh_token` — save it as `ZOHO_REFRESH_TOKEN`. Unlike the grant token (10-minute expiry) and access token (1-hour expiry), the refresh token doesn't expire and is what `webhook-function/index.js` and the widget's connection both use to keep getting fresh access tokens.

## 4. Register the CRM Widget Connection (for `zohoEmbed.js`'s `crmApi`)

Widgets call the CRM REST API through a named **Connection**, not a raw OAuth token:

1. In the widget's plugin-manifest / Zoho Developer Console, add a Connection named `crm_conn` scoped to `ZohoCRM.modules.ALL`.
2. Users embed-authorize this connection the first time they open the widget — no client secret is ever exposed to the browser.

## 5. Configure the outgoing webhook

In CRM: **Setup → Automation → Actions → Webhooks → New Webhook**

- URL: your deployed `webhook-function` endpoint
- Method: POST
- Module: Deals
- Attach to the "Closed Won" workflow rule

Sign requests with `WEBHOOK_SECRET` on the receiving end to match `verifySignature()` in `webhook-function/index.js`.
