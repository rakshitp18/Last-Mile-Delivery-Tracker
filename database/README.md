# 🗄️ Ship It Database Deployment Guide

This directory contains the production database DDL schema and deployment documentation.

---

## 🚀 Live Render Managed PostgreSQL Deployment

Your PostgreSQL 16 database is hosted on **Render** (Oregon US West):

* **Database Name**: `shipit_1dix`
* **Username**: `shipit_1dix_user`
* **Password**: `AzgQ14t77qRWy3xV0kyBQhTaWcXXW9qT`
* **Internal Connection (Within Render)**: `postgresql://shipit_1dix_user:AzgQ14t77qRWy3xV0kyBQhTaWcXXW9qT@dpg-da68p2vqj5pc73eu21t0-a/shipit_1dix`
* **External Connection (Cloud / Local Dev / CI/CD)**: `postgresql://shipit_1dix_user:AzgQ14t77qRWy3xV0kyBQhTaWcXXW9qT@dpg-da68p2vqj5pc73eu21t0-a.oregon-postgres.render.com/shipit_1dix`

---

## 🚀 Database Initialization Options

### Option 1: Automatic Hibernate Provisioning (Recommended)
Spring Boot backend uses Hibernate JPA ORM (`spring.jpa.hibernate.ddl-auto: update`) with auto-seeding via `SeedDataLoader.java`.
When deploying the backend container on Render with active profile `postgres`, Hibernate automatically creates and updates all 17 tables, indexes, and initial demo network records on startup.

Environment Variables configured on Render:
```bash
SPRING_PROFILES_ACTIVE=postgres
DATABASE_URL=jdbc:postgresql://dpg-da68p2vqj5pc73eu21t0-a:5432/shipit_1dix
DATABASE_USERNAME=shipit_1dix_user
DATABASE_PASSWORD=AzgQ14t77qRWy3xV0kyBQhTaWcXXW9qT
DATABASE_DRIVER=org.postgresql.Driver
```

---

### Option 2: Direct SQL Import via PSQL CLI
You can execute [`schema.sql`](schema.sql) directly into your live Render database:

```bash
PGPASSWORD=AzgQ14t77qRWy3xV0kyBQhTaWcXXW9qT psql -h dpg-da68p2vqj5pc73eu21t0-a.oregon-postgres.render.com -U shipit_1dix_user -d shipit_1dix -f database/schema.sql
```

---

## 📊 Database Schema Entity Map

| Table Name | Description | Key Relationships |
| :--- | :--- | :--- |
| **`users`** | Core accounts (Admin, Customer, Driver) | Base entity with BCrypt auth |
| **`customers`** | Customer enterprise profiles | `user_id -> users(id)` |
| **`delivery_agents`** | Drivers, vehicle types, live location | `user_id -> users(id)`, `assigned_zone_id -> zones(id)` |
| **`zones`** | Regional delivery clusters | Master zone registry |
| **`areas`** | PIN Code mappings | `zone_id -> zones(id)` |
| **`rate_cards`** | Slabs, volumetric multipliers | Intra-Zone & Inter-Zone rules |
| **`rate_card_rules`** | Dynamic distance / weight tiers | `rate_card_id -> rate_cards(id)` |
| **`orders`** | Shipments, volumetric calculations | Lifecycle finite state machine |
| **`order_tracking_events`** | Append-only immutable audit trail | `order_id -> orders(id)` |
| **`reschedule_requests`** | Failed delivery recovery slots | `order_id -> orders(id)` |
| **`payments`** | Razorpay transactions | `order_id -> orders(id)` |
| **`notifications`** | In-app alerts | `user_id -> users(id)` |
| **`email_logs`** | Notification delivery audit | `order_id -> orders(id)` |

---

## 📄 License
Copyright © 2026 **Rakshit Pandey**. All rights reserved.
