# Epic 2: Vendor & Admin Workflows

**Goal:** This epic focuses on building the 'supply-side' of the platform. It will enable event organizers (vendors) to create accounts, log in, and submit their events for moderation. It also includes the necessary tools for administrators to review and approve these submissions and an in-dashboard system for vendors to receive notifications about their submission status.

### Story 2.1: Implement Vendor Registration & JWT Login

* **As a** Vendor,
* **I want to** create an account and log in securely,
* **so that** I can access my private dashboard to submit events.

#### Acceptance Criteria

1.  A user registration API endpoint is created in the Django backend.
2.  A login API endpoint is created that returns a JWT token upon successful authentication.
3.  A specific 'Vendor' user role is established to differentiate from 'Admin' users.
4.  The Next.js frontend provides clear Registration and Login pages with the necessary forms.
5.  Upon successful login, the returned JWT is securely stored on the client-side.
6.  Subsequent authenticated API requests from the frontend correctly include the JWT for authorization.

### Story 2.2: Build Event Submission Form

* **As a** logged-in Vendor,
* **I want to** fill out a form to submit a new event, including an image,
* **so that** it can be reviewed for public listing.

#### Acceptance Criteria

1.  A secure, authenticated API endpoint is created to accept new event submissions.
2.  The backend automatically associates each new event with the currently authenticated vendor.
3.  All newly submitted events default to a 'pending' status.
4.  The frontend features a dedicated page with a form for event submission.
5.  The form correctly integrates with Cloudinary for image uploads, and the resulting image URL is saved with the event data.
6.  The vendor is redirected to their dashboard with a success message after submitting the form.

### Story 2.3: Create Vendor Dashboard with Event List

* **As a** logged-in Vendor,
* **I want to** see a list of all the events I have submitted and their current status,
* **so that** I can track my submissions.

#### Acceptance Criteria

1.  A secure API endpoint is created that returns a list of events submitted *only* by the currently authenticated vendor.
2.  A private dashboard page is created in the frontend, accessible only to logged-in vendors.
3.  The dashboard displays a list or table of the vendor's events, showing at a minimum the event title and its current status ('Pending', 'Approved', 'Rejected').

### Story 2.4: Enable Admin Moderation in Django Admin

* **As an** Admin,
* **I want to** use the Django Admin interface to review pending events and approve or reject them,
* **so that** I can curate the content on the public site.

#### Acceptance Criteria

1.  The `Event` model in the Django Admin is configured to easily filter for events with a 'pending' status.
2.  An Admin user can directly change an event's status to 'approved' or 'rejected' from the event's detail page in the Django Admin.
3.  Saving this change correctly updates the event's status in the database.

### Story 2.5: Implement In-Dashboard Notifications

* **As a** logged-in Vendor,
* **I want to** see a notification on my dashboard when the status of my event is changed by an admin,
* **so that** I am immediately aware of the outcome.

#### Acceptance Criteria

1.  A `Notification` model is created in the Django backend that links a message to a specific vendor and event.
2.  When an admin approves or rejects an event, a new `Notification` is automatically created for that event's vendor.
3.  A secure API endpoint is created for a vendor to fetch their notifications.
4.  The vendor dashboard UI displays a notification indicator (e.g., a bell icon) and a list of recent, human-readable notifications (e.g., "Your event 'Holi Festival 2025' was approved.").
5.  A mechanism exists for the vendor to mark notifications as 'read'.

