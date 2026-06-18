# Picko QA Checklist

Use this checklist before major commits, deployments, or portfolio demos.

## Environments

Test in:

- [ ] Local development
- [ ] Production on Vercel

Production URL:
https://picko-booking-app.vercel.app/


---

## 1. Public Pages

### Homepage

- [ ] Homepage loads
- [ ] Picko branding appears correctly
- [ ] Header navigation works
- [ ] Footer appears correctly

### Courts Page

- [ ] `/courts` loads
- [ ] Active courts appear
- [ ] Inactive courts do not appear publicly
- [ ] Court name, location, type, and price display correctly

### Court Detail Page

- [ ] Court detail page loads for an active court
- [ ] Court details display correctly
- [ ] Available slots appear when slots exist
- [ ] Unavailable/booked slots do not appear as publicly bookable

---

## 2. Authentication

### Register

- [ ] `/register` loads
- [ ] User can register with email/password
- [ ] Registration success message appears
- [ ] Supabase email confirmation flow works if enabled

### Login

- [ ] `/login` loads
- [ ] User can log in
- [ ] Invalid login shows an error
- [ ] Successful login redirects to dashboard

### Logout

- [ ] Logged-in user can log out
- [ ] Logout redirects correctly
- [ ] Logged-out user sees public navigation

---

## 3. Profile

### Profile Access

- [ ] Logged-out user visiting `/profile` redirects to login
- [ ] Logged-in user can access `/profile`

### Profile Update

- [ ] User can update full name
- [ ] User can select country code
- [ ] User can update phone number
- [ ] Phone number validation rejects invalid numbers
- [ ] User can clear phone number
- [ ] Success message appears after saving
- [ ] Admin booking views show updated name/phone

---

## 4. Customer Booking Flow

### View Availability

- [ ] `/bookings/new` loads
- [ ] User can choose a date
- [ ] Available times appear grouped by time
- [ ] Available courts appear under each time
- [ ] Inactive courts do not appear
- [ ] Booked/unavailable slots do not appear

### Profile Requirement

- [ ] User with incomplete profile is redirected to `/profile`
- [ ] Profile page shows completion message
- [ ] After saving profile, user returns to booking confirmation page
- [ ] User with complete profile can continue booking

### Booking Confirmation

- [ ] User can click Review booking
- [ ] `/bookings/confirm` displays correct:
  - [ ] date
  - [ ] time
  - [ ] court
  - [ ] location
  - [ ] type
  - [ ] price
- [ ] Confirm booking creates booking
- [ ] Confirmed booking appears in `/bookings`
- [ ] Slot disappears from public availability after booking

### Double Booking Protection

- [ ] Same slot cannot be booked twice
- [ ] If slot becomes unavailable before confirmation, user sees an error

---

## 5. Customer Bookings

### Booking List

- [ ] `/bookings` loads for logged-in user
- [ ] Upcoming bookings display correctly
- [ ] Booking history displays correctly
- [ ] Bookings are grouped by date
- [ ] Filters work:
  - [ ] all
  - [ ] upcoming
  - [ ] completed
  - [ ] cancelled

### Booking Detail

- [ ] User can open `/bookings/[bookingId]`
- [ ] Booking details display correctly
- [ ] Invalid booking ID shows 404
- [ ] User cannot view another user's booking detail
- [ ] Back link preserves selected filter

### Customer Cancellation

- [ ] Eligible booking shows Cancel booking
- [ ] Booking within 6 hours cannot be cancelled
- [ ] Cancelled booking status updates
- [ ] Cancelled slot becomes available again
- [ ] Cancellation works from booking list
- [ ] Cancellation works from booking detail page

---

## 6. Dashboard

- [ ] `/dashboard` redirects logged-out users to login
- [ ] Dashboard loads for logged-in users
- [ ] User email displays correctly
- [ ] Next booking displays correctly if one exists
- [ ] Upcoming booking count is correct
- [ ] Quick action links work
- [ ] Profile settings link works

---

## 7. Admin Access

### Admin Protection

- [ ] Non-admin user cannot access `/admin`
- [ ] Non-admin user is redirected correctly
- [ ] Admin user can access `/admin`
- [ ] Admin nav link appears only for admins

### Admin Dashboard

- [ ] Admin dashboard loads
- [ ] Court count displays
- [ ] Slot count displays
- [ ] Active booking count displays
- [ ] Admin tool links work

---

## 8. Admin Courts

### Court Management

- [ ] `/admin/courts` loads
- [ ] Admin can create court
- [ ] Duplicate court name shows friendly error
- [ ] Admin can edit court details
- [ ] Admin can activate court
- [ ] Admin can deactivate court
- [ ] Inactive court is hidden publicly
- [ ] Inactive court is not bookable

---

## 9. Admin Slots

### Single Slot Creation

- [ ] `/admin/slots` loads
- [ ] Admin can create one slot
- [ ] Duplicate slot shows friendly error
- [ ] Created slot appears in admin slot list
- [ ] Created slot appears in customer booking flow if available

### Bulk Slot Creation

- [ ] Admin can bulk-create slots for one day
- [ ] Admin can bulk-create slots across a date range
- [ ] Duplicate slots are skipped
- [ ] 14-day date range limit works
- [ ] 100-slot safety limit works

### Slot Controls

- [ ] Available slot can be deactivated
- [ ] Blocked slot can be reactivated
- [ ] Booked slot cannot be manually changed from slot controls
- [ ] Reactivating checks for active bookings first

### Slot Filters

- [ ] Filter by date works
- [ ] Filter by court works
- [ ] Filter by available status works
- [ ] Filter by booked status works
- [ ] Filter by blocked status works
- [ ] Filter form preserves scroll position

---

## 10. Admin Bookings

### Booking List

- [ ] `/admin/bookings` loads
- [ ] Bookings are grouped by date
- [ ] Effective status works:
  - [ ] past confirmed booking displays as completed
- [ ] Customer profile info appears:
  - [ ] name
  - [ ] phone
  - [ ] user ID

### Booking Filters

- [ ] Filter by date works
- [ ] Filter by court works
- [ ] Filter by status works
- [ ] Reset filters works

### Booking Detail

- [ ] Admin can open `/admin/bookings/[bookingId]`
- [ ] Invalid booking ID shows 404
- [ ] Back link preserves filters
- [ ] Detail page shows:
  - [ ] stored status
  - [ ] effective status
  - [ ] customer info
  - [ ] slot info
  - [ ] court info
  - [ ] system IDs

### Admin Cancellation

- [ ] Admin can cancel pending booking
- [ ] Admin can cancel confirmed booking
- [ ] Admin cancellation works within 6 hours
- [ ] Cancelled booking updates status
- [ ] Cancelled slot becomes available again
- [ ] Completed/cancelled bookings cannot be cancelled again

### Admin Notes

- [ ] Admin can add booking notes
- [ ] Admin can edit booking notes
- [ ] Admin can clear booking notes
- [ ] Notes persist after refresh

---

## 11. Loading and Pending States

### Button Pending States

- [ ] Booking button shows pending state
- [ ] Cancellation button shows pending state
- [ ] Profile save button shows pending state
- [ ] Admin create/edit actions show pending state

### Route Loading States

- [ ] Dashboard loading state appears when route is slow
- [ ] Bookings loading state appears when route is slow
- [ ] Booking flow loading state appears when route is slow
- [ ] Admin loading states appear when routes are slow

---

## 12. Production Checks

### Vercel

- [ ] Production deployment succeeds
- [ ] Environment variables are configured
- [ ] Production URL works
- [ ] No build errors
- [ ] No runtime errors in Vercel logs

### Supabase

- [ ] Production Supabase URL is correct
- [ ] Supabase anon key is configured
- [ ] Auth Site URL is correct
- [ ] Redirect URLs include production URL
- [ ] RLS is enabled on required tables
- [ ] RPC functions exist and have execute grants

---

## 13. Regression Checks After Major Changes

After changing booking logic:

- [ ] Booking creation still works
- [ ] Double booking protection still works
- [ ] Slot availability updates correctly
- [ ] Booking cancellation still works
- [ ] RLS still protects user bookings

After changing admin logic:

- [ ] Admin access still works
- [ ] Non-admin access is blocked
- [ ] Admin court/slot/booking tools still work

After changing profile logic:

- [ ] Profile save works
- [ ] Profile-required booking flow works
- [ ] Admin booking customer info still displays

---

## Notes

Add issues discovered during QA here:
Date:
Environment:
Issue:
Steps to reproduce:
Expected:
Actual:
Status:
