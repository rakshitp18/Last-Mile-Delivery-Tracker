<div align="center">

# 📦 Ship It — Enterprise Last-Mile Delivery & Dispatch Platform

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Frontend_Live-black?style=for-the-badge&logo=vercel&logoColor=white)](https://last-mile-delivery-tracker-9t8c.vercel.app)
[![Render Deployment](https://img.shields.io/badge/Render-Backend_Live-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://shipit-sl8q.onrender.com)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16.0-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**An enterprise-grade real-time last-mile logistics orchestration platform featuring deterministic volumetric rating, sub-second GPS telemetry radar, automated proximity-based fleet pairing, and multi-tenant operational consoles for Admins, Drivers, and Customers.**

[🌐 Live Web Application](https://last-mile-delivery-tracker-9t8c.vercel.app) • [🔌 Live REST API](https://shipit-sl8q.onrender.com/api/health) • [📖 Architecture Document](DESIGN.md)

---

</div>

## 📸 Complete Platform Showcase

---

### 🌟 1. Public Portal & Customer Experience

#### Interactive Landing Page & 3D Logistics Hero
> Modern light-themed SaaS landing interface with integrated 3D conveyor belt mechanics and immediate booking CTAs.

![Ship It Landing Hero](docs/screenshots/01_hero_landing.png)

#### Real-Time Parcel Radar & Telemetry Cockpit
> Sub-second tracking with live driver coordinates, corridor milestone progress, and automated ETA countdowns.

![Live Telemetry Radar](docs/screenshots/02_live_radar_tracking.png)

#### Dynamic Volumetric Rate Calculator
> Instant billable weight computation using standard dimensional freight formulas (`(L × B × H) / 5000`) with real-time price estimation across delivery zones.

![Volumetric Rate Calculator](docs/screenshots/03_rate_calculator.png)

#### Multi-Modal Fleet & Corridor Services
> Horizontally scrollable fleet showcase spanning Inter-City Express, Urban Hyperlocal, Heavy B2B Freight, and EV clean fleets.

![Fleet and Services](docs/screenshots/04_fleet_services.png)

---

### 🏢 2. Enterprise Operations & Admin Dispatch Console

#### Operations Cockpit & Executive KPIs
> Centralized dispatch hub for active bookings, in-transit telemetry, available driver capacity, and billing analytics.

![Enterprise Operations Cockpit](docs/screenshots/06_enterprise_dashboard.png)

#### Live Dispatch & Order Pipeline
> Real-time shipment queue with route matching, weight tier classification, assigned driver partner tracking, and status inspection.

![Admin Dispatch Console](docs/screenshots/09_admin_dispatch_console.png)

#### Fleet & Driver Partner Management
> Real-time multi-tier dispatch network, vehicle telemetry, payload capacities, active load quotas, and on-duty controls.

![Admin Fleet Management](docs/screenshots/10_admin_fleet_management.png)

#### Dynamic Rate Cards & Zone Matrix
> Configurable rate slabs, volumetric multipliers, COD surcharges, and interactive live billing simulator.

![Admin Rate Cards and Zones](docs/screenshots/11_admin_rate_card_zones.png)

---

### 🚚 3. Field Delivery Driver App

#### Driver Run Sheet & Live Assignments
> Mobile-responsive driver portal displaying assigned pickup/drop details, customer contact triggers, on-duty toggles, and direct completion actions.

![Driver Dashboard](docs/screenshots/07_driver_dashboard.png)

---

### 👤 4. Customer Self-Service & Booking Wizard

#### 6-Step Guided Shipment Booking
> Intuitive shipment creation workflow with address auto-complete, multi-box dimensional configuration, rate estimation, and instant payment checkout.

![Customer Order Booking](docs/screenshots/12_customer_order_booking.png)

#### Multi-Role Authentication Portal
> Seamless sign-in with Google OAuth 2.0 Identity Services, role-based demo accounts, and encrypted JWT credential exchange.

![Auth Portal](docs/screenshots/05_auth_portal.png)

---

## 🌟 Key Platform Capabilities

- 🏎️ **Deterministic Volumetric Rating Engine**: Computes billable freight weight as `max(Dead Weight, (L × B × H) / 5000)` with customizable base rates, distance tiers, and COD handling fees.
- 📡 **Real-Time GPS Telemetry & STOMP WebSockets**: Instant driver location streaming over WebSockets with live Leaflet map rendering and milestone status transitions.
- 🤖 **Automated Driver Dispatching**: Nearest-available delivery agent pairing based on operational zones and driver vehicle capacities.
- 🔐 **Dual Authentication & Security**: Stateless JWT authentication with BCrypt hashing and Google OAuth 2.0 Identity Services.
- 💳 **Razorpay Payment Integration**: Integrated test and live payment checkout with instant webhook verification.
- 📧 **Multi-Channel Email Notifications**: Transactional booking confirmations, dispatch alerts, OTP delivery verification, and rescheduling receipts via Gmail SMTP and Resend API.
- 📱 **Progressive Web App (PWA)**: Mobile-optimized experience with service workers, offline manifest caching, and native responsive design.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[React 19 + Vite SPA<br/>Hosted on Vercel] -->|HTTPS REST / JSON| Backend[Spring Boot 3.3.4 Cluster<br/>Hosted on Render]
    Client -->|WSS STOMP WebSockets| Backend
    Backend -->|HikariCP / TLS| DB[(Render PostgreSQL 16<br/>shipit_1dix)]
    Backend -->|OAuth2 Token Verify| Google[Google Identity Services]
    Backend -->|Orders & Webhooks| Razorpay[Razorpay Payment Gateway]
    Backend -->|SMTP / REST API| Email[Gmail SMTP & Resend API]
```

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Three.js, Leaflet, Recharts, TanStack Query |
| **Backend** | Java 17, Spring Boot 3.3.4, Spring Security, Spring Data JPA, Spring WebSocket (STOMP), Hibernate |
| **Database** | PostgreSQL 16 (Render Managed), HikariCP Connection Pool |
| **Authentication** | JWT (JSON Web Tokens), Google OAuth 2.0, BCrypt |
| **Third-Party APIs** | Razorpay (Payments), Gmail SMTP / Resend (Email), OpenStreetMap / Leaflet (Maps) |
| **Hosting & Cloud** | Vercel (Frontend SPA), Render (Spring Boot Docker Web Service & Managed PostgreSQL) |

---

## 🚀 Quick Start Guide

### Prerequisites
- Java 17+ & Maven 3.8+
- Node.js 18+ & npm 9+
- PostgreSQL 16 (or local Docker)

---

### 1. Clone the Repository
```bash
git clone https://github.com/rakshitp18/Last-Mile-Delivery-Tracker.git
cd Last-Mile-Delivery-Tracker
```

---

### 2. Run with Docker Compose (Fastest)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8088/api`
- PostgreSQL: `localhost:5432`

---

### 3. Run Manually (Local Development)

#### Backend (Spring Boot):
```bash
cd backend
./mvnw spring-boot:run
```
*(Runs on `http://localhost:8088` with embedded H2 in PostgreSQL compatibility mode).*

#### Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173` with instant Vite hot module replacement).*

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Operations Admin** | `admin@gatiman.com` | `admin` | Full dispatch console, fleet assignment, rate card configuration, system audit logs |
| **Enterprise Customer** | `customer@gatiman.com` | `customer` | Booking creation, volumetric calculator, order history, live tracking |
| **Delivery Driver** | `agent@gatiman.com` | `agent` | Active parcel acceptance, status updating, OTP-protected delivery confirmation |

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | ❌ Public |
| `POST` | `/api/auth/google` | Google OAuth token exchange | ❌ Public |
| `GET` | `/api/orders/track/{trackingNumber}` | Public parcel telemetry lookup | ❌ Public |
| `POST` | `/api/orders` | Create shipment booking | ✅ Customer / Admin |
| `GET` | `/api/orders/my-orders` | Fetch customer shipments | ✅ Customer |
| `PATCH` | `/api/agent/orders/{id}/status` | Update delivery state & coordinates | ✅ Delivery Driver |
| `GET` | `/api/admin/dashboard/stats` | Aggregate operations KPIs | ✅ Admin |
| `GET` | `/api/health` | Service health status check | ❌ Public |

---

## 📄 License & Author

Authored by **[Rakshit Pandey](https://github.com/rakshitp18)**.

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.
