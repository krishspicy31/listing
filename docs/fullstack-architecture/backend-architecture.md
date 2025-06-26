# Backend Architecture

### Service Architecture

Our backend will be a **traditional server-based application** built with the Django framework. It will not use a serverless (FaaS) approach. Logic and routing will be organized within modular Django "apps".

**Route Organization:**
URL routing will be managed via Django's `urls.py` files. A root `urls.py` file will delegate to app-specific `urls.py` files (e.g., an `events` app will have its own `events/urls.py`). This keeps our routing clean and organized.

**View/Controller Structure:**
We will use Django REST Framework's class-based views (`APIView` or `ViewSets`) to handle incoming requests. This provides a structured way to separate logic for different HTTP methods (GET, POST, etc.).

**Example View Template:**

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import EventSerializer
from .models import Event
from rest_framework.permissions import IsAuthenticated

class EventListView(APIView):
    """
    An example view to list events for an authenticated vendor.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        """
        Return a list of all events for the current user.
        """
        events = Event.objects.filter(vendor=request.user)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
```

### Database Architecture

  * **Schema Design:** The definitive database schema has already been defined in the `## Database Schema` section. All tables and relationships will be created and managed via Django's built-in migration system (`manage.py makemigrations` and `manage.py migrate`).
  * **Data Access Layer:** All database interactions **must** be performed through the **Django ORM**. Raw SQL queries will be avoided unless absolutely necessary for a specific, documented performance optimization. This ensures portability and security. We will adhere to the principle of "fat models, thin views," placing business logic within the model layer where appropriate.

### Authentication and Authorization

  * **Authentication Flow (JWT Login):** The diagram below illustrates how a vendor logs in and uses their token.
    ```mermaid
    sequenceDiagram
        participant Frontend
        participant Backend

        Frontend->>Backend: POST /api/auth/login/ (with email, password)
        Backend->>Backend: Validate credentials
        Backend->>Backend: Generate JWT Access & Refresh Tokens
        Backend-->>Frontend: Return tokens in response
        Frontend->>Frontend: Securely store tokens
        loop For authenticated requests
            Frontend->>Backend: GET /api/dashboard/events/ (with Bearer Token)
            Backend->>Backend: Validate JWT
            Backend-->>Frontend: Return protected data
        end
    ```
  * **Authorization (Endpoint Protection):** We will use Django REST Framework's permission system to protect endpoints. Views that require an authenticated vendor will include `permission_classes = [IsAuthenticated]`. We can create custom permission classes if more granular, role-based rules are needed in the future.


