# Picko — Pickleball Court Booking App

Picko is a full-stack pickleball court booking platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

The project started as a general booking app and evolved into a focused pickleball court booking product with customer booking flows, admin operations, Supabase Auth, PostgreSQL, Row Level Security, SQL RPC functions, and Vercel deployment.

Customers can browse courts, choose a date and time, review booking details, confirm a booking, manage their profile, view booking history, filter bookings, and cancel eligible bookings.

Admins can manage courts, generate availability slots, bulk-create slots across date ranges, control slot availability, view customer bookings, filter bookings, inspect booking details, cancel bookings, and add internal booking notes.

## Live Demo

Production URL:

https://picko-booking-app.vercel.app/dashboard

## Repository

https://github.com/hamsterjoe/booking-app

## Screenshots

> Screenshots will be added as the UI becomes more polished.

Suggested screenshots:
public/screenshots/homepage.png
public/screenshots/booking-flow.png
public/screenshots/booking-confirmation.png
public/screenshots/my-bookings.png
public/screenshots/profile-settings.png
public/screenshots/admin-dashboard.png
public/screenshots/admin-slots.png
public/screenshots/admin-bookings.png
public/screenshots/admin-booking-detail.png

Future screenshot layout: 
### Customer Booking Flow
public/screenshots/booking-flow.png
### Admin Slot Management
public/screenshots/admin-slots.png
### Admin Booking Detail
public/screenshots/admin-booking-detail.png

---

## Features

### Customer Features

- Register, log in, and log out with Supabase Auth
- View available pickleball courts
- Choose a booking date
- View available times grouped by time slot
- Choose an available court for that time
- Review booking details before confirming
- Confirm a court booking
- View upcoming bookings
- View booking history grouped by date
- Filter bookings by:
  - all
  - upcoming
  - completed
  - cancelled
- Cancel bookings when allowed
- Update profile details:
  - full name
  - phone number
- View a dashboard summary with next booking and quick actions

### Admin Features

- Protected admin dashboard
- Admin-only navigation
- View system counts:
  - courts
  - slots
  - active bookings
- Create courts
- Edit court details
- Activate/deactivate courts
- Create individual court slots
- Bulk-create court slots for one court and one date
- Skip duplicate slots during bulk slot creation
- Deactivate/reactivate unbooked slots
- Prevent manual changes to booked slots
- Filter admin slots by:
  - date
  - court
  - status
- View all bookings
- Group admin bookings by date
- Filter admin bookings by:
  - date
  - court
  - status
- View customer profile details in admin bookings:
  - name
  - phone number
  - user ID

---

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Supabase SQL functions / RPC
- Vercel
- GitHub
- npm

---

## Portfolio Highlights

This project demonstrates:

- Full-stack application development with the Next.js App Router
- Authentication and protected routes with Supabase Auth
- Relational database design with PostgreSQL
- Row Level Security policies for user/admin access control
- SQL RPC functions for controlled business logic
- Server Actions for form mutations
- Admin-only operational workflows
- Date/time-based booking availability
- Double-booking prevention
- User profile requirements before booking
- Dynamic routes for booking and admin detail pages
- Production deployment on Vercel
- Practical product iteration from generic booking app to pickleball-specific booking platform

---

## Main Booking Flow

Picko uses a date/time-first booking flow:

Choose date → See available times → Choose available court → Review booking → Confirm booking

This flow was chosen because pickleball courts are mostly similar resources. Users usually care more about when they can play than choosing a specific court first.

---

## Demo Walkthrough

A typical customer flow:

1.Register or log in
2.Complete profile with name and phone number
3. Choose a booking date
4. Review available times
5.Select an available court
6. Review booking details
7. Confirm booking
8. View booking in My bookings
9. Cancel booking if eligible

A typical admin flow:

1. Log in as an admin
2. Create or edit courts
3. Generate court slots individually or in bulk
4. Filter slots by date, court, and status
5. Review customer bookings
6. Open booking details
7. Add internal admin notes
8. Cancel bookings operationally if needed

---

## Database Overview

The app uses four main tables:

### `profiles`

Stores user-specific app profile data.

Key columns:

- `id`
- `full_name`
- `phone_number`
- `role`
- `created_at`

Roles:

This flow was chosen because pickleball courts are mostly similar resources. Users usually care more about when they can play than choosing a specific court first.

---

## Database Overview

The app uses four main tables:

### `profiles`

Stores user-specific app profile data.

Key columns:

- `id`
- `full_name`
- `phone_number`
- `role`
- `created_at`

Roles:

This flow was chosen because pickleball courts are mostly similar resources. Users usually care more about when they can play than choosing a specific court first.

---

## Database Overview

The app uses four main tables:

### `profiles`

Stores user-specific app profile data.

Key columns:

- `id`
- `full_name`
- `phone_number`
- `role`
- `created_at`

Roles:

- user
- admin


### `courts`

Stores pickleball court information.

Key columns:

- `id`
- `name`
- `description`
- `location_label`
- `is_indoor`
- `price_per_hour_cents`
- `is_active`
- `created_at`

Money is stored in cents to avoid floating-point issues and to prepare for future payment integration.

### `court_slots`

Stores available court time slots.

Key columns:

- `id`
- `court_id`
- `start_time`
- `end_time`
- `is_available`
- `created_at`

A unique index prevents duplicate slots for the same court and time range.

### `bookings`

Stores customer bookings.

Key columns:

- `id`
- `user_id`
- `slot_id`
- `status`
- `total_price_cents`
- `notes`
- `created_at`

Supported booking statuses:


### `courts`

Stores pickleball court information.

Key columns:

- `id`
- `name`
- `description`
- `location_label`
- `is_indoor`
- `price_per_hour_cents`
- `is_active`
- `created_at`

Money is stored in cents to avoid floating-point issues and to prepare for future payment integration.

### `court_slots`

Stores available court time slots.

Key columns:

- `id`
- `court_id`
- `start_time`
- `end_time`
- `is_available`
- `created_at`

A unique index prevents duplicate slots for the same court and time range.

### `bookings`

Stores customer bookings.

Key columns:

- `id`
- `user_id`
- `slot_id`
- `status`
- `total_price_cents`
- `notes`
- `created_at`

Supported booking statuses:

- pending
- confirmed
- cancelled
- completed

---

## Security and RLS

Picko uses Supabase Row Level Security to protect data.

Current RLS behavior includes:

- Public users can view active courts
- Public users can view available slots
- Users can view their own bookings
- Users can view their own profile
- Users can update their own profile
- Users can view slots connected to their own bookings
- Admins can manage courts
- Admins can manage court slots
- Admins can view all bookings
- Admins can view customer profiles for booking management

Booking creation and cancellation are handled through SQL functions instead of broad direct insert/update policies.

---

## SQL Functions

### `create_booking_for_slot(p_slot_id uuid)`

Used to create bookings safely.

Responsibilities:

- verifies the user is logged in
- checks the slot exists
- checks the slot is available
- checks the court is active
- locks the slot
- creates the booking
- marks the slot unavailable
- prevents double booking

### `cancel_booking(p_booking_id uuid)`

Used to cancel bookings safely.

Responsibilities:

- verifies the user is logged in
- checks the booking belongs to the user
- checks the booking is pending or confirmed
- prevents cancellation within 6 hours of the slot start time
- marks the booking as cancelled
- makes the slot available again

---

## Project Structure

Important files and folders:

app/
    admin/
        page.tsx
        actions.ts
        bookings/
            page.tsx
    courts/
        page.tsx
        [courtId]/
            edit/
                page.tsx
    slots/
        page.tsx
auth/
    actions.ts
bookings/
    actions.ts
    page.tsx
    new/
        page.tsx
    confirm/
        page.tsx
courts/
    page.tsx
    [courtId]/
        page.tsx
dashboard/
    age.tsx
login/
    page.tsx
profile/
    actions.ts
    page.tsx
register/
    age.tsx
components/
    admin/
        SlotFiltersForm.tsx
    auth/
        LogoutButton.tsx
    layout/
        Header.tsx
        Footer.tsx
    ui/
        SubmitButton.tsx
lib/
    auth/
        requireAdmin.ts
    supabase/
        client.ts
        server.ts

---

## Local Development

### 1. Clone the repository
git clone https://github.com/hamsterjoe/booking-app.git
cd booking-app

### 2. Install dependencies
npm install

### 3. Create environment variables

Create a `.env.local` file:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key


Important:

The Supabase URL should be the base project URL, not the `/rest/v1` URL.

Correct:
https://your-project.supabase.co

Incorrect:
https://your-project.supabase.co

### 4. Run the development server
npm run dev

Then open:
http://localhost:3000

---

## Useful Scripts

Run the development server:
npm run dev

Run lint:
npm run lint

Create a production build:
npm run build

Start the production server locally:
npm run start

---

## Deployment

Picko is deployed on Vercel.

Production URL:
https://picko-booking-app.vercel.app/dashboard

Supabase Auth redirect URLs must be configured for both local and production environments.

Example redirect URLs:
http://localhost:3000/
https://picko-booking-app.vercel.app/

---

## Current Limitations

Picko is still an MVP. Some planned improvements are intentionally not built yet.

Current limitations include:

- No payment integration yet
- No email notifications yet
- No recurring automatic slot generation yet
- No advanced customer search
- No visual redesign yet
- No automated notifications yet
- No real payment collection yet
- No screenshot gallery yet

---

## Planned Improvements

Future milestones may include:

- Better customer search for admins
- Peak and non-peak pricing
- Payment provider research
- Stripe or Malaysian payment provider integration
- Email or WhatsApp booking confirmations
- Major UI/UX redesign
- Performance optimization with fewer queries or RPC summary functions
- Add real README screenshots
- Add admin customer search
- Add booking confirmation emails or WhatsApp notifications
- Add payment planning and provider comparison
- Add route-specific skeleton loading screens during redesign
- Add automated tests for booking and admin flows

---

## What I Learned

This project helped me practice:

- building a full-stack app with the Next.js App Router
- using Supabase Auth for authentication
- designing relational database tables
- writing and applying RLS policies
- using SQL functions for safer business logic
- protecting admin routes
- creating server actions
- handling form pending states
- preventing double booking
- validating booking cancellation rules
- deploying a full-stack app to Vercel
- iterating on product flow based on real UX needs

---

## Author

Built by Tang Joe Yue as a full-stack learning project.