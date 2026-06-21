# Picko — Pickleball Court Booking App

Picko is a full-stack pickleball court booking platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

The project started as a general booking app and evolved into a focused pickleball court booking product with customer booking flows, admin operations, Supabase Auth, PostgreSQL, Row Level Security, SQL RPC functions, and Vercel deployment.

Customers can browse active courts, choose available slots, review booking details, complete required profile information, confirm bookings, view booking history, filter bookings, open booking detail pages, and cancel eligible bookings.

Admins can manage courts, generate availability slots, bulk-create slots across date ranges, preview slot generation estimates, filter slots, search customer bookings, view booking details, cancel bookings operationally, and add internal booking notes.

The current version has passed a production QA pass and is near portfolio-ready MVP status.

## Live Demo

Production URL:

https://picko-booking-app.vercel.app/dashboard

## Repository

https://github.com/hamsterjoe/booking-app

## Screenshots

## Screenshots

Screenshots will be captured after the next major UI redesign so the README reflects the polished visual version of the product.

Planned screenshots:

- Homepage
- Customer booking flow
- Booking confirmation step
- My bookings page
- Booking detail page
- Profile settings
- Admin dashboard
- Admin slot management
- Admin bookings list
- Admin booking detail page

Planned screenshot paths:
​
public/screenshots/homepage.png
public/screenshots/booking-flow.png
public/screenshots/booking-confirmation.png
public/screenshots/my-bookings.png
public/screenshots/booking-detail.png
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
- Browse active courts only
- Choose a booking date
- View available times grouped by time slot
- Choose an available court for that time
- Review booking details before confirming
- Require completed profile before booking:
  - full name
  - country code
  - phone number
- Return to booking confirmation after completing profile
- Confirm a court booking
- View upcoming bookings
- View booking history grouped by date
- Filter bookings by:
  - all
  - upcoming
  - completed
  - cancelled
- View individual booking detail pages
- Cancel bookings when allowed
- Update profile details:
  - full name
  - country code
  - phone number
- View loading states during route transitions
- View helpful empty states when no records match
- View custom error and not-found pages
- View a dashboard summary with next booking and quick actions

### Admin Features

- Protected admin dashboard
- Admin-only navigation
- Admin-only route protection
- View system counts:
  - courts
  - slots
  - active bookings
- Create courts
- Edit court details
- Activate/deactivate courts
- Create individual court slots
- Bulk-create court slots for one court across a date range
- Preview live bulk slot generation estimate before submitting
- Skip duplicate slots during bulk slot creation
- Limit bulk slot generation to safe production limits
- Deactivate/reactivate unbooked slots
- Prevent manual changes to booked slots
- Filter admin slots by:
  - date
  - court
  - status
- Preserve scroll position when filtering slots
- View all bookings
- Group admin bookings by slot date
- Filter admin bookings by:
  - date
  - court
  - status
- Search customer bookings by:
  - customer name
  - phone number
  - user ID
- Preserve filters/search when opening booking detail pages
- View customer profile details in admin bookings:
  - name
  - phone number
  - user ID
- View admin booking detail pages
- Cancel bookings as an admin
- Add and update internal admin booking notes
- View loading states during route transitions
- View helpful empty states when no records match

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

## Production QA

A production QA checklist is included in the repository:
docs/qa-checklist.md

The checklist covers:

- Public pages
- Authentication
- Profile completion
- Customer booking flow
- Customer booking management
- Admin court management
- Admin slot management
- Admin booking management
- Access control
- Empty states
- Loading states
- Error and not-found pages
- Production regression checks

The current production build has passed the QA checklist with no known issues.
---

## Main Booking Flow

Picko uses a date/time-first booking flow:

Choose date → See available times → Choose available court → Review booking → Confirm booking


This flow was chosen because pickleball courts are mostly similar resources. Users usually care more about when they can play than choosing a specific court first.

Before confirming a booking, users must complete their profile with a full name and phone number. If their profile is incomplete, they are redirected to the profile page and returned to the booking confirmation step after saving.

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

- `user`
- `admin`

Phone numbers are stored as a combined country code and local number value, for example:
+60 123456789

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

Inactive courts are hidden from public booking flows.

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

Booked slots are marked unavailable and should not appear as bookable.

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

Supported stored booking statuses:

- `pending`
- `confirmed`
- `cancelled`

The UI may display past confirmed bookings as `completed` when the related slot end time has already passed.


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

### `public.is_admin()`

Used as a safe helper for admin-only Row Level Security checks and admin RPC functions.

This avoids recursive profile policies when checking whether the current user has the `admin` role.

### `admin_cancel_booking(p_booking_id uuid)`

Used by admins to cancel bookings operationally.

Responsibilities:

- verifies the user is logged in
- verifies the user is an admin
- checks the booking is pending or confirmed
- allows admin cancellation even within the normal customer cancellation cutoff
- marks the booking as cancelled
- makes the slot available again

### `admin_update_booking_notes(p_booking_id uuid, p_notes text)`

Used by admins to update internal booking notes.

Responsibilities:

- verifies the user is logged in
- verifies the user is an admin
- updates `bookings.notes`
- stores empty notes as `null`
---

## Project Structure

Important files and folders:

app/
  admin/
    actions.ts
    page.tsx
    loading.tsx
    bookings/
      page.tsx
      loading.tsx
      [bookingId]/
        page.tsx
    courts/
      page.tsx
      [courtId]/
        edit/
          page.tsx
    slots/
      page.tsx
      loading.tsx
  auth/
    actions.ts
  bookings/
    actions.ts
    page.tsx
    loading.tsx
    new/
      page.tsx
      loading.tsx
    confirm/
      page.tsx
    [bookingId]/
      page.tsx
  dashboard/
    page.tsx
    loading.tsx
  login/
    page.tsx
  profile/
    actions.ts
    page.tsx
  register/
    page.tsx
  error.tsx
  not-found.tsx

components/
  admin/
    BulkSlotForm.tsx
    SlotFiltersForm.tsx
  auth/
    LogoutButton.tsx
  layout/
    Header.tsx
  ui/
    PageLoading.tsx
    SubmitButton.tsx

docs/
  qa-checklist.md

lib/
  auth/
    requireAdmin.ts
  supabase/
    client.ts
    server.ts

public/
  screenshots/
    .gitkeep

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
https://your-project.supabase.co/rest/v1

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
- No email or WhatsApp notifications yet
- No recurring automatic slot generation yet
- No major visual redesign yet
- No screenshot gallery yet
- No automated test suite yet
- No advanced analytics or reporting yet

---

## Planned Improvements

Future milestones may include:

- Major UI/UX redesign
- Real README screenshot gallery after redesign
- Portfolio demo script
- Peak and non-peak pricing
- Payment provider research
- Stripe or Malaysian payment provider integration
- Email or WhatsApp booking confirmations
- Recurring automatic slot generation
- Automated tests for booking and admin flows
- Performance optimization with fewer queries or RPC summary functions
- Monitoring and production error tracking

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