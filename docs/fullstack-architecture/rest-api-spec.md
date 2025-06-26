# REST API Spec

This specification outlines the API for the CulturaLite platform.

```yaml
openapi: 3.0.0
info:
  title: "CulturaLite API"
  version: "1.0.0"
  description: "API for the CulturaLite platform to manage cultural events."
servers:
  - url: "https://culturalite-api.onrender.com/api"
    description: "Production Server"

components:
  schemas:
    Event:
      type: object
      properties:
        id:
          type: integer
        title:
          type: string
        description:
          type: string
        city:
          type: string
        event_date:
          type: string
          format: date-time
        image_url:
          type: string
          format: uri
        category:
          type: object
          properties:
            name:
              type: string
            slug:
              type: string
    LoginRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
    LoginResponse:
      type: object
      properties:
        access:
          type: string
          description: "JWT Access Token"
        refresh:
          type: string
          description: "JWT Refresh Token"

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

paths:
  /events/:
    get:
      summary: "List Approved Events"
      description: "Public endpoint to fetch all approved events. Supports filtering by city and category."
      parameters:
        - in: query
          name: city
          schema:
            type: string
          required: false
        - in: query
          name: category
          schema:
            type: string
          required: false
      responses:
        '200':
          description: "A list of approved events."
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Event'

  /auth/register/:
    post:
      summary: "Register New Vendor"
      responses:
        '201':
          description: "Vendor created successfully."

  /auth/login/:
    post:
      summary: "Vendor Login"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: "Login successful, returns JWT tokens."
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'
        '401':
          description: "Unauthorized"

  /dashboard/events/:
    get:
      summary: "List Vendor's Events"
      security:
        - bearerAuth: []
      responses:
        '200':
          description: "A list of events submitted by the authenticated vendor."
    post:
      summary: "Submit New Event"
      security:
        - bearerAuth: []
      requestBody:
        description: "Event data and image to upload."
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                # ... other event fields
                image:
                  type: string
                  format: binary
      responses:
        '201':
          description: "Event submitted successfully."
```
