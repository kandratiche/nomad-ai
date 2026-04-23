# TravelMe – React Native Travel App

A production-ready, cyberpunk-themed travel companion built with **React Native (Expo)** for Kazakhstan (Astana, Almaty, Aktau). Features AI-style itineraries, guide marketplace, safety tools, and glassmorphism UI.

## Features

- **Auth & onboarding**: Welcome (Google/Apple/Guest), city selection, vibe check (12 interests)
- **4-tab app**: Home (AI agent), Explore (map + guides/places), Trips, Profile
- **AI Agent home**: Chat input, quick actions, trending experiences, floating SOS button
- **Timeline**: Connected itinerary view with safety, times, images, WhatsApp booking
- **Explore**: Map-style view, verified guides, popular places, filter tabs
- **Guide profiles**: Dynamic `/guide/[id]`, hero, stats, packages, WhatsApp
- **Safety**: SOS button (long-press), emergency options (112, contact guide)

## Quick start

```bash
npm install
npx expo start
# Then: npx expo start --ios  or  npx expo start --android
```

## Backend setup (Spring Boot ready)

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_BACKEND_BASE_URL` to your Java backend URL.
3. Start backend and run app.

Current migration status:
- Frontend app/auth/services now call Spring Boot endpoints directly.
- Supabase SDK is no longer used in runtime flows.

Accepted response formats for backend routes:
- direct payload (`[]`, `{...}`)
- or envelope (`{ "data": ... }`)

Core routes expected by mobile app:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users/:id`
- `GET /api/v1/cities`
- `GET /api/v1/places`
- `GET /api/v1/places/all`
- `GET /api/v1/places/:id`
- `GET /api/v1/places/pins?city=<name>`
- `GET /api/v1/saved-places?userId=<uuid>`
- `POST /api/v1/saved-places`
- `DELETE /api/v1/saved-places?userId=<uuid>&placeId=<uuid>`
- `GET /api/v1/guides`
- `GET /api/v1/guides/:id`
- `GET /api/v1/trips?userId=<uuid>`
- `POST /api/v1/trips`
- `DELETE /api/v1/trips/:id`
- `GET /api/v1/tours`
- `POST /api/v1/tours`
- `GET /api/v1/tours/:id`
- `GET /api/v1/tours/guide?guideId=<uuid>`
- `POST /api/v1/tours/:tourId/participants`
- `DELETE /api/v1/tours/:tourId/participants?userId=<uuid>`
- `PATCH /api/v1/tour-participants/:participantId`
- `GET /api/v1/tours/bookings?userId=<uuid>`
- `GET /api/v1/tours/:tourId/reviews`
- `POST /api/v1/tours/:tourId/reviews`
- `GET /api/v1/tours/:tourId/messages`
- `POST /api/v1/tours/:tourId/messages`

## Project structure

```
travel-me/
├── app/
│   ├── _layout.tsx          # Root layout, fonts
│   ├── index.tsx            # Welcome / auth
│   ├── city-select.tsx      # City selection
│   ├── vibe-check.tsx       # Interests onboarding
│   ├── timeline.tsx         # AI itinerary view
│   ├── guide/[id].tsx       # Guide profile
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar (glass)
│       ├── index.tsx        # Home (AI agent)
│       ├── explore.tsx      # Map + marketplace
│       ├── trips.tsx        # Saved trips
│       └── profile.tsx      # Profile & settings
├── components/
│   ├── SafetyButton.tsx      # SOS (floating/header/compact)
│   └── ui/
│       ├── GlassCard.tsx
│       └── ThemedText.tsx
├── constants/mockData.ts    # Cities, guides, places, itineraries
├── types.ts
├── global.css
└── tailwind.config.js
```

## Design

- **Colors**: `#0F172A` (bg), `#2DD4BF` (teal), `#10B981` (safe), `#EF4444` (SOS)
- **Fonts**: Inter (body), Montserrat (display) via `@expo-google-fonts/inter` and `@expo-google-fonts/montserrat`
- **UI**: Glassmorphism (BlurView), NativeWind/Tailwind

## User flow

Welcome → City select → Vibe check → Home (tabs). From Home: quick action or chat → Timeline → WhatsApp booking. From Explore: guide card → Guide profile → WhatsApp.

## Safety

Long-press the SOS button (1.5s) for options: Call 112, Contact guide (WhatsApp), or Cancel.

## License

Demonstration project. All rights reserved.
