# API Changes Required — Multi-Slot Availability per Day

**Feature:** Support multiple time blocks per weekday, where each block is
automatically divided into 60-minute bookable sessions.

**Requested by:** Mobile (React Native) team  
**Affects:** GraphQL schema, Service model, all queries/mutations that return `availability`

---

## 0. API Endpoint

All operations in this document are GraphQL requests sent to a **single endpoint**:

| | |
|---|---|
| **URL** | `https://app.notarizr.co/api/v1/app` |
| **Method** | `POST` |
| **Protocol** | GraphQL over HTTP |

### Required headers

```http
Content-Type:       application/json
Authorization:      Bearer <user_jwt_token>
X-User-Coordinates: <longitude>,<latitude>
```

### Example raw request (after backend changes are live)

```http
POST https://app.notarizr.co/api/v1/app
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "query": "mutation UpdateServiceById($id: String!, $availability: AvailabilityInput) { updateServiceById(id: $id, availability: $availability) { status message } }",
  "variables": {
    "id": "<service_id>",
    "availability": {
      "schedule": [
        {
          "day": "mon",
          "slots": [
            { "startTime": "9:00 AM",  "endTime": "12:00 PM" },
            { "startTime": "5:00 PM",  "endTime": "8:00 PM"  }
          ]
        },
        {
          "day": "tue",
          "slots": [
            { "startTime": "10:00 AM", "endTime": "2:00 PM" },
            { "startTime": "8:00 PM",  "endTime": "9:00 PM" }
          ]
        }
      ]
    }
  }
}
```

> **Note:** The server base URL and Apollo client configuration live in
> `src/utils/ApiUtils.tsx` (`BaseURL`) and `apollo/init.js` respectively.
> No changes are needed to those files on the mobile side — only the
> GraphQL schema and resolvers on the backend need to be updated.

---

## 1. Background — Current Schema

Every place in the API that deals with agent availability uses this flat structure today:

```graphql
type Availability {
  weekdays:  [String]   # e.g. ["mon", "tue", "fri"]
  startTime: String     # e.g. "9:00 AM"  — one value for ALL selected days
  endTime:   String     # e.g. "5:00 PM"  — one value for ALL selected days
}

input AvailabilityInput {
  weekdays:  [String]!
  startTime: String!
  endTime:   String!
}
```

**Limitations of the current design:**

| Capability | Supported today |
|---|---|
| Agent works on multiple days | ✅ yes |
| Different hours per day | ❌ no |
| Multiple time blocks on one day (e.g. morning + evening) | ❌ no |
| Bookable 60-min slots surfaced to clients | ❌ no |

---

## 2. Required Schema Changes

### 2.1 New types to add

```graphql
# A single bookable time block (e.g. "9:00 AM → 12:00 PM")
type TimeSlot {
  startTime: String!   # "9:00 AM"
  endTime:   String!   # "12:00 PM"
}

# All time blocks for one specific day
type DaySchedule {
  day:   String!         # "mon" | "tue" | "wed" | "thur" | "fri" | "sat" | "sun"
  slots: [TimeSlot!]!    # one or more non-overlapping time blocks
}

# Top-level availability now holds a per-day schedule
type Availability {
  schedule: [DaySchedule!]!
}
```

### 2.2 Updated input types

```graphql
input TimeSlotInput {
  startTime: String!
  endTime:   String!
}

input DayScheduleInput {
  day:   String!
  slots: [TimeSlotInput!]!
}

input AvailabilityInput {
  schedule: [DayScheduleInput!]!
}
```

### 2.3 Concrete example — what the mobile app will send

```json
{
  "availability": {
    "schedule": [
      {
        "day": "mon",
        "slots": [
          { "startTime": "9:00 AM",  "endTime": "12:00 PM" },
          { "startTime": "5:00 PM",  "endTime": "8:00 PM"  }
        ]
      },
      {
        "day": "tue",
        "slots": [
          { "startTime": "10:00 AM", "endTime": "2:00 PM" },
          { "startTime": "8:00 PM",  "endTime": "9:00 PM" }
        ]
      },
      {
        "day": "wed",
        "slots": [
          { "startTime": "9:00 AM", "endTime": "5:00 PM" }
        ]
      }
    ]
  }
}
```

### 2.4 Concrete example — what the API should return

```json
{
  "availability": {
    "schedule": [
      {
        "day": "mon",
        "slots": [
          { "startTime": "9:00 AM",  "endTime": "12:00 PM" },
          { "startTime": "5:00 PM",  "endTime": "8:00 PM"  }
        ]
      },
      {
        "day": "tue",
        "slots": [
          { "startTime": "10:00 AM", "endTime": "2:00 PM" },
          { "startTime": "8:00 PM",  "endTime": "9:00 PM" }
        ]
      }
    ]
  }
}
```

---

## 3. Mutations That Must Be Updated

### 3.1 `createService`

**File (mobile side):** `request/mutations/createService.mutation.tsx`

**Current response shape:**
```graphql
availability {
  weekdays
  startTime
  endTime
}
```

**Required response shape:**
```graphql
availability {
  schedule {
    day
    slots {
      startTime
      endTime
    }
  }
}
```

The `$availability: AvailabilityInput!` variable type stays the same name —
only the **shape** of `AvailabilityInput` changes (as defined in §2.2 above).

---

### 3.2 `updateServiceById`

**File (mobile side):** `request/mutations/updateservice.mutation.tsx`

Same change as `createService` — replace `weekdays / startTime / endTime`
with `schedule { day slots { startTime endTime } }` in the returned service
fragment.

---

### 3.3 `updateBookingStatus`

**File (mobile side):** `request/mutations/updateBookingStatus.mutation.tsx`

Returns a booking that embeds `service.availability`.
Update the `availability` fragment in the response:

```graphql
# Before
availability {
  weekdays
  startTime
  endTime
}

# After
availability {
  schedule {
    day
    slots {
      startTime
      endTime
    }
  }
}
```

---

### 3.4 `updateBookingInfo`

**File (mobile side):** `request/mutations/updateBookingInfo.mutation.tsx`

Same response fragment update as §3.3.

---

### 3.5 `updateBookingPrice`

**File (mobile side):** `request/mutations/updateBookingPrice.mutation.tsx`

Same response fragment update as §3.3.

---

### 3.6 `createBooking`

**File (mobile side):** `request/mutations/createBooking.mutation.tsx`

Same response fragment update as §3.3.

---

## 4. Queries That Must Be Updated

### 4.1 `serviceByAgentAndType`

**File (mobile side):** `request/queries/getserviceByAgent.query.tsx`

This is the primary query used by the availability setup screen.
It reads back the agent's saved schedule when they re-open the screen.

```graphql
# Before
availability {
  weekdays
  startTime
  endTime
}

# After
availability {
  schedule {
    day
    slots {
      startTime
      endTime
    }
  }
}
```

---

### 4.2 `getServiceByServiceType` (or equivalent)

**File (mobile side):** `request/queries/getServicebyServiceType.tsx`

Same fragment update as §4.1.

---

### 4.3 `matchAgent`

**File (mobile side):** `request/queries/matchAgent.query.tsx`

Used when clients search for available agents. This query returns the agent's
`service.availability` so the client-side can display bookable slots.

Same fragment update as §4.1.

---

### 4.4 `getBookingById`

**File (mobile side):** `request/queries/getBookingByID.query.tsx`

Same fragment update as §4.1.

---

### 4.5 `getAgentBookings`

**File (mobile side):** `request/queries/getAgentBooking.query.tsx`

Same fragment update as §4.1.

---

### 4.6 `getClientBookings`

**File (mobile side):** `request/queries/getClientBooking.query.tsx`

Same fragment update as §4.1.

---

## 5. Backend Business Logic to Implement

### 5.1 Validation rules (on write)

When `createService` or `updateServiceById` is called with the new
`AvailabilityInput`:

1. `schedule` must contain at least one entry.
2. Each `day` value must be one of: `mon`, `tue`, `wed`, `thur`, `fri`, `sat`, `sun`.
3. Each `slots` array must contain at least one entry.
4. For each slot: `endTime` must be strictly after `startTime`.
5. Slots within the same day **must not overlap**.
6. Each slot must span at least **60 minutes** (minimum bookable unit).

### 5.2 Slot generation logic (for client-facing booking)

When a client views an agent's available times for a specific date, the
backend (or mobile client) should expand each raw time block into discrete
60-minute slots:

```
Block:  9:00 AM → 12:00 PM
Slots:  9:00 AM – 10:00 AM
        10:00 AM – 11:00 AM
        11:00 AM – 12:00 PM

Block:  5:00 PM → 8:00 PM
Slots:  5:00 PM – 6:00 PM
        6:00 PM – 7:00 PM
        7:00 PM – 8:00 PM
```

Any remainder smaller than 60 minutes is **discarded** (e.g. a 90-min block
produces one 60-min slot, not one 60 and one 30-min partial).

> **Note for backend team:** The mobile team can perform this expansion on
> the client side if the raw `schedule` data is returned from the API.
> No separate "slots" endpoint is strictly required — confirm preference.

---

## 6. Database / Model Impact

The `Service` model's `availability` field currently stores:

```json
{
  "weekdays":  ["mon", "tue"],
  "startTime": "9:00 AM",
  "endTime":   "5:00 PM"
}
```

It must be migrated to store:

```json
{
  "schedule": [
    {
      "day": "mon",
      "slots": [
        { "startTime": "9:00 AM",  "endTime": "12:00 PM" },
        { "startTime": "5:00 PM",  "endTime": "8:00 PM"  }
      ]
    },
    {
      "day": "tue",
      "slots": [
        { "startTime": "10:00 AM", "endTime": "2:00 PM" }
      ]
    }
  ]
}
```

**Migration note:** Existing records using the old flat structure should be
migrated. A suggested migration strategy:

1. For each existing service record, read `weekdays`, `startTime`, `endTime`.
2. For every day in `weekdays`, create one `DaySchedule` entry with a single
   slot `{ startTime, endTime }`.
3. Write the resulting `schedule` array back to the record.
4. Remove the old `weekdays`, `startTime`, `endTime` fields once the mobile
   app is updated.

---

## 7. Summary Checklist for Backend

| # | Task |
|---|---|
| 1 | Add `TimeSlot` type to the GraphQL schema |
| 2 | Add `DaySchedule` type to the GraphQL schema |
| 3 | Update the `Availability` type to use `schedule: [DaySchedule]` |
| 4 | Add `TimeSlotInput` input type |
| 5 | Add `DayScheduleInput` input type |
| 6 | Update `AvailabilityInput` to use `schedule: [DayScheduleInput]` |
| 7 | Update `createService` resolver + model write |
| 8 | Update `updateServiceById` resolver + model write |
| 9 | Update all query resolvers that return `service.availability` |
| 10 | Add validation: no overlapping slots, min 60 min per slot |
| 11 | Write DB migration script for existing service records |
| 12 | Confirm whether slot expansion (60-min chunks) should happen on backend or mobile |

---

*Document prepared by the mobile (React Native) team — Aug 2026*
