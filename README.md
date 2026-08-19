# Zoho CRM Extension Kit

A collection of custom extensions for **Zoho CRM** — a React-based CRM Widget, server-side Custom Functions, and a webhook receiver — showing how to extend CRM's native UI and automate record-driven workflows.

## Overview

Out-of-the-box Zoho CRM covers standard sales workflows, but real client engagements almost always need custom UI panels and automation hooks. This project demonstrates the three most common extension points developers are asked to build:

1. A **Widget** embedded directly inside a CRM record page
2. **Custom Functions** triggered from CRM workflow rules
3. An external **webhook receiver** that reacts to CRM record changes

## Architecture

```
        ┌─────────────────────────┐
        │       Zoho CRM          │
        │  (Leads / Deals module) │
        └───────────┬─────────────┘
                     │
     ┌───────────────┼───────────────────┐
     ▼               ▼                   ▼
 CRM Widget      Workflow Rule       Outgoing Webhook
 (React, embedded  → Custom Function   → External receiver
  in record page)    (Deluge/Node)       (Catalyst Function)
     │                    │                     │
     ▼                    ▼                     ▼
 Calls CRM REST      Updates related       Syncs Deal/Lead
 API via OAuth        records, sends        data to external
 (widget SDK)         notifications         system / DB
```

## Tech Stack

- **Widget UI:** React + Zoho CRM Widget SDK (`ZOHO.embeddedApp`)
- **Automation:** Zoho CRM Custom Functions (Deluge) and Node.js (via Catalyst Functions)
- **Webhook Receiver:** Node.js on Zoho Catalyst Functions
- **Auth:** OAuth 2.0 (Zoho CRM API, self-client + widget SDK tokens)

## Zoho Services / APIs Used

| Component | API / Service |
|---|---|
| Widget | Zoho CRM Widget SDK, CRM REST API v6 |
| Custom Functions | Zoho CRM Functions (Deluge), Workflow Rules |
| Webhook Receiver | Zoho CRM Notifications (Webhooks), Catalyst Functions |
| Auth | Zoho OAuth 2.0 (self-client credentials) |

## Key Features

- **Deal Health Widget** — embedded panel on the Deal detail page showing related tickets (from Desk) and last activity, entirely client-side via the CRM REST API
- **Auto-assignment Function** — Deluge function triggered on Lead creation that assigns owners based on territory/round-robin logic
- **Webhook sync service** — Catalyst Function that receives CRM's outgoing webhook on `Deal.Stage = Closed Won` and forwards a normalized payload to an external system
- Example Postman collection for testing CRM API calls and webhook payloads

## Getting Started

### Prerequisites

- A Zoho CRM account (trial org is fine)
- Zoho API Console access to register a Self-Client / Server-based application
- Node.js 18+

### Installation

```bash
git clone https://github.com/<your-username>/zoho-crm-extension-kit.git
cd zoho-crm-extension-kit
cp .env.example .env
```

The widget and the webhook Function are independent deployables with their own `package.json` — install each from its own folder (see below), not from the repo root.

### Widget Development

```bash
cd widget
npm install
npm run dev      # served locally at http://localhost:5173 for iteration
npm run build    # produces dist/ — host this anywhere and register the URL
                  # in CRM under Setup → Developer Space → Widgets
```

The widget also needs a `crm_conn` Connection registered against the widget in the Developer Console (scope `ZohoCRM.modules.ALL`) — see [`docs/setup-oauth.md`](docs/setup-oauth.md#4-register-the-crm-widget-connection-for-zohoembedjss-crmapi).

### Deploying the Webhook Receiver

```bash
catalyst init
catalyst deploy
```

### Deluge Functions

`deluge-functions/*.dg` are reference scripts — paste them into CRM under Setup → Developer Space → Functions, then attach each to the workflow rule noted in its header comment (`autoAssignLead.dg` → Lead creation, `notifyDealWon.dg` → Deal edited to Closed Won).

## Project Structure

```
zoho-crm-extension-kit/
├── widget/                        # React CRM widget (Deal Health panel)
│   └── src/
│       ├── zohoEmbed.js           # wraps ZOHO.embeddedApp + CRM API calls
│       └── App.jsx
├── deluge-functions/
│   ├── autoAssignLead.dg          # round-robin Lead owner assignment
│   └── notifyDealWon.dg           # posts to Cliq on Deal → Closed Won
├── webhook-function/               # Catalyst Function: webhook receiver
│   └── index.js                    # HMAC-verifies + forwards to an external system
├── postman/                        # Sample requests for CRM API + webhooks
├── catalyst.json
├── .env.example
└── docs/
    └── setup-oauth.md
```

## Roadmap

- [ ] Add a Contacts-module widget for support ticket history
- [ ] Migrate Deluge functions to Node-based Catalyst Functions for parity
- [ ] Add signature verification middleware for the webhook receiver

----

## Author

**Waqar Pathan**
Email: pathanwaqar26@gmail.com
