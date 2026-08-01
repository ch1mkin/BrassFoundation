# Brass Foundation Website
### Context.md
Version: 1.0

---

# Project Overview

Brass Foundation is an Ambedkarite social organization dedicated to education, empowerment, equality, leadership, and community development.

The website should not feel like a traditional NGO website. Instead, it should feel modern, premium, trustworthy and community-driven.

The design language should reflect:
- Knowledge
- Leadership
- Professionalism
- Equality
- Community
- Growth

## Architecture

This is a **Headless Organization Management System (OMS)**. The public website is only one consumer of the data.

```
Brass Foundation OMS

├── Website
│   ├── Landing
│   ├── Membership
│   ├── Resources
│   ├── Marketplace
│   └── Events
│
├── Admin Portal
│   ├── CMS
│   ├── Users
│   ├── Roles
│   ├── Members
│   ├── Analytics
│   └── Settings
│
├── Member Portal
│   ├── Dashboard
│   ├── Membership Card
│   ├── Certificates
│   ├── Downloads
│   ├── Marketplace
│   └── Events
│
├── API Layer
│
├── Supabase
│   ├── Auth
│   ├── Database
│   ├── Storage
│   └── Edge Functions
│
└── Shared UI Components
```

## Technology Stack

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- ShadCN UI
- Framer Motion
- Three.js (only where meaningful)
- Supabase
  - Authentication
  - PostgreSQL
  - Storage
  - Realtime
  - Edge Functions
- React Query
- Zustand
- React Hook Form
- Zod
- UploadThing / Supabase Storage
- TipTap Rich Text Editor
- React PDF Viewer
- React Email
- Resend (emails)

## Deployment

- Vercel
- Supabase

---

# Brand Identity

| Token | Value |
|-------|-------|
| Primary Color | `#11B5C9` |
| Secondary | `#114C88` |
| Accent Gold | `#F2B233` |
| Background | `#F7FBFC` |
| Dark Background | `#0E1F2F` |
| Text | `#1B1B1B` |
| Secondary Text | `#6B7280` |
| Success | `#16A34A` |
| Error | `#DC2626` |

## Typography

| Role | Font |
|------|------|
| Heading | Poppins |
| Body | Inter |
| Quotes | Cormorant Garamond |

## Theme

- Modern, Professional, Minimal, Premium, Educational
- Avoid gradients everywhere except hero section
- Rounded corners: 16px
- Cards: Soft shadow
- Glass morphism: Only hero section

---

# Website Structure

- Landing Page
- About Brass Foundation
- Mission
- Vision
- History
- Founder Message
- Gallery
- Videos
- Achievements
- Timeline
- Team
- Organization Structure
- Membership
- Resources
- Marketplace
- Events
- Community Work
- News
- Contact
- Login

---

# Homepage Sections

## Hero Section
- Animated pen nib logo
- Small Three.js particle background
- CTAs: Join Brass Foundation, Become a Member, Explore Resources

## About Section
- Who We Are
- Mission
- Vision
- Core Values
- Read More

## Statistics
- Members, Events, Scholarships, Districts, Books Published, Community Drives
- Animated Counter

## Leadership
- President, Vice President, Secretary, Treasurer, Executive Members
- View Complete Team

## Community Work
Cards: Blood Donation, Educational Programs, Legal Awareness, Book Distribution, Scholarships, Women's Empowerment, Youth Development, Volunteer Programs

## Upcoming Events
- Calendar Preview, Register Button, Countdown

## Latest News
- Announcements, Articles, Community Updates

## Marketplace Preview
- Recently Published Books, Articles, Research Papers, Poetry, Essays
- View Marketplace

## Resources Preview
- Constitution, Study Material, Books, PDFs, Training Material, Videos
- Download Center

## Membership CTA
- Become a Member, Online Registration

## Footer
- Quick Links, Social Media, Contact, Location, Emergency Contact, Newsletter

---

# Authentication

Supabase Auth with:
- Email Login
- OTP Login
- Google Login
- Password Reset
- Email Verification
- Session Management
- Role Based Access
- Protected Routes

---

# User Roles

## Super Admin
Highest authority. Can manage everything, create unlimited roles, assign permissions, edit website, manage users, delete anything, view audit logs, impersonate users.

## Admin
Permissions controlled by Super Admin. Possible permissions: Manage Members, Gallery, Events, Marketplace, Resources, News, Users, Website; Approve Memberships; Approve Marketplace Posts.

## Secretary
Customizable. Usually: Manage Meetings, Minutes, Notices, Events, Membership Records, Reports.

## Treasurer
Manage Donations, Financial Reports, Membership Fees, Receipts, Income, Expense.

## Volunteer
View Tasks, Update Progress, Upload Work, Event Attendance.

## Member
Profile, Membership Card, Events, Resources, Marketplace, Forum, Volunteer Activities, Certificates.

## Guest
Landing Pages, Membership Form, Marketplace Preview, Resources Preview.

---

# Dynamic Role System

Super Admin can create unlimited roles. Each role has permissions. No hardcoded roles.

## Permission Matrix
- Create, Read, Update, Delete
- Publish, Approve, Reject, Export
- Manage Settings, Assign Roles

Every module checks permissions dynamically.

---

# Admin Dashboard

- Dashboard Overview
- Members, Users, Roles
- Website (CMS)
- Gallery, Marketplace, Resources, Events, Community Work, News
- Messages, Membership Requests
- Analytics, Audit Logs, Settings

---

# Landing Page CMS

Every section editable without code:
Hero, Mission, Vision, Images, Buttons, Gallery, Statistics, Footer, Navigation.

---

# Modules

## Gallery
Albums, Images, Videos, Categories, Featured Images, Lightbox, Lazy Loading, Admin Approval.

## Team
Organization Structure, Unlimited Positions/Levels, Profile, Photo, Biography, Contact, Social Links, Term Start/End, Current Status.

## Membership
Public Form (Personal Details, Education, Occupation, District, State, Interest, Reason for Joining, Photo, Documents, ID Proof, Payment), Membership Types (Volunteer, Student, General, Life Member), Review/Approval Workflow, Generate Membership ID + QR, Digital Membership Card, Download Card, Renew Membership.

## Member Dashboard
Profile, Membership Status/Card, Certificates, Downloads, Events, Volunteer Hours, Marketplace, Notifications, Settings.

## Resources
Books, PDFs, Videos, Presentations, Research Papers, Constitution, Training Material, Study Notes, Categories, Tags, Versioning, Approval, Featured Resources.

## PDF Viewer
Custom in-app viewer: no download/print buttons, watermark with logged-in user's name/email, disable right click and text selection where possible, fullscreen, progress tracking, bookmarks, notes, last read / continue reading / remember page.

**Important:** Absolute screenshot prevention is impossible on the web. Rely on visible user-specific watermarks and access controls for sensitive documents.

## Marketplace
Community publishing: Books, Poetry, Articles, Research, Blogs, Stories, Magazine. Categories, Likes, Bookmarks, Reviews, Comments, Follow Authors, Featured Works, Admin Approval, Free/Paid Downloads, Digital Books, PDF Preview, Revenue Reports.

## Events
Calendar (Monthly/Agenda), Upcoming/Past, Registration, Attendance, QR Check-in, Certificates, Photo Gallery, Feedback.

## Community Work
Projects: Blood Donation, Education Camps, Legal Camps, Tree Plantation, Women Empowerment, Scholarships, NGO Collaborations. Each includes Description, Images, Volunteers, Budget, Timeline, Progress, Impact.

## News
Announcements, Articles, Press Releases, Media Coverage, Pinned Posts, Comments.

## Contact
Contact Form, Volunteer Form, Complaint Form, Suggestion Form, Office Location, Google Maps, Social Links.

---

# Cross-Cutting Systems

## Notifications
Email, Dashboard, Push Notification, SMS Ready, Realtime.

## Search
Global Search across People, Books, Events, Resources, News, Marketplace, Gallery.

## Analytics
Website Traffic, Members Joined, Downloads, Marketplace Sales, Popular Resources, Attendance, Volunteer Hours, Most Active Members.

## Audit Logs
Every action logged: Login, Delete, Edit, Approval, Permission Changes, Role Assignment, Downloads.

## Settings
Website Settings, Logo, Colors, SEO, Email, Storage, Authentication, Payments, Analytics, Theme, Navigation, Footer, Homepage.

## SEO
Dynamic Meta, Open Graph, Twitter Cards, Schema, Sitemap, Robots.

## Accessibility
Keyboard Navigation, ARIA, Screen Reader, Dark Mode, Responsive.

---

# Future Features

Native Android/iOS App, Discussion Forum, Digital Library, AI Chat Assistant, Speech-to-Text, Translation (Hindi, Punjabi, English), Member Verification, Donation Portal, Scholarship Portal, Job Board, Election/Voting System, Meeting Management, Attendance System, Certificate Generator, Volunteer Hours Tracker, Inventory Management, District/State/National Chapters, Video Learning Platform, Podcast Section, Live Streaming, AI Search, AI Resource Summaries, Digital Archive.

---

# Database Philosophy

Everything should be dynamic. No hardcoded values.

- Every section editable from the admin panel
- Every role and permission configurable
- Every homepage section managed through CMS
- Every module supports future expansion without schema redesign

---

# UI Inspiration

Apple, Notion, Linear, Vercel, GitHub, Gov.uk (Accessibility).

Avoid clutter. Whitespace first. Animations should enhance usability, not distract from content.

---

# Project Goal

Build the most modern, scalable, and future-proof Ambedkarite organization management platform that combines:

- Public Website
- Membership Management
- Community Engagement
- Digital Library
- Marketplace
- CMS
- Event Management
- Volunteer Management
- Role-Based Administration

into one unified platform while remaining fully customizable by the Super Admin without requiring code changes.
