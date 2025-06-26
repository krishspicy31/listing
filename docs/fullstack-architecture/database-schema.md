# Database Schema

The following SQL Data Definition Language (DDL) represents the table structure for our PostgreSQL database.

```sql
-- This schema represents the tables managed by the Django ORM.
-- Note: Django automatically creates primary keys ('id') and handles some constraints.

-- Table for User Categories (e.g., Music, Dance)
CREATE TABLE "events_category" (
    "id" serial PRIMARY KEY,
    "name" varchar(100) NOT NULL UNIQUE,
    "slug" varchar(100) NOT NULL UNIQUE
);

-- Table for Users (Vendors)
-- This extends the built-in Django user model.
-- Key fields are shown for architectural context.
CREATE TABLE "users_user" (
    "id" serial PRIMARY KEY,
    "password" varchar(128) NOT NULL,
    "last_login" timestamp with time zone,
    "is_superuser" boolean NOT NULL,
    "email" varchar(254) NOT NULL UNIQUE,
    "name" varchar(150) NOT NULL
);

-- Table for Events
CREATE TABLE "events_event" (
    "id" serial PRIMARY KEY,
    "title" varchar(200) NOT NULL,
    "description" text NOT NULL,
    "city" varchar(100) NOT NULL,
    "event_date" timestamp with time zone NOT NULL,
    "image_url" varchar(255) NOT NULL,
    "status" varchar(10) NOT NULL DEFAULT 'pending', -- (pending, approved, rejected)
    "category_id" integer NOT NULL REFERENCES "events_category" ("id") ON DELETE CASCADE,
    "vendor_id" integer NOT NULL REFERENCES "users_user" ("id") ON DELETE CASCADE
);

-- Table for Vendor Notifications
CREATE TABLE "notifications_notification" (
    "id" serial PRIMARY KEY,
    "message" text NOT NULL,
    "is_read" boolean NOT NULL DEFAULT false,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "vendor_id" integer NOT NULL REFERENCES "users_user" ("id") ON DELETE CASCADE,
    "event_id" integer NOT NULL REFERENCES "events_event" ("id") ON DELETE CASCADE
);

-- Indexes for performance on frequently queried columns
CREATE INDEX "events_event_city_idx" ON "events_event" ("city");
CREATE INDEX "events_event_status_idx" ON "events_event" ("status");
CREATE INDEX "events_event_event_date_idx" ON "events_event" ("event_date");
CREATE INDEX "notifications_notification_vendor_id_idx" ON "notifications_notification" ("vendor_id");
CREATE INDEX "notifications_notification_is_read_idx" ON "notifications_notification" ("is_read");

```
