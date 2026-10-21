# Digital Contact Manager — Full-Stack MERN Application

A professional, full-featured **Digital Contact Manager** built with the **MERN** stack (MongoDB, Express.js, React, Node.js), Vite, and Tailwind CSS. The application provides secure user authentication, contact management, customized categories, interactive metrics, and robust CSV import/export capabilities with CSV formula injection protection.

---

## 🌟 Key Features

1. **User Authentication & Authorization**
   - JWT-based authentication with bcrypt password hashing (10 salt rounds).
   - Protected API routes and client-side route guards.
   - Strict data isolation: users can **only** view, edit, search, export, or delete their own contacts and categories.

2. **Contact Management**
   - Create, view details, edit, and delete contacts with confirmation modals.
   - Comprehensive contact fields: First name, Last name, Email, Phone number, Company, Job title, Address, Category, Notes, and Starred Favorite status.
   - Real-time search across names, email, phone, and company.
   - Filter by custom categories or favorite status.
   - Sort by Name (A-Z, Z-A), Date added (Newest, Oldest), or Company.
   - Responsive card grid and compact list view toggle.
   - Pagination controls for managing large address books.
   - Quick one-click favorite starring with optimistic UI updates.

3. **Dashboard Analytics**
   - Real-time KPIs calculated from authenticated user records:
     - Total contacts
     - Starred favorites
     - Total active categories
   - Category distribution visual breakdown with color-coded progress bars.
   - Recently added contacts with direct navigation.
   - Quick action shortcuts to add a contact or trigger CSV import.

4. **Category Management**
   - Create custom categories with custom color palettes.
   - Dynamic contact count badge for each category.
   - Edit category names and colors with automatic cascading updates to contacts.
   - Safe category deletion that automatically reassigns existing contacts to `General`.

5. **Safe CSV Import & Export**
   - **Download Sample Template**: One-click download of a standard CSV template.
   - **Bulk Import**: Drag-and-drop or file upload for `.csv` files.
   - **Duplicate Detection**: Choose between skipping existing contacts or updating existing contacts.
   - **Row-by-row Validation**: Reports failed records with exact error descriptions (e.g. invalid email format, missing first name) while importing valid records.
   - **Import Summary**: Detailed stats showing total processed, imported, updated/skipped, and failed rows.
   - **CSV Formula Injection (DDE) Prevention**: Automatically sanitizes cell values beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` before file generation.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js, Express.js, Mongoose, Multer, Helmet, Morgan |
| **Database** | MongoDB (Local Community Server or MongoDB Atlas) |
| **Authentication**| JSON Web Tokens (JWT) & BcryptJS |
| **Testing** | Jest, Supertest, MongoMemoryServer, Vitest, React Testing Library |

---

## 📂 Project Structure

```text
digital-contact-manager/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CategoryModal.jsx
│   │   │   ├── ContactCard.jsx
│   │   │   ├── ContactDetailModal.jsx
│   │   │   ├── ContactModal.jsx
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Pagination.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── CategoriesPage.jsx
│   │   │   ├── ContactsPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ImportExportPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── test/
│   │   │   ├── setup.js
│   │   │   ├── ContactCard.test.jsx
│   │   │   ├── ContactModal.test.jsx
│   │   │   └── EmptyState.test.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── contactController.js
│   │   │   ├── csvController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── models/
│   │   │   ├── Category.js
│   │   │   ├── Contact.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── contactRoutes.js
│   │   │   ├── csvRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── services/
│   │   │   └── csvService.js
│   │   ├── tests/
│   │   │   ├── setup.js
│   │   │   ├── auth.test.js
│   │   │   ├── contacts.test.js
│   │   │   └── csv.test.js
│   │   ├── utils/
│   │   │   └── sanitize.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend Environment (`server/.env`)
Create a `.env` file in the `server` directory (copied from `server/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/contact_manager
JWT_SECRET=supersecret_jwt_key_contact_manager_development_token_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```
> **Note on MongoDB**: If running locally, ensure your MongoDB service or `mongod` is started. Alternatively, paste any free MongoDB Atlas connection string in `MONGODB_URI`.

### Frontend Environment (`client/.env`)
Create a `.env` file in the `client` directory (copied from `client/.env.example`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Running Locally

### 1. Install Dependencies
You can install dependencies for both the frontend and backend with a single command from the root directory:
```bash
# From repository root:
npm run install:all
```
Or individually:
```bash
# In server directory:
cd server
npm install

# In client directory:
cd ../client
npm install
```

### 2. Start the Backend Server
```bash
# In server directory:
npm run dev
# or npm start
```
The backend server runs on `http://localhost:5000`. You can verify health at `http://localhost:5000/api/health`.

### 3. Start the Frontend Client
In a separate terminal:
```bash
# In client directory:
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

### Backend Test Suite (25 Tests)
Runs end-to-end integration tests using an isolated, self-contained in-memory MongoDB instance. No external database installation is required to run the tests!
```bash
cd server
npm test
```
**Tests Covered:**
- `auth.test.js`: User registration, password hashing verification, rejection of duplicate emails, token issuance, and login validation.
- `contacts.test.js`: Contact CRUD, required field & email validation, filtering, multi-field search, pagination, and strict **ownership authorization isolation** (verifying User A cannot read, update, or delete User B's contacts).
- `csv.test.js`: Template generation, formula injection sanitization, valid/invalid record handling during import, and duplicate handling.

### Frontend Test Suite (8 Tests)
Runs component and user interaction tests using Vitest and React Testing Library:
```bash
cd client
npm test
```
**Tests Covered:**
- `ContactCard.test.jsx`: Verification of full name, avatar initials, email, phone, category badge, and action handlers.
- `ContactModal.test.jsx`: Validation of required first name, email format validation, and valid submission payloads.
- `EmptyState.test.jsx`: Custom empty states and action button triggering.

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 rounds before being persisted.
2. **JWT Authorization**: Requests to protected routes must provide a valid `Bearer <token>` header. Tokens are verified on every call.
3. **Strict Ownership Validation**: Every contact and category lookup enforces `{ user: req.user._id }`. Even if a user knows another user's contact ID, access is denied (404/unauthorized).
4. **CSV Formula Injection (DDE) Sanitization**: When exporting contacts to CSV, fields starting with dangerous formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) are safely escaped with a leading single quote (`'`), neutralizing spreadsheet formula execution in Microsoft Excel, LibreOffice, and Google Sheets.
5. **Security Headers**: Express uses `helmet` for HTTP header security and strict `CORS` configuration.

---

## ✅ Feature Verification Checklist

| Feature | Verification Step |
|---|---|
| **Registration & Login** | Register a new user, verify redirection to Dashboard, log out, and log back in. |
| **Create Contact** | Click "+ Add Contact", fill in first name and details, and verify contact appears. |
| **Search Contacts** | Enter part of a contact's name, company, or email in the search bar. |
| **Filter by Category** | Click on category tabs (e.g. "Work", "Personal") to filter contacts. |
| **Favorite Contacts** | Click the star icon to favorite; visit the "Favorites" sidebar page to view all starred. |
| **Edit Contact** | Click the pencil icon, update details (e.g., job title), and verify immediate updates. |
| **Delete Contact** | Click the trash icon; confirm dialog prevents accidental deletion. |
| **Category Management** | Go to "Categories", add a custom category with a color label, and view contact count. |
| **Sample CSV Template** | Go to "Import / Export", click "Download Sample Template", and inspect the downloaded CSV. |
| **Export Contacts** | Click "Download Contacts (.CSV)" to export all your contacts with formula sanitization. |
| **Import Contacts** | Upload a CSV file, choose duplicate strategy, and review the detailed row summary. |
| **Settings** | Go to "Settings", update your name or password, and verify changes save. |



Live Link:https://digital-contact-manager.vercel.app

