# Frontend Review Guide — Multi-Slot Availability

Use this document to check whether the mobile app UI and GraphQL integration match the backend change.

**Backend endpoint:** `POST /v1/app`  
**Auth:** `Authorization: <access_token>`

This is a **breaking change**. The old `weekdays / startTime / endTime` fields no longer exist. If the app still reads or writes those fields, availability screens will break.

---

## 1. What the UI must change from

### Old UI (single slot for all selected days)

The agent selected:

1. Which days they work (`mon`, `tue`, `fri`, …)
2. One start time
3. One end time

That one time range applied to **every selected day**.

```
Days:  [Mon] [Tue] [Wed] [Thu] [Fri]
Hours:  9:00 AM  →  5:00 PM
```

### New UI (multi-slot selector per day)

The agent now sets hours **per day**, and can add **more than one block on the same day**.

```
Monday
  [ 9:00 AM – 12:00 PM ]   [x]
  [ 5:00 PM –  8:00 PM ]   [x]
  [ + Add time block ]

Tuesday
  [ 10:00 AM – 2:00 PM ]   [x]
  [ + Add time block ]

Wednesday  (off — no blocks)
```

If a day has no blocks, it is **not sent** in `schedule`. Do not send an empty `slots: []` array for that day.

---

## 2. Agent availability screen — expected UI

This is the setup screen that currently uses `serviceByAgentAndType`.

### Screen behaviour

| Action | Expected UI |
|---|---|
| Open screen | Load existing `availability.schedule` and pre-fill each day |
| Tap a day | Expand that day to show its time blocks |
| Add block | Add `{ startTime, endTime }` under that day |
| Remove block | Remove that block. If it was the last block, treat the day as off |
| Save | Call `createService` or `updateServiceById` with the new `AvailabilityInput` |
| Validation error | Show the backend `message` (status `400`) on the screen |

### Time pickers

Each block needs **two pickers**, not one shared pair for the whole week:

- Start time
- End time

Time format **must** be `"H:MM AM/PM"` or `"HH:MM AM/PM"`:

| Valid | Invalid |
|---|---|
| `"9:00 AM"` | `"09:00"` |
| `"12:00 PM"` | `"9am"` |
| `"5:00 PM"` | `"17:00"` |
| `"08:00 AM"` | `"8:00"` (missing AM/PM) |

Backend accepts both `9:00 AM` and `09:00 AM`.

### Add / remove controls

Each selected day should support:

- **Add time block** — append another start/end pair
- **Remove time block** — delete one pair
- Optional: **Copy Monday to selected days** is fine, as long as the payload still sends a separate `DaySchedule` per day

---

## 3. Frontend state shape

Replace the old form state with this:

```ts
type TimeSlot = {
  startTime: string; // "9:00 AM"
  endTime: string;   // "12:00 PM"
};

type DaySchedule = {
  day: "mon" | "tue" | "wed" | "thur" | "fri" | "sat" | "sun";
  slots: TimeSlot[];
};

type Availability = {
  schedule: DaySchedule[];
};
```

### Old state to delete

```ts
// DELETE THIS
{
  weekdays: string[];
  startTime: string;
  endTime: string;
}
```

### Mapping loaded API data into the form

When `serviceByAgentAndType` returns:

```json
{
  "availability": {
    "schedule": [
      {
        "day": "mon",
        "slots": [
          { "startTime": "9:00 AM", "endTime": "12:00 PM" },
          { "startTime": "5:00 PM", "endTime": "8:00 PM" }
        ]
      }
    ]
  }
}
```

Render Monday with two rows. Days missing from `schedule` should appear as **off**.

### Mapping form data into the mutation

Only include days that have at least one valid block:

```json
{
  "availability": {
    "schedule": [
      {
        "day": "mon",
        "slots": [
          { "startTime": "9:00 AM", "endTime": "12:00 PM" },
          { "startTime": "5:00 PM", "endTime": "8:00 PM" }
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
}
```

Day key must be exactly: `mon`, `tue`, `wed`, `thur`, `fri`, `sat`, `sun`.  
Note: Thursday is `thur`, not `thu` or `thursday`.

---

## 4. GraphQL fragments to update

Every query/mutation that currently requests:

```graphql
availability {
  weekdays
  startTime
  endTime
}
```

must become:

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

### Files that must change

| App file | Operation |
|---|---|
| `request/mutations/createService.mutation.tsx` | Save new service |
| `request/mutations/updateservice.mutation.tsx` | Update hours |
| `request/queries/getserviceByAgent.query.tsx` | Load hours on setup screen |
| `request/queries/getServicebyServiceType.tsx` | Client agent search |
| `request/queries/matchAgent.query.tsx` | Match closest agent |
| `request/mutations/createBooking.mutation.tsx` | Booking embeds `service.availability` |
| `request/mutations/updateBookingStatus.mutation.tsx` | Same |
| `request/mutations/updateBookingInfo.mutation.tsx` | Same |
| `request/mutations/updateBookingPrice.mutation.tsx` | Same |
| `request/queries/getBookingByID.query.tsx` | Same |
| `request/queries/getAgentBooking.query.tsx` | Same |
| `request/queries/getClientBooking.query.tsx` | Same |

If any of these still query `weekdays`, GraphQL will return an error because those fields were removed.

---

## 5. Client booking screen — expected UI

Clients do **not** pick a raw block like `9:00 AM – 12:00 PM`.  
They pick a **60-minute session** generated from those blocks.

### Example

Agent saved Monday as:

```
9:00 AM – 12:00 PM
5:00 PM – 8:00 PM
```

Client sees Monday as:

```
9:00 AM – 10:00 AM
10:00 AM – 11:00 AM
11:00 AM – 12:00 PM
5:00 PM – 6:00 PM
6:00 PM – 7:00 PM
7:00 PM – 8:00 PM
```

A 90-minute block produces **one** 60-minute slot. The leftover 30 minutes is discarded.

### Client flow

1. Client selects a date
2. App maps that date to a weekday (`mon` … `sun`)
3. App finds that day in `service.availability.schedule`
4. App expands each block into 60-minute slots
5. App shows those slots as the booking time picker
6. Selected slot is sent as `time_of_booking` on `createBookingR`

If the selected weekday is missing from `schedule`, show **No availability**.

---

## 6. Frontend validation before save

Mirror these checks in the UI so the agent sees errors before the API call. The backend will still reject invalid payloads with `status: "400"`.

| Rule | UI behaviour |
|---|---|
| At least one day with slots | Disable Save / show “Select at least one working day” |
| Each working day has ≥ 1 block | Don’t send empty days |
| End time after start time | Inline error on that row |
| Block is at least 60 minutes | Inline error: “Minimum 1 hour” |
| Blocks on the same day don’t overlap | Inline error: “Times overlap” |
| Time format includes AM/PM | Use a time picker that always outputs `"H:MM AM/PM"` |

Show the backend `message` if Save still fails.

---

## 7. Review checklist

Use this while reviewing the app PR.

### Agent availability screen

- [ ] Old single start/end pair for the whole week is gone
- [ ] Each weekday can be toggled independently
- [ ] A selected day can have 2+ time blocks
- [ ] Agent can add a morning block and an evening block on the same day
- [ ] Agent can remove one block without clearing the whole day
- [ ] Re-opening the screen restores all saved blocks from `serviceByAgentAndType`
- [ ] Unselected / empty days are omitted from the payload
- [ ] Thursday is sent as `thur`

### GraphQL

- [ ] No remaining `weekdays`, `startTime`, or `endTime` under `availability`
- [ ] `createService` sends `availability.schedule`
- [ ] `updateServiceById` sends `availability.schedule`
- [ ] Booking queries still compile after the fragment change
- [ ] Types/interfaces for availability were updated (`Availability`, `DaySchedule`, `TimeSlot`)

### Client booking screen

- [ ] Client sees 60-minute slots, not the raw agent blocks
- [ ] Monday morning `9:00 AM – 12:00 PM` shows 3 hourly slots
- [ ] Remainder under 60 minutes is not shown
- [ ] Days with no schedule show no slots
- [ ] Chosen hourly slot is what gets booked

### Error handling

- [ ] Overlapping blocks are blocked in UI or shown from API `message`
- [ ] A 30-minute block is rejected
- [ ] End time before start time is rejected
- [ ] `status: "400"` from create/update is shown to the user

---

## 8. Quick test cases for QA

Use Maya Chen: `+919600395864`, OTP `0000`.

| Test | Setup | Pass if |
|---|---|---|
| Multi-block Monday | Save Mon `9:00 AM–12:00 PM` and `5:00 PM–8:00 PM` | Reload shows both blocks |
| Different hours per day | Mon morning only, Tue evening only | Each day keeps its own hours |
| Overlap rejected | Mon `9:00 AM–12:00 PM` and `11:00 AM–1:00 PM` | Save fails with overlap message |
| Short block rejected | Mon `9:00 AM–9:30 AM` | Save fails, minimum 60 minutes |
| Client hourly slots | Agent Mon `9:00 AM–12:00 PM` | Client sees 9–10, 10–11, 11–12 |
| Day off | No Tuesday blocks | Client sees no Tuesday slots |

---

## 9. Pass / fail for this integration

**Pass** if:

1. Agent UI is a **per-day multi-slot editor**, not one shared time range
2. Save payload matches `AvailabilityInput.schedule`
3. Load payload uses `availability.schedule { day slots { startTime endTime } }`
4. Client booking UI expands blocks into 60-minute slots

**Fail** if:

1. The screen still has one start time and one end time for all days
2. The app still sends `weekdays / startTime / endTime`
3. Queries still request the old availability fields
4. Clients book the raw 3-hour block instead of a 1-hour slot
