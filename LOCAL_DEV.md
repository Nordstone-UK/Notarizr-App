# Local Development Guide

## Backend

**Base URL:** `http://localhost:8080`

| Endpoint | Description |
|---|---|
| `POST /v1/app` | Mobile app GraphQL (clients + agents) |
| `POST /v1/admin` | Admin panel GraphQL |

Run the server:
```bash
yarn dev
```

---

## Database

**Cluster:** MongoDB Atlas — `notarizr.dnjijww.mongodb.net`

All test accounts use OTP **`0000`** (Twilio is bypassed in local dev).

---

## Test Accounts

### Notary Agent — Maya Chen

| Field | Value |
|---|---|
| Phone | `+919600395864` |
| OTP | `0000` |
| Email | `maya.local@notarizr.test` |
| Account type | `individual-agent` |
| Verified | ✅ |
| Subscribed | ✅ |
| Online status | `online` |
| Location | San Francisco, CA |

### Client Accounts

| Name | Phone | OTP | Email | Location |
|---|---|---|---|---|
| Alex Client | `+12025550147` | `0000` | alex.local@notarizr.test | San Francisco, CA |
| Jordan Smith | `+12025550200` | `0000` | jordan.local@notarizr.test | Oakland, CA |
| Priya Patel | `+12025550300` | `0000` | priya.local@notarizr.test | Palo Alto, CA |

---

## Seeded Data (Maya Chen)

### Services
| Type | Name | Days | Hours | Can Print |
|---|---|---|---|---|
| `mobile_notary` | Mobile Notary | Mon–Sat | 09:00–18:00 | Yes |
| `ron` | Remote Online Notary | Mon–Sat | 09:00–18:00 | No |

### Bookings
| Status | Service | Client | Notes |
|---|---|---|---|
| `completed` | Mobile Notary | Alex Client | Power of attorney — 5★ review |
| `completed` | Mobile Notary | Jordan Smith | Real estate document — 4★ review |
| `ongoing` | Mobile Notary | Priya Patel | Affidavit — in progress today |
| `to_be_paid` | Mobile Notary | Alex Client | Other document — due tomorrow |
| `pending` | RON | Jordan Smith | Affidavit — scheduled 3 days out |
| `cancelled` | Mobile Notary | Priya Patel | Power of attorney — 20 days ago |

### Sessions (RON)
| Status | Client | Notes |
|---|---|---|
| `completed` | Alex Client | 5★ — 10 days ago |
| `to_be_paid` | Jordan Smith | Scheduled 3 days from now |

### Other Collections
| Collection | Count | Details |
|---|---|---|
| Transactions | 2 | For both completed bookings (USD) |
| Experiences | 2 | Ratings: 5★ and 4★ |
| Notifications | 5 | 2 read (completions), 3 unread (new requests) |
| Chats | 3 | One thread per client |
| Messages | 14 | Full conversation history |
| Subscription | 1 | Active yearly plan ($199), expires in ~11 months |

---

## Re-seeding

If you need to reset or re-run the seed data:

```bash
# Create base users (run once on a fresh DB)
yarn create:local-users

# Seed core reference data (document types, FAQs)
yarn seed:local

# Seed full Maya Chen agent data (bookings, sessions, chats, etc.)
yarn seed:agent-maya
```

---

## Authentication Flow

All phone/email OTPs are bypassed when `LOCAL_DEVELOPMENT=true` in `.env`.

1. Call `getValidPhoneOtp` or `getPhoneOTP` with any test phone number
2. Call `verifyPhoneOTP` with OTP `0000`
3. Use the returned `accessToken` as a Bearer token in the `Authorization` header for all subsequent requests

```
Authorization: <accessToken>
```
