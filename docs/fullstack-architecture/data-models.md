# Data Models

### User (Vendor)

**Purpose:** Represents an authenticated event organizer who can log in to the system, submit events, and receive notifications. This will extend Django's built-in User model.

**Key Attributes:**

  * `id`: Unique identifier (UUID or integer).
  * `email`: The user's unique email address for login.
  * `password`: A secure hash of the user's password.
  * `name`: The user's full name or organization name.

**TypeScript Interface (for frontend use):**

```typescript
interface User {
  id: number;
  email: string;
  name: string;
}
```

**Relationships:**

  * A `User` can have many `Events`.
  * A `User` can have many `Notifications`.

### Category

**Purpose:** To categorize events, allowing public users to filter and discover events based on their interests (e.g., Music, Dance, Festival).

**Key Attributes:**

  * `id`: Unique identifier.
  * `name`: The name of the category (e.g., "Music").
  * `slug`: A URL-friendly version of the name (e.g., "music").

**TypeScript Interface:**

```typescript
interface Category {
  id: number;
  name: string;
  slug: string;
}
```

**Relationships:**

  * A `Category` can have many `Events`.

### Event

**Purpose:** The central entity of the application, representing a single cultural event submitted by a vendor.

**Key Attributes:**

  * `id`: Unique identifier.
  * `title`: The title of the event.
  * `description`: A detailed description of the event.
  * `city`: The city where the event will take place.
  * `event_date`: The date and time of the event.
  * `image_url`: The URL of the event's image, hosted on Cloudinary.
  * `status`: The moderation status (`pending`, `approved`, `rejected`).

**TypeScript Interface:**

```typescript
interface Event {
  id: number;
  title: string;
  description: string;
  city: string;
  event_date: string; // ISO 8601 Date string
  image_url: string;
  category: Category; // Nested Category object
}
```

**Relationships:**

  * An `Event` belongs to one `User` (the vendor).
  * An `Event` belongs to one `Category`.

### Notification

**Purpose:** Represents a message shown to a vendor on their dashboard regarding a change in their event's status.

**Key Attributes:**

  * `id`: Unique identifier.
  * `message`: The text of the notification (e.g., "Your event 'Holi Festival' was approved\!").
  * `is_read`: A boolean to track if the vendor has seen the notification.
  * `created_at`: A timestamp for when the notification was generated.

**TypeScript Interface:**

```typescript
interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string; // ISO 8601 Date string
}
```

**Relationships:**

  * A `Notification` belongs to one `User` (the recipient vendor).
  * A `Notification` is related to one `Event`.

