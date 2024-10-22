📦 src/
├── 📂 config/
│   ├── auth.js              # Authentication configuration
│   └── DbConfig.js          # Database configuration/Setup (e.g., MongoDB, PostgreSQL)
├── 📂 controller/            # Contains business logic, request handling, interacts with Services and models, processing requests & sending back response.
├── 📂 docs/                  # Documentation files (e.g., this README.md)
├── 📂 helper/                # Helper utility functions used across the application, making repetitive tasks easier to manage. Ex: date formatting, string manipulations
├── 📂 Routes/
│   └── v1/                  # Versioned API routes for set of endpoints, to prevent conflicts, and maintain different version no. for each ugrade of this routes
│       ├── integrated.route.js   # Routes for integrated/combined features for User and Vendor
│       ├── restaurant.route.js   # Routes for restaurant functionality
│       ├── user.route.js         # Routes for user-related actions
│       ├── admin.js              # Admin-specific routes
│       └── index.js              # Combines all routes for version 1 (v1). A central of all routings.
├── 📂 seeder/                # Seeder scripts to pre-populate the database with initial data
│   ├── admin-seeder.js       # Seeder for admin-related data
│   ├── main-seeder.js        # Main database seeder to populate multiple datasets
│   ├── restaurant-seeder.js  # Seeder for restaurant data
│   └── role-seeder.js        # Seeder for roles (Admin, Operator, etc.)
├── 📂 uploads/               # Folder to store any uploaded files
├── 📂 utils/                 # Utility functions and constants used across different parts
│   └── constant.js           # Constant values (e.g., roles, status, values)
├── 📂 validations/           # Input validation logic
│   ├── admin.js              # Validation for admin actions
│   ├── integrated.validation.js # Shared validations for integrated routes
│   ├── restaurant.validation.js # Validation for restaurant data
│   └── user.validation.js    # Validation for user actions (e.g., registration)
├── .env                      # Environment configuration file (sensitive data)
├── .gitignore                # Specifies files/directories to ignore in version control (Git)
├── package.json              # Node.js dependencies and scripts
├── package-lock.json         # Lock file to ensure consistent dependency installation
├── README.md                 # Main documentation file for the project
└── server.js                 # Entry point for the backend server