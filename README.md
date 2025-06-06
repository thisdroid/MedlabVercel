# 🧪 MedLab Pro

**MedLab Pro** is a modern Laboratory Management System (LMS) designed to streamline the workflow of diagnostic labs. Built with **React.js (frontend)** and **Flask (backend)**, it allows lab staff to manage patients, record and track test results, generate professional reports, and monitor lab analytics—all through a clean and intuitive web interface.

---

## 🚀 Features

### 🔐 Authentication
- Secure user sign-in
- Logout button always accessible in the sidebar

### 📊 Dashboard
- **Total Patients**: Displays registered patients
- **Total Tests**: Total number of tests conducted
- **Reports Generated**: Unique patients with at least one test
- **Tests Today**: Real-time count of today’s tests

### 🧑‍⚕️ Patient Management
- Add new patients with full details
- View, edit, and delete patient records

### 🧫 Test Management
- Add, view, edit, and delete test records
- Track test status and dates

### 📝 Report Generation
- Generate PDF reports grouped by test category
- Auto-calculates status (Normal, High, Low, Positive, Negative)
- Includes all patient and test details

### 🧬 Dynamic Lab Selection
- Select labs dynamically
- Personalized reports with lab branding and contact info

### 📈 Lab Analytics & Info
- View analytics and trends (future support)
- Edit lab name, address, and contact info

---

## 🛠 Technologies Used

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Flask (Python)
- **Database**: SQLite
- **API**: RESTful endpoints (CRUD for patients, tests, labs)

---

## 🔮 Planned Features

- Role-based access (admin, staff, doctor)
- Full authentication system (passwords, email verification)
- Charts, trends, and analytics dashboards
- Bulk CSV/Excel import & export
- SMS/Email notifications
- Mobile responsive UI
- PostgreSQL/MySQL and cloud hosting support
- JWT/session-based API protection
- Dedicated Patient Portal
