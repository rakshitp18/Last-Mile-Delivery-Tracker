# ⚡ Ship It — Intelligent Last-Mile Delivery Management Platform
> *Smart Logistics. High-Speed Fleet Tracking. Seamless Delivery.*

[![GitHub Repository](https://img.shields.io/badge/GitHub-rakshitp18%2FLast--Mile--Delivery--Tracker-181717?style=flat&logo=github)](https://github.com/rakshitp18/Last-Mile-Delivery-Tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Ship It** is a production-ready, full-stack logistics and last-mile delivery management platform engineered for modern e-commerce and supply chains. It features deterministic volumetric pricing calculation, automated proximity driver pairing, real-time GPS telemetry, customer self-service rescheduling, and dedicated operational cockpits for Customers, Fleet Drivers, and Operations Admins.

---

## ✨ Key Features

- 📦 **Dynamic Volumetric Pricing Engine**: Automated billable weight calculation using industry-standard volumetric formulas ($\text{billable} = \max(\text{actual}, \frac{L \times B \times H}{5000})$) and automatic Intra-Zone vs. Inter-Zone rate card slab detection.
- 🎯 **Smart Proximity Auto-Assignment**: Intelligent algorithm balancing driver workload quotas, preferred regional zone clusters, and GPS Haversine distance.
- 🛰️ **Live Shipment Telemetry**: Real-time package tracking with interactive status timeline, driver location, and immutable audit event logs.
- 🔄 **Failed Delivery Recovery**: Multi-attempt tracking with self-service customer rescheduling portal and automatic dispatcher reassignment.
- 👥 **Role-Based Portals (RBAC)**:
  - **Customer Portal**: Multi-step shipment booking, rate estimator, live map radar, and order management.
  - **Delivery Agent Cockpit**: Mobile-first touch interface for milestone updates (`PICKED_UP` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`), duty toggle, and failure logging.
  - **Operations Admin Dashboard**: Master dispatch oversight, rate card configuration, zone mapping, fleet analytics, and email notification monitors.
- 🔐 **Enterprise Authentication**: Stateless JWT security, BCrypt password hashing, and Google OAuth 2.0 integration.
- 💳 **Online Payments**: Integrated Razorpay checkout workflow for seamless digital payments.

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Spring Boot 3.3.4, Java 21, Spring Security (JWT), Spring Data JPA, Hibernate |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons, Recharts, Leaflet |
| **State Management** | TanStack Query v5, Context API, React Hook Form + Zod |
| **Databases** | PostgreSQL 15+ (Production) / In-Memory H2 (Local zero-config development) |
| **API Documentation** | OpenAPI 3.0 / Swagger UI |

---

## 📁 Project Structure

```
Last-Mile-Delivery-Tracker/
├── backend/                         # Spring Boot 3 Java Application
│   ├── src/main/java/com/gatiman/   # Controllers, Services, Entities, Repositories, Security
│   ├── src/main/resources/          # application.yml & configuration
│   └── pom.xml                      # Maven dependencies
├── frontend/                        # React 19 + Vite Application
│   ├── src/components/              # UI & Layout components
│   ├── src/pages/                   # Customer, Agent, Admin, and Auth pages
│   ├── src/context/                 # AuthContext & Session management
│   ├── src/api/                     # Axios API service clients
│   └── package.json                 # Frontend dependencies
├── docker-compose.yml               # Multi-container orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 21+
- **Maven**: 3.9+
- **Node.js**: 20+ & npm
- *(Optional)* PostgreSQL 15+ or Docker

---

### 1️⃣ Backend Setup (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

- **Backend API**: `http://localhost:8088/api`
- **Swagger Documentation**: `http://localhost:8088/swagger-ui/index.html`
- **H2 Database Console**: `http://localhost:8088/h2-console` *(JDBC URL: `jdbc:h2:mem:gatiman_db`)*

---

### 2️⃣ Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Application**: `http://localhost:5173`

---

## 🔑 Demo Access & Seed Accounts

All demo accounts come pre-configured with password: `password123` *(or `Admin@123` / `Agent@123` / `Customer@123`)*.

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Operations Admin** | `admin@gmail.com` | Dispatch controls, zone clusters, rate cards, analytics |
| **Delivery Driver** | `agent@gmail.com` | Mobile delivery runsheet, GPS telemetry, status updates |
| **Customer** | `customer@gmail.com` | Create shipments, price estimator, track parcels, reschedule |

*(Quick demo login buttons are available directly on the login page for one-click access).*

---

## 🐳 Docker Deployment

Run the complete multi-service stack with Docker Compose:

```bash
docker-compose up --build
```

---

## 🧪 Automated Testing

Execute backend unit and integration test suites:

```bash
cd backend
mvn test
```

---

## 👤 Author

**Rakshit Pandey**
- GitHub: [@rakshitp18](https://github.com/rakshitp18)
- Repository: [https://github.com/rakshitp18/Last-Mile-Delivery-Tracker](https://github.com/rakshitp18/Last-Mile-Delivery-Tracker)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright © 2026 **Rakshit Pandey**. All rights reserved.
