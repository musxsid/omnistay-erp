# OmniStay ERP — Comprehensive System Architecture & Technical Dossier

> **Purpose**: This document provides a complete, production-grade technical blueprint of the **OmniStay ERP** codebase. It is designed to be shared directly with Gemini (or any AI assistant) to provide full context on the application's current state, architecture, database schemas, frontend components, missing backend APIs, and precise improvement prompts.

---

## 1. Executive Summary & Business Domain

**OmniStay ERP** is a full-stack Hotel & Resort Enterprise Resource Planning (ERP) system designed for luxury hospitality management. The system bridges staff operations (Command Center, Room Matrix, Restaurant POS, Bookings Log, System Admin, AI Guest Concierge) with a public-facing Guest Reservation Portal.

- **Backend Repository Root**: `/home/siddharth/Projects/omnistay-erp` (Spring Boot Java Application)
- **Frontend Directory**: `/home/siddharth/Projects/omnistay-erp/omnistay-frontend` (React 19 Single Page Application)
- **Primary Database**: PostgreSQL (`omnistay_db` running on port `5432`)

---

## 2. Technical Stack Breakdown

### Backend (Java Spring Boot)
- **Java Version**: 17
- **Framework**: Spring Boot 4.0.6 (`spring-boot-starter-webmvc`, `spring-boot-starter-data-jpa`)
- **Database Driver**: PostgreSQL JDBC Driver (`org.postgresql:postgresql:42.7.5`)
- **ORM / Persistence**: Hibernate / JPA (`spring.jpa.hibernate.ddl-auto=update`)
- **Utility Tools**: Project Lombok (`@Data`, `@RequiredArgsConstructor`, etc.)
- **Build Tool**: Apache Maven (`pom.xml`, `mvnw`)

### Frontend (React SPA)
- **Library/Framework**: React 19 (`^19.2.6`), React DOM (`^19.2.6`), `react-scripts` 5.0.1
- **Data Visualization**: Recharts (`^3.8.1`) for line and bar charts
- **Styling**: Custom Enterprise Theme CSS (`enterprise-theme.css`) with glassmorphism, dark palette (`#09090b`, `#18181b`), and modern typography
- **State & Context Management**: React Context API (`AuthContext.js`, `DataContext.js`)

---

## 3. Current Architecture & Data Models

### Database Schema (JPA Entities)

#### 1. `Room` Entity (`rooms` table)
- `roomId` (`UUID`, Primary Key, auto-generated)
- `roomNumber` (`Integer`, Unique, Non-null)
- `roomType` (`String`, Non-null) — *e.g., Standard Single, Executive Double, Deluxe King, Presidential Suite*
- `status` (`Enum`: `AVAILABLE`, `OCCUPIED`, `DIRTY`)
- `dailyRate` (`BigDecimal`, Non-null)

#### 2. `Guest` Entity (`guests` table)
- `guestId` (`UUID`, Primary Key, auto-generated)
- `fullName` (`String`)
- `email` (`String`)
- `activeFolio` (`@OneToOne(cascade = CascadeType.PERSIST)`, ForeignKey: `active_folio_id`) -> `Folio`

#### 3. `Folio` Entity (`folios` table)
- `folioId` (`UUID`, Primary Key, auto-generated)
- `checkInDate` (`LocalDateTime`)
- `checkOutDate` (`LocalDateTime`)
- `isSettled` (`boolean`, default: `false`)
- `totalDue` (`Double`, default: `0.0`)

#### 4. `RoomStatus` Enum
- `AVAILABLE`
- `OCCUPIED`
- `DIRTY`

---

## 4. Backend Components & Implemented APIs

### Services & Repositories Implemented
- `RoomRepository` & `GuestRepository`: Spring Data JPA Repositories.
- `RoomService`: Transactional methods for `createRoom`, `getAllRooms`, `updateRoomStatus`, and `deleteRoom` (enforces rule: occupied rooms cannot be deleted).
- `GuestService`: Transactional method for `checkInGuest` (creates a new `Folio` and links it to `Guest` using JPA cascade).

### REST Endpoints Implemented (`RoomController`)
- `POST /api/rooms` — Creates a new room asset.
- `GET /api/rooms` — Retrieves all physical rooms from PostgreSQL.
- `PUT /api/rooms/{id}/status?status=...` — Updates room status (`AVAILABLE`, `OCCUPIED`, `DIRTY`).
- `DELETE /api/rooms/{id}` — Deletes a room if not occupied.

---

## 5. Frontend Structure & Application Flow

### Authentication & Navigation (`App.js`, `AuthContext.js`)
- `viewMode`: Controls view switching between `public` (Guest Portal) and `internal` (Staff ERP).
- Authentication: Currently simulated via client-side check (`admin` / `admin123`) saved in `localStorage`.

### Enterprise Layout Modules (`EnterpriseLayout.jsx`)
1. **Command Center (`DashboardView.jsx`)**: Displays live room counts, occupancy ratios, pending invoices, API traffic, Recharts weekly revenue line chart, and monthly occupancy bar chart.
2. **Room Matrix (`RoomMatrix.jsx`)**: Grid of room cards color-coded by status (Green = Available, Red = Occupied, Amber = Dirty/Needs Cleaning). Supports instant status updates and opens a detailed **Guest Folio Modal** upon clicking an occupied room.
3. **Guest Folio Modal (`GuestFolio.jsx`)**: Ledger view showing date, department charges (Lodging, Restaurant POS), transaction lists, and total balance due.
4. **Restaurant POS (`PosScreen.jsx`)**: Allows restaurant staff to order items (e.g., Truffle Burger, Ribeye Steak, Craft Cocktail) and directly charge the ticket to an active guest room folio.
5. **Bookings Log (`BookingsDashboard.jsx`)**: Live search & table view of current guest reservations.
6. **System Administration (`AdminDashboard.jsx`)**: CRUD interface to view, add, or delete rooms from PostgreSQL, alongside live connection health indicators.
7. **AI Concierge Operations (`AiConcierge.jsx`)**: Interface to paste guest reviews or maintenance complaints and receive structured sentiment/resolution reports powered by LLM models with markdown formatting and copy-to-clipboard support.
8. **Public Guest Portal (`GuestPortal.jsx`)**: Public booking form allowing prospective guests to check live suite availability and submit room reservations.

---

## 6. Disconnected Endpoints & Known Functional Gaps

While the UI is fully styled and responsive, the following API endpoints are called by React components but are **not yet implemented** in the Spring Boot backend:

| Module | Frontend Call URI | Current Behavior | Gap / Required Spring Boot Component |
| :--- | :--- | :--- | :--- |
| **Room Matrix / Dashboard** | `GET /api/rooms/matrix` | Fails or relies on fallback | Need `RoomMatrixDTO` returning combined Room, Guest Name, Amount, and `folioId`. |
| **Guest Folio** | `GET /api/folios/{id}` | Triggers fallback calculation | Need `FolioController` and `Transaction` entity to return real ledger charges. |
| **Restaurant POS** | `GET /api/v1/restaurant/menu`<br>`POST /api/v1/restaurant/charge-to-room` | Uses hardcoded menu; fallback charge alert | Need `RestaurantController`, `MenuItem` entity, and charge processing service. |
| **Public Guest Portal** | `POST /api/v1/enterprise/bookings` | Errors if backend unready | Need `BookingController` / `ReservationService` to handle guest check-ins. |
| **AI Concierge** | `POST /api/v1/ai/analyze-review` | Fails without gateway | Need `AiController` integrating Groq SDK or Gemini API. |
| **Data Context** | `GET /api/v1/enterprise/rooms, guests, invoices, telemetry` | Swallows error | Need `EnterpriseController` telemetry endpoints. |
| **Security** | None (Client-side localStorage) | Hardcoded `admin`/`admin123` | Missing Spring Security 6, JWT Filter, BCryptPasswordEncoder, and User roles. |

---

## 7. Master Prompts to Give to Gemini to Upgrade This Project

You can copy and paste any of the following curated prompts directly into **Gemini Chat** to request complete, ready-to-run code implementations for this project:

### 🌟 PROMPT 1: Build All Missing Spring Boot Controllers & DTOs
```text
I have a Spring Boot 4.0 + PostgreSQL ERP project named OmniStay ERP.
Currently, my backend only has basic Room CRUD (/api/rooms). The React frontend requires the following endpoints to be fully functional:

1. GET /api/rooms/matrix -> Returns list of rooms enriched with guest fullName, active folio total amount, and folioId. Create a RoomMatrixDTO and query logic.
2. GET /api/folios/{folioId} -> Returns Folio details with guest information and a list of transactions (Date, Department, Amount).
3. POST /api/v1/enterprise/bookings -> Accepts guestName, guestEmail, roomId, checkIn, checkOut. Creates/links Guest, Folio, updates Room status to OCCUPIED.
4. POST /api/v1/restaurant/charge-to-room -> Accepts folioId and list of itemIds, adds items to Folio totalDue and logs transactions.

Please generate the complete, production-ready Spring Boot controllers, DTOs, Services, and updated Entities for these 4 endpoints.
```

### 🔒 PROMPT 2: Add Spring Security 6 + JWT Authentication
```text
In my OmniStay ERP project (Spring Boot 4 + React), authentication is currently hardcoded on the client side.
Please implement a complete, enterprise-grade Spring Security 6 setup:
1. User & Role entities (User, Role enum: ROLE_ADMIN, ROLE_RECEPTION, ROLE_GUEST).
2. JwtTokenProvider, JwtAuthenticationFilter, and SecurityConfig with CorsConfigurationSource for React on localhost:3000.
3. AuthController with POST /api/v1/auth/login and POST /api/v1/auth/register returning JWT tokens.
4. Updated React AuthContext.js to store JWT in secure HTTP-only cookies or localStorage and attach Bearer tokens to fetch requests.
```

### 🤖 PROMPT 3: Integrate Gemini AI Concierge Service
```text
I have an AI Concierge UI page in my React frontend (omnistay-frontend) that sends POST /api/v1/ai/analyze-review with JSON { "review": "text..." }.
Please write a Spring Boot Service and REST Controller (`AiConciergeController` & `GeminiAiService`) that calls the official Google Gemini REST API / SDK to analyze hotel guest complaints/reviews.
The response should format a structured JSON:
{
  "status": "SUCCESS",
  "aiAnalysisReport": "**Sentiment:** ... \n**Key Issues:** ... \n**Recommended Action:** ..."
}
Include proper error handling and API key configuration in application.properties.
```

### 🐳 PROMPT 4: Dockerization & One-Command Local Setup
```text
Provide a production docker-compose.yml file and Dockerfiles for OmniStay ERP:
1. Dockerfile for Spring Boot (multi-stage Maven build with Java 17 runtime).
2. Dockerfile for React frontend (multi-stage Node build served with Nginx).
3. Postgres 16 container with environment variables matching application.properties.
4. Docker Compose service network and health checks so the backend waits for Postgres to be ready before starting.
```

---

*Document Generated for OmniStay ERP — Ready for AI-assisted Code Expansion.*
