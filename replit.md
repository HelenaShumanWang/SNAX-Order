# SNAX - Healthy Snack Pre-Order App

## Overview
SNAX ("Future Me Ordered This") is a mobile-first web app that helps college students make healthier late-night food choices by pre-ordering healthy snacks in the morning. Features behavioral interventions like eat-rate tracking, streak counters, gamification, and social accountability.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/UI, Wouter (routing), TanStack Query, Framer Motion
- **Backend:** Node.js, Express, PostgreSQL (via Drizzle ORM)
- **Auth:** Session-based (express-session with connect-pg-simple)

## Project Structure
```
client/src/
  App.tsx          - Main app with routing (auth-gated)
  lib/auth.tsx     - Auth context provider
  lib/cart.tsx     - Cart context provider (client-side state)
  components/      - Shared components (bottom-nav, streak-badge)
  pages/           - All page components:
    landing.tsx    - Start/landing page
    signup.tsx     - Sign up
    login.tsx      - Log in
    home.tsx       - Main dashboard
    catalog.tsx    - Browse snacks (filter, search)
    item-details.tsx - Single item view
    chatbot.tsx    - FAQ chatbot per item
    cart.tsx       - Shopping cart
    checkout.tsx   - Checkout with pledge
    confirmation.tsx - Order confirmation with status tracking
    tracker.tsx    - Eat-rate confirmation
    reward.tsx     - Success page (streak celebration)
    loss.tsx       - Gentle failure page
    feedback.tsx   - Star rating + comment
    profile.tsx    - User profile (stats, orders, settings)
    friends.tsx    - Friends list & management

server/
  index.ts         - Express server entry
  routes.ts        - All API endpoints
  storage.ts       - Database storage layer (IStorage interface)
  db.ts            - Drizzle/pg connection
  seed.ts          - Seed 10 snack items

shared/
  schema.ts        - Drizzle schema (users, items, orders, order_items, eat_rate_confirmations, friends, feedback)
```

## Database Tables
- users, items, orders, order_items, eat_rate_confirmations, friends, feedback

## Key Features
- Auth: signup/login with session cookies
- Catalog: browsing, search, category filtering
- Cart: client-side with quantity management
- Orders: checkout with pledge system, simulated delivery tracking
- Eat-rate tracking: post-delivery consumption logging
- Streaks: consecutive healthy eating days
- Friends: add friends, view stats, send nudges
- Feedback: star ratings + comments

## Design
- Primary color: Teal (#0D9488) - mapped to CSS custom properties
- Accent: Orange (#F97316) used for streaks/highlights
- Mobile-first layout (max-w-lg centered)
- Bottom navigation bar for authenticated users
- Inter font family
