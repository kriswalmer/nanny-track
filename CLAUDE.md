@AGENTS.md

# James Activity Tracker — Nanny App

A Philadelphia Eagles-themed baby activity tracker for a child named James, used by a nanny to log daily care and track hours.

## What This App Does

- **Activity logging**: diaper changes (wet/dry/poop), bottle feedings (oz), sleep/naps, solid food, injuries, and free-form "other" notes
- **Clock in/out**: nanny punches in and out; times are stored as `clockIn`/`clockOut` activity records
- **Diaper alert**: warns if no diaper has been logged in 30+ minutes
- **Weekly summary**: floating 📊 button opens a modal with daily clock-in/out breakdown, total hours, activity counts, and CSV/print export
- **Demo mode**: runs fully offline using `localStorage` when `NEXT_PUBLIC_SUPABASE_URL` is not set (or `NEXT_PUBLIC_DEMO_MODE=true`)

## Tech Stack

- **Next.js 16** with App Router, React 19, TypeScript, Tailwind CSS v4
- **Supabase** for production storage (`@supabase/supabase-js`)
- Data layer is in [lib/supabase.ts](lib/supabase.ts) — all DB calls go through `getActivities`, `addActivity`, `deleteActivity`

## Key Files

| File | Purpose |
|------|---------|
| [app/page.tsx](app/page.tsx) | Root page — orchestrates state, polling, and layout |
| [lib/supabase.ts](lib/supabase.ts) | Supabase client, `Activity` type, all data functions + helper utilities |
| [components/ActivityInput.tsx](components/ActivityInput.tsx) | Clock in/out buttons + activity log form |
| [components/ActivityList.tsx](components/ActivityList.tsx) | Date-grouped accordion list with delete |
| [components/WeeklySummary.tsx](components/WeeklySummary.tsx) | Floating modal with hours/stats + CSV export |
| [components/DiaperAlert.tsx](components/DiaperAlert.tsx) | Red banner alert when 30+ mins since last diaper |
| [components/Header.tsx](components/Header.tsx) | Eagles-themed header with live clock |

## Activity Type Shape

```ts
type ActivityType = 'diaper' | 'feeding' | 'sleep' | 'food' | 'other' | 'clockIn' | 'clockOut' | 'injury';
```

Relevant fields per type:
- `diaper` → `diaperType: 'wet' | 'dry' | 'poop'`
- `feeding` → `amount: number`, `unit: 'oz' | 'ml'`
- `food` / `other` / `injury` → `description: string`

## Supabase Setup (Production)

Create a `activities` table with columns matching the `Activity` interface in [lib/supabase.ts](lib/supabase.ts). Set these env vars:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Without them the app falls back to demo/localStorage mode automatically.

## Theme

Eagles colors: `#004C54` (midnight green), `#A5ACAF` (silver), dark background `#1a1a1a`. All interactive elements use inline styles rather than Tailwind color utilities to keep the Eagles palette precise.
