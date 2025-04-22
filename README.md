# Hospital Management System (in development phase)

![Hospital Management System](https://img.shields.io/badge/Status-Live-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![Supabase](https://img.shields.io/badge/Supabase-2.0-darkgreen)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.0-orange)

## 🏥 Live Demo

Visit the live application: [Hospital Management System](https://dbms-project-hospital-mangement.vercel.app/)

## 📋 Overview

This Hospital Management System is a comprehensive web application built with Next.js, Supabase, and NextAuth.js for authentication. Designed to streamline hospital operations and improve patient care, the system features role-based access control, appointment scheduling, electronic medical records, billing management, and more. Developed using the Cursor AI editor and deployed on Vercel, this application provides a modern solution for healthcare facilities.

## ✨ Key Features

### 🔐 Role-Based Access Control
The system implements an ERP-like structure where users log in according to their role in the hospital:
- **Patients**: Book appointments, view medical history, make payments
- **Doctors**: Manage appointments, update patient records, prescribe medications
- **Lab Assistants**: Process lab tests, upload results
- **Pharmacists**: Manage medication inventory, process prescriptions
- **Administrators**: Oversee all hospital operations, manage staff, access reports

### 📅 Appointment Management
- Easy appointment booking interface
- Real-time availability checking
- Automated notifications and reminders
- Rescheduling and cancellation options

### 📋 Patient Records
- Comprehensive electronic medical records
- Medical history tracking
- Prescription management
- Test results storage and retrieval

### 💊 Pharmacy Management
- Medication inventory tracking
- Prescription processing
- Automated low-stock alerts
- Medication dispensing logs

### 🧪 Laboratory Services
- Test order management
- Result recording and sharing
- Sample tracking
- Integration with patient records

### 💳 Billing System
- Mock payment portal integration
- Insurance processing
- Itemized billing for services
- Payment history and receipts
- Multiple payment methods supported

### 📊 Reports and Analytics
- Staff performance metrics
- Patient demographic analysis
- Financial reports
- Operational efficiency tracking

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: NextAuth.js integrated with Supabase
- **Development Environment**: Cursor AI Editor
- **Deployment**: Vercel
- **Version Control**: Git, GitHub

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- npm or yarn
- Supabase account
- GitHub account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/hospital-management-system.git
cd hospital-management-system
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
# Create a .env.local file and add the following variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_URL=your_app_url
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔑 Demo Login Credentials

### Doctor Account
- **ID**: Q89PGF
- **Password**: 7895474

### Administrator Account
- **ID**: YT89
- **Password**: securepassword2

## 📝 API Documentation

The API documentation is available at `/api/docs` when running the development server.

## 🧪 Testing

```bash
npm run test
# or
yarn test
```

## 🔄 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and continuous deployment to Vercel.

## 📦 Project Structure

```
hospital-management-system/
├── components/              # React components
├── pages/                   # Next.js pages
│   ├── api/                 # API routes
│   ├── admin/               # Admin portal
│   ├── doctor/              # Doctor portal
│   ├── patient/             # Patient portal
│   ├── lab/                 # Lab assistant portal
│   └── pharmacy/            # Pharmacist portal
├── public/                  # Static assets
├── styles/                  # Global styles
├── lib/                     # Utility functions
│   ├── supabase.js          # Supabase client
│   └── auth.js              # Authentication helpers
├── contexts/                # React contexts
├── hooks/                   # Custom React hooks
└── prisma/                  # Database schema
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Link: [https://github.com/yourusername/hospital-management-system](https://github.com/yourusername/hospital-management-system)

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cursor AI](https://cursor.sh/)
- [Vercel](https://vercel.com/)
