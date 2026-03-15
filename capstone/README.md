# HireFlow - Unified Hiring Platform

HireFlow is a comprehensive, full-stack web application that revolutionizes the hiring process by providing a unified platform for companies, representatives, and applicants. Built with Django REST Framework for the backend and React for the frontend, this project demonstrates advanced web development concepts including JWT authentication, real-time data management, and complex user workflows.

## Distinctiveness and Complexity

This project stands apart from typical CS50W projects through its sophisticated architecture and comprehensive feature set. Unlike other projects that focus on single-user applications or simple CRUD operations, HireFlow implements a multi-user ecosystem with distinct roles, complex state management, and real-world business logic.

**Technical Complexity:**
- **Full-Stack Architecture**: Unlike most CS50W projects that use a single technology stack, HireFlow employs Django REST Framework for the backend API and React for the frontend, requiring mastery of both Python and JavaScript ecosystems.
- **Advanced Authentication System**: Implemented JWT-based authentication instead of Django's built-in session management, requiring deep understanding of token-based security, refresh mechanisms, and cross-origin authentication.
- **Complex Data Relationships**: The application manages intricate relationships between Companies, Representatives, Applicants, Postings, Applications, and Interviews, each with their own validation rules and business logic.
- **Dynamic UI Components**: Created reusable, role-based components that adapt their functionality based on user permissions, requiring sophisticated state management and conditional rendering.
- **Real-time Application Workflow**: Implemented a comprehensive application review system with status transitions, interview scheduling, and completion tracking which mirrors real-world hiring processes.

**Distinctive Features:**
- **Unified Platform Approach**: Unlike traditional job boards that separate company and applicant experiences, HireFlow provides a seamless ecosystem where all users interact within the same platform.
- **Verification System**: Unique public verification feature allows third parties to verify application authenticity using UID-based access, reducing administrative overhead therefore speeding up processes.
- **Invitation-Based Registration**: Companies can invite representatives using secure token-based invitations, ensuring controlled access to the platform.
- **Advanced Security**: Implemented UID-based identification, 8-character public/private code systems, and role-based access control throughout the application ensures the system is running with industry standards.

The project required extensive planning and iterative development, as unlike other CS50W projects with predefined specifications, this entire system was designed from scratch, requiring constant adaptation and refinement throughout development.

## Project Structure

### Backend (Django REST Framework)

**`backend/`** - Django project root
- **`api/`** - Main application containing all models, views, and serializers
  - **`models.py`** - Database models for Companies, Representatives, Applicants, Postings, Applications, Interviews, and Watchlist
  - **`views.py`** - API endpoints for CRUD operations, dashboard data, and business logic
  - **`serializers.py`** - Data serialization for API responses with complex nested relationships
  - **`auth_views.py`** - Custom authentication endpoints for login, registration, and invitation handling
  - **`urls.py`** - URL routing for all API endpoints
  - **`admin.py`** - Django admin interface configuration
  - **`migrations/`** - Database migration files for schema evolution
- **`backend/`** - Django project settings
  - **`settings.py`** - Django configuration including CORS, JWT, and database settings
  - **`urls.py`** - Main URL routing
- **`manage.py`** - Django management script
- **`requirements.txt`** - Python dependencies

### Frontend (React)

**`frontend/`** - React application
- **`src/`** - Source code
  - **`assets/`** - CSS stylesheets and static assets
  - **`components/`** - Reusable UI components organized by user type
    - **`modals/`** - Modal components for forms and confirmations
    - **`sidebars/`** - Navigation components for different user types
    - **`topnavs/`** - Header navigation components
    - **`applications/`** - User's applications specific components
  - **`contexts/`** - React context providers for authentication and state management
  - **`hooks/`** - Custom React hooks for loader functionality
  - **`pages/`** - Route components organized by user type
    - **`admin/`** - Company admin dashboard
    - **`rep/`** - Representative dashboard and management pages
    - **`applicant/`** - Applicant dashboard and application pages
  - **`sass/`** - Custom bootstrap sass variables
  - **`services/`** - API service layer for backend communication
  - **`utils/`** - Utility functions and helpers
- **`public/`** - Static assets and HTML template
- **`package.json`** - Node.js dependencies and scripts

## Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate.bat (without the source)
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start Django development server:**
   ```bash
    #Run on localhost (default) or bind to your LAN IP for remote access:
    python manage.py runserver [your-IP]:8000
   ```

The backend will be available at `http://localhost:8000` or at `http://your-ip-address:8000`

### API Communication Setup

1. Navigate to the `frontend/src/services` folder.
2. Open both the files and navigate where `API_BASE_URL` is defined and update it to point to your backend URL. For example:

   ```js
   // frontend/src/services/auth.js & api.js
   export const API_BASE_URL = 'http://your-backend-address:8000';
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start React development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` or `http://localhost:5174`


## Python Dependencies

The following Python packages are required and listed in `backend/requirements.txt`:

- **asgiref** - ASGI utilities for Django
- **Django** - Web framework
- **django-cors-headers** - CORS support for cross-origin requests
- **djangorestframework** - REST API framework
- **djangorestframework-simplejwt** - JWT authentication
- **PyJWT** - JSON Web Token implementation
- **pytz** - Timezone support
- **sqlparse** - SQL parsing utilities
- **python-dotenv** - Environment variable management

## Key Features

### Multi-User Authentication System
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Representative, Applicant)
- Secure invitation system for company representatives
- Password validation and security measures

### Company Management
- Company registration with verification system
- Representative invitation and management
- Public company profiles with posting listings
- Admin dashboard for company oversight

### Job Posting System
- Rich posting creation with multiple job types
- Required documents specification
- Payment and compensation details
- Status management and filtering

### Application Workflow
- Comprehensive application submission process
- Multi-stage review system (Unopened → Under Review → Interview Scheduled → Active → Completed)
- Interview scheduling with location/online options
- Feedback and completion tracking

### Applicant Features
- Universal profile system
- Application tracking and status monitoring
- Watchlist functionality
- Public verification system

### Verification System
- Public UID-based verification for third parties
- Secure access using application UID, last name, and email
- Reduces administrative overhead for verification requests

## Additional Information

### Development Challenges Overcome

1. **Cross-Stack Communication**: Successfully integrated Django REST Framework with React, handling CORS, authentication, and real-time data synchronization.

2. **Complex State Management**: Implemented sophisticated state management for multi-user workflows, ensuring data consistency across different user roles.

3. **Security Implementation**: Developed secure UID-based identification system and implemented proper JWT token management with refresh mechanisms.

4. **Dynamic UI Components**: Created reusable components that adapt functionality based on user permissions and application state.

5. **Data Validation**: Implemented comprehensive validation on both client and server sides, ensuring data integrity throughout the application.

### Performance Optimizations

- Lazy loading of React components for improved initial load times
- Optimized database queries with select_related and prefetch_related
- Efficient state management to minimize unnecessary re-renders
- Proper error handling and user feedback throughout the application

### Testing and Quality Assurance

The application includes comprehensive error handling, input validation, and user feedback mechanisms. The modular architecture allows for easy testing and maintenance, with clear separation of concerns between frontend and backend components.

This project demonstrates advanced web development concepts and provides a solid foundation for real-world internship hiring platforms, showcasing the complexity and sophistication expected in modern web applications. 

Incase a modal opens and disappears please refresh the page as it is a bug I haven't been able to solve yet.
