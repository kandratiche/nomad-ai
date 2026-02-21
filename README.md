# Nomad AI – React Native Travel App

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

## Project structure

```
nomad-ai/
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
