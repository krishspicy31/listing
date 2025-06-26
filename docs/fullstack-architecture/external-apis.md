# External APIs

### Cloudinary API

* **Purpose:** To securely handle all event image uploads, storage, transformation, and delivery via a global Content Delivery Network (CDN).
* **Documentation:** `https://cloudinary.com/documentation`
* **Authentication:** The integration will use an `API Key` and `API Secret`. These credentials must be stored securely as environment variables in our Django backend and should never be exposed to the frontend.
* **Rate Limits:** We will operate within the rate limits of the chosen Cloudinary plan. The free tier is expected to be sufficient for the MVP's initial needs.
* **Key Endpoints Used:**
    * `POST /v1_1/{cloud_name}/image/upload` - This action will be performed by our backend to upload new event images.
* **Integration Notes:** To maintain security, the image upload process will be handled exclusively by the Django backend. A vendor will upload an image to our frontend, which will send it to our backend. Our backend will then securely stream the image to the Cloudinary API using its secret credentials. Only the resulting, safe-to-share Cloudinary URL will be stored in our database and sent back to the frontend.

