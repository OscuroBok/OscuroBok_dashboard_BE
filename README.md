# OscuroBok Backend Codebase

Welcome to the OscuroBok Backend Codebase! This README provides a comprehensive yet simple guide for new contributors to understand the key components and flow of this project. The codebase primarily focuses on user 
- Authentication, 
- OTP verification,
- Role-based access

## Tech Stack

![OscuroBok-Tech Stack](https://github.com/user-attachments/assets/23c4d751-a1a4-427d-89a7-1582465acbf7)

- **Frontend**: Next.js, React, Redux
- **Styling**: Material-UI (MUI) components, custom styles
- **API Requests**: Axios (via services)
- **State Management**: Redux Toolkit
- **Form Handling**: Formik & Yup (for validation)
- **Authentication**: OTP-based (Simulated)

---

### Role-Based Routing
- Based on the user type (Admin/User), redirection occurs after login using a single API call.

### Workflow Diagram

```mermaid
graph TD
    A[OTP Form Displayed] --> B[User Enters OTP]
    B --> C{OTP Valid?}
    C -->|Yes| D[Proceed to Reset Password]
    C -->|No| E[Error: Invalid OTP]
```

### Project Flow

```mermaid
graph TD
    User --> |Submits Email| AuthPage
    AuthPage --> |Sends Email| Backend
    Backend --> |OTP Sent| AuthPage
    User --> |Submits OTP| AuthPage
    AuthPage --> |Verifies OTP| Backend
    Backend --> |OTP Valid| AuthPage
    AuthPage --> |Redirect to Reset Password| User

```
    
# To clone a code from a particular branch, use:
* git clone -b branch_name https://github.com/OscuroBok/OscuroBok_dashboard_FE.git

* # To clone a code from a branch, use:
* git clone https://github.com/OscuroBok/OscuroBok_dashboard_FE.git

# Commands used:
* npm install
* npm run db:migrate_all ->  Migrates all Schemas and creates tables in Database
* npm run seed:role (if u don't see the message, "The seed command has been executed") -> This command will insert the Admins roles into DB
* npm run seed:admin(Inserts the Super Admin credentials and data in DB)
* npm start
