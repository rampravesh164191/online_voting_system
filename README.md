# 🗳️ Secure Online Voting Platform

A modern, full-featured **React** application designed to provide a secure, transparent, and user-friendly digital voting experience.  
This platform ensures **integrity**, **privacy**, and **usability** through advanced authentication, verification, and security mechanisms.

---

## 🚀 Features Implemented

### 👤 User Management
- Secure **registration and authentication**
- Full **voter profile management**
- **Document upload** for identity verification
- **Row-level security policies** ensure users can access only their own data

### 🗳️ Voting System
- **Facial recognition** verification during voting (matches against registered profile photos)
- **Time-limited voting links** (expire after 2 minutes) to prevent link sharing or misuse
- **Location tracking** for fraud prevention while maintaining voter anonymity
- **Encrypted vote hashing** to ensure ballot secrecy
- **Comprehensive audit logging** of all user and system interactions

### 📡 Election Interaction
- Browse active and upcoming elections
- Request secure access to participate
- Intuitive voting interface with candidate confirmation steps
- Real-time **vote status tracking** and notifications
- Integrated **user guide** for step-by-step assistance

### 💬 Feedback & Monitoring
- Built-in **feedback system** to gather user experience data
- Administrators can monitor voter activity via detailed audit trails
- Notifications for election updates and status changes

---

## 🔐 Key Security Features

| Security Mechanism | Description |
|--------------------|-------------|
| **Facial Recognition** | Matches real-time capture with registered profile photo |
| **Time-Limited Links** | Each voting link expires after 2 minutes |
| **Location Tracking** | Logs geolocation to prevent duplicate or fraudulent votes |
| **Encrypted Vote Hashing** | Ensures every vote is secure and anonymous |
| **Audit Trails** | Maintains a record of all critical actions |
| **Row-Level Security** | Users only see and manage their own data |
| **Secure Storage** | Encrypted document and photo uploads with access controls |

---

## ⚙️ How It Works

1. **User Registration**  
   Voters sign up and complete their profiles with verification documents.

2. **Admin Verification**  
   Administrators review and approve accounts for election access.

3. **Election Browsing**  
   Users can explore active and upcoming elections in the dashboard.

4. **Secure Voting Process**  
   - System issues a **time-limited voting link**  
   - User performs **facial recognition verification**  
   - Voter selects preferred candidate(s)  
   - Submission is **hashed and stored securely**

5. **Tracking & Feedback**  
   - Voters can track their participation in **real-time**  
   - Share experiences through the built-in **feedback module**

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Hooks, Context API, or Redux) |
| **Storage** | Secure file storage (Firebase) |
| **Deployment** | Docker / CI-CD (GitHub Actions / Vercel) |

---

## 🧩 Architecture Overview

