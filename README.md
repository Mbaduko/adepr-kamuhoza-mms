# Church Members Management System (CMMS)

A comprehensive, professional church management system built with React, Tailwind CSS, and modern web technologies. This application provides role-based access control for managing church members, sacramental records, and certificate requests.

## 🎯 Project Overview

The Church Members Management System is designed to streamline church operations through:

- **Role-Based Access Control**: Four distinct user roles with appropriate permissions
- **Certificate Management**: Multi-level approval workflow for church certificates
- **Member Management**: Comprehensive member profiles with sacramental records
- **Zone Management**: Organizing members by geographical or administrative zones
- **Modern UI/UX**: Clean, accessible design with spiritual aesthetics

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18 (Vite) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router DOM |
| **State Management** | Context API |
| **HTTP Client** | Axios (for future API integration) |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod |
| **TypeScript** | Full TypeScript support |

## 🚀 How to Run Locally

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation Steps

```bash
# Step 1: Clone the repository
git clone git@github.com:Mbaduko/adepr-muhoza-mms.git

# Step 2: Navigate to the project directory
cd adepr-muhoza-mms

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 👥 Demo Login Roles

The system includes four pre-configured demo accounts:

### 1. Member
- **Access**: Personal profile, certificate requests, view own request history
- **Demo User**: John Smith (john.smith@email.com)

### 2. Zone Leader  
- **Access**: All member features + manage zone members, Level 1 approvals
- **Demo User**: Sarah Johnson (sarah.johnson@email.com)

### 3. Pastor
- **Access**: Manage all members, zones, assign zone leaders, Level 2 approvals, statistics
- **Demo User**: Rev. Michael Brown (michael.brown@email.com)

### 4. Parish Pastor
- **Access**: All features + manage pastors, Level 3 (final) approvals, global statistics
- **Demo User**: Rev. Dr. David Wilson (david.wilson@email.com)

## 📁 Folder Structure

```
src/
├── assets/           # Images, logos, static assets
├── components/       # Reusable UI components
│   ├── Layout/       # Layout components (Navbar, Sidebar, etc.)
│   └── ui/           # shadcn/ui components
├── context/          # React Context providers
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── data/             # Mock data and API simulation
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── CertificateProcess.tsx
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## 🔐 Role-Based Access Control

The system implements comprehensive RBAC with the following permission matrix:

| Feature               | Member | Zone Leader | Pastor | Parish Pastor |
|-----------------------|--------|-------------|--------|---------------|
| View Own Profile      | ✅     | ✅          | ✅     | ✅            |
| Edit Own Profile      | ✅     | ✅          | ✅     | ✅            |
| Request Certificates  | ✅     | ✅          | ✅     | ✅            |
| View Zone Members     | ❌     | ✅          | ✅     | ✅            |
| Manage All Members    | ❌     | ❌          | ✅     | ✅            |
| Manage Zones          | ❌     | ❌          | ✅     | ✅            |
| Level 1 Approvals     | ❌     | ✅          | ✅     | ✅            |
| Level 2 Approvals     | ❌     | ❌          | ✅     | ✅            |
| Level 3 Approvals     | ❌     | ❌          | ❌     | ✅            |
| Manage Pastors        | ❌     | ❌          | ❌     | ✅            |
|-----------------------|--------|-------------|--------|---------------|

## 📜 Certificate Request Workflow

1. **Request Submission**: Member submits certificate request with purpose
2. **Level 1 Review**: Zone Leader verifies and approves/rejects
3. **Level 2 Review**: Pastor provides secondary approval
4. **Level 3 Final**: Parish Pastor gives final authorization
5. **Certificate Generation**: System generates downloadable certificate

### Available Certificate Types
- **Baptism Certificate**: Official baptism records
- **Confirmation Certificate**: Confirmation sacrament records  
- **Marriage Certificate**: Church marriage records
- **Membership Certificate**: Proof of active membership

## 🎨 Design System

The application features a spiritual and calming design inspired by the church logo:

- **Primary Colors**: Deep navy (#2D3748) for trust and stability
- **Secondary Colors**: Light blue/lavender (#E2E8F0) for peace
- **Accent Colors**: Golden yellow (#D69E2E) for warmth and light
- **Background**: Soft cream (#F7FAFC) for readability

## 📱 Features

### Landing Page
- Hero section with clear value proposition
- Demo login buttons for all roles
- Certificate process overview
- Responsive design

### Dashboard (Role-Based)
- Personalized statistics and metrics
- Quick action buttons
- Recent activity feed
- Role-appropriate navigation

### Certificate Management
- Request submission with validation
- Status tracking with timeline
- Multi-level approval workflow
- Notification system

### Member Management
- Comprehensive member profiles
- Sacramental records tracking
- Zone assignment and management
- Search and filtering capabilities

## 🔧 Mock API Simulation

The application uses JSON files to simulate API responses, mimicking real API behavior before the availability of actual APIs:

- **Members Data**: Comprehensive member profiles with sacramental records
- **Zones Data**: Geographical/administrative zone information
- **Certificate Requests**: Request history with approval workflow
- **Notifications**: In-app and email notification simulation

## 🚀 Future Enhancements

- **Advanced Analytics**: Detailed reporting and statistics
- **Mobile App**: React Native companion app
- **Offline Support**: PWA capabilities for offline access

## 💼 Assets

### Church Logo
The church logo is located at `src/assets/logo.png` and is automatically used throughout the application

### Hero Image  
Hero image `src/assets/hero-image.jpg`

### Color Scheme
Design tokens are found in `src/index.css` and `tailwind.config.ts`

## 📞 Support

For questions, issues, or feature requests, please refer to the project documentation or contact the development team.

---

**Built for ADEPR Muhoza**