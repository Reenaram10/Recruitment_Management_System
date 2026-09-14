# NEC Staff Recruitment Portal

A full-stack **staff recruitment management portal** designed to manage candidate profiles, academic qualifications, experience, certifications, applications, administrative workflows, recruitment weightage configuration, and supporting documents through a centralized web application.

## Overview

The NEC Staff Recruitment Portal provides separate workflows for candidates and administrators.

### Candidate Side
Candidates can:
- Register and authenticate securely.
- Maintain their personal profile.
- Enter and update academic qualifications.
- Add professional experience.
- Manage certifications and other profile information.
- Upload supporting documents.
- Review submitted application information.
- Generate/print an application form.
- Interact with the integrated chatbot assistant.

### Admin Side
Administrators can:
- Manage and review recruitment data.
- View candidate/application information.
- Configure recruitment weightages.
- Work with department/designation-related recruitment data.
- Review uploaded supporting documents.
- Generate and work with applicant datasets/reports.

## Key Features

- Admin recruitment management
- Authentication and session handling
- Chatbot assistance
- Application/printable form generation
- Recruitment weightage configuration

Additional project capabilities include:
- Normalized database design.
- PostgreSQL/MySQL-compatible SQL assets used by the application.
- Recruitment/application data management.
- Supporting document storage.
- Applicant reporting/data export support.
- NIRF-related college reference data.
- REST-style backend APIs.
- Responsive React-based frontend.

## Technology Stack

### Frontend
- **React.js**
- **Vite**
- **JavaScript / JSX**
- **CSS**
- React Context API for authentication/application state where required.

### Backend
- **Node.js**
- **Express.js**
- REST API architecture
- File upload/document handling
- Authentication/session-related backend logic

### Database
- **MySQL / SQL**
- Normalized relational schema
- Database setup and seed scripts
- SQL views for reporting/query convenience

### Other
- Chatbot integration
- PDF/image document handling
- CSV-based reference/report data
- Git for version control

## Project Structure

```text
nec-staff-portal/
│
├── src/
│   ├── components/
│   │   ├── Banner.jsx
│   │   ├── ChatbotWidget.jsx
│   │   ├── Header.jsx
│   │   ├── PrintableApplicationForm.jsx
│   │   ├── WeightageConfig.jsx
│   │   └── profile/
│   │       ├── PersonalTab.jsx
│   │       ├── EducationTab.jsx
│   │       ├── ExperienceTab.jsx
│   │       ├── CertificationsTab.jsx
│   │       └── SubmittedTab.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── AdminPage.jsx
│   │   ├── AuthPage.jsx
│   │   └── ProfilePage.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── database/
│   ├── normalized_schema.sql
│   ├── setup_db.sql
│   ├── seed_candidates.sql
│   ├── create_views.sql
│   └── necfacultyrecruitment24072026.sql
│
├── uploads/
│   └── Candidate-uploaded documents
│
├── server.js
├── db.js
├── vite.config.js
├── index.html
├── package.json
├── package-lock.json
├── .gitignore
├── logo.png
├── college.jpg
└── tn_engineering_colleges_nirf_rank.csv
```

## Backend API

The backend exposes API endpoints for authentication, profiles, applications, plants/data-style resources, documents, cart/application-related operations, and administrative functionality as implemented in `server.js`.

Detected route groups include:

```text
POST /api/register
POST /api/login
GET /api/institutions
GET /api/schools
POST /api/personal
POST /api/education
POST /api/experience
POST /api/certifications
GET /api/profile
```

> The exact API contract should be treated as the source of truth in `server.js`, because endpoints and request/response fields can change as the application evolves.

## Database

The project contains both setup and normalized database scripts.

### Important SQL files

| File | Purpose |
|---|---|
| `database/normalized_schema.sql` | Normalized relational database structure |
| `database/setup_db.sql` | Database initialization/setup |
| `database/seed_candidates.sql` | Sample/seed candidate data |
| `database/create_views.sql` | SQL views used for simplified reporting/querying |
| `database/necfacultyrecruitment24072026.sql` | Database dump / populated database data |

The normalized schema separates major areas of recruitment information instead of storing every attribute in one large table. This improves:
- Data consistency
- Maintainability
- Reduction of duplicate values
- Referential integrity
- Reporting flexibility
- Easier modification of dropdown/master data

## Candidate Data

Candidate records may contain information such as:
- Personal details
- Contact information
- Department
- Designation
- Gender
- Community/category information
- 10th/SSLC details
- 12th/HSC details
- Undergraduate details
- Postgraduate details
- M.Phil details
- Ph.D. details
- Work experience
- Certifications
- Awards and achievements
- Supporting-document references
- Application/submission information

## Installation

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd nec-staff-portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306
```

Add any additional environment variables required by the chatbot, authentication, email, or other external services used by your current `server.js`.

**Never commit real passwords, API keys, database credentials, or other secrets to GitHub.**

### 4. Create the database

Create the required database in MySQL and execute the SQL setup scripts.

For example:

```bash
mysql -u your_database_user -p your_database_name < database/setup_db.sql
```

Then apply the normalized schema/views/seed data as required by your deployment:

```bash
mysql -u your_database_user -p your_database_name < database/normalized_schema.sql
mysql -u your_database_user -p your_database_name < database/create_views.sql
mysql -u your_database_user -p your_database_name < database/seed_candidates.sql
```

> If you are restoring the complete database dump, use the project dump instead of importing overlapping schema/data scripts multiple times.

## Running the Application

### Start the backend

```bash
node server.js
```

or, if a development script is configured:

```bash
npm run dev
```

### Start the frontend

If the project uses the Vite development server:

```bash
npm run dev
```

Vite will display the local URL in the terminal, normally similar to:

```text
http://localhost:5173
```

The backend runs on the port configured in `.env`.

## Production Build

Create the frontend production build with:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

For production deployment, configure:
- Production database credentials
- Backend port
- Frontend/backend URLs
- Upload directory/storage
- External API keys
- CORS/origin settings
- Secure authentication/session configuration

## Environment Variables

Do not hard-code credentials in source files.

Recommended environment configuration:

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `FRONTEND_URL` | Frontend origin used for production configuration |
| `CHATBOT_API_KEY` | API key for chatbot provider, if applicable |

Use the exact variable names expected by the current backend implementation.

## Authentication

The application contains dedicated authentication components and backend authentication routes.

The authentication flow is intended to:
1. Accept candidate/admin credentials.
2. Validate the user.
3. Establish the authenticated application state.
4. Provide role-appropriate access.
5. Allow the user to access profile/application features.

Authentication configuration should be reviewed before production deployment to ensure:
- Passwords are securely hashed.
- Sessions/tokens are protected.
- Cookies use secure settings in production.
- CORS is restricted to trusted origins.
- Sensitive API responses do not expose credentials.

## File Uploads

The project contains an `uploads/` directory for candidate supporting documents.

Typical documents may include:
- Photograph
- 10th/SSLC certificate
- 12th/HSC certificate
- UG certificate
- PG certificate
- Ph.D. certificate
- Other supporting documents

For production:
- Validate file type and size.
- Generate safe server-side filenames.
- Prevent executable uploads.
- Store files outside publicly executable directories where appropriate.
- Restrict access to authorized users.
- Consider object storage for large-scale deployment.

## Data Reporting and Export

The portal can be extended to produce applicant reports based on recruitment criteria such as:
- Department
- Designation
- Gender
- Date/application range
- Qualification
- Experience
- Application status

A typical reporting workflow is:

```text
Candidate Data
      ↓
Apply Filters
      ↓
Group / Categorize
      ↓
Generate Report
      ↓
CSV / Excel Output
```

## Normalization

The database is designed around normalized relational structures.

Instead of repeating master values such as departments, designations, categories, or other dropdown values across many candidate records, these values can be maintained in dedicated master tables and referenced using keys.

Benefits:
- Avoids duplicate data.
- Prevents inconsistent spelling.
- Makes dropdown maintenance easier.
- Supports department-specific designations.
- Simplifies reporting.
- Improves database integrity.

## Security Considerations

Before deploying the application publicly, verify the following:

- [ ] `.env` is included in `.gitignore`.
- [ ] No API keys are committed to Git.
- [ ] No database passwords are committed to Git.
- [ ] Passwords are hashed securely.
- [ ] SQL queries are parameterized.
- [ ] Uploaded files are validated.
- [ ] Authentication/authorization is enforced on admin APIs.
- [ ] CORS allows only trusted origins.
- [ ] Production cookies use secure settings.
- [ ] Error responses do not expose database credentials or internal stack traces.
- [ ] Database backups are configured.
- [ ] Uploaded documents have appropriate access control.

## Troubleshooting

### Backend connection refused

If the frontend reports an error such as:

```text
Failed to fetch
ERR_CONNECTION_REFUSED
```

check that the backend is running:

```bash
node server.js
```

Also verify:
- Backend port
- Frontend API URL
- `.env` configuration
- Firewall/network settings

### Database connection error

Check:

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

Then verify that the database server is running and the user has the required permissions.

### CORS error

Verify that the backend CORS configuration permits the frontend's actual development/production origin.

### Missing npm package

Run:

```bash
npm install
```

If a specific package is missing:

```bash
npm install <package-name>
```

## Development Workflow

Recommended workflow:

```text
1. Start database
        ↓
2. Start backend
        ↓
3. Start frontend
        ↓
4. Login as candidate/admin
        ↓
5. Test profile/application workflow
        ↓
6. Test document upload
        ↓
7. Test admin workflow
        ↓
8. Test reports/exports
        ↓
9. Validate database changes
        ↓
10. Commit and deploy
```

## Future Enhancements

Possible future improvements include:
- Advanced applicant filtering and search.
- Department/designation master-data management.
- Automated eligibility checking.
- Candidate ranking and scoring.
- Recruitment analytics dashboard.
- Excel/CSV export customization.
- Email/SMS notifications.
- Application status tracking.
- Audit logs for administrative changes.
- Cloud object storage for documents.
- Role-based access control with fine-grained permissions.
- Automated backup and recovery.
- AI-assisted candidate/application analysis.

## Project Status

**Status:** Active Development

The portal is structured as a full-stack recruitment management system with:
- React frontend
- Node.js/Express backend
- Relational database
- Candidate profile management
- Administrative management
- Document handling
- Recruitment configuration
- Reporting support
- Chatbot integration

## License

This project is intended for academic/institutional recruitment-management use.

If this project is to be published publicly, add the organization's approved license and usage terms here.

## Author

**NEC Staff Recruitment Portal**

Developed as a full-stack recruitment management application for managing staff recruitment workflows, candidate information, applications, and administrative operations.
