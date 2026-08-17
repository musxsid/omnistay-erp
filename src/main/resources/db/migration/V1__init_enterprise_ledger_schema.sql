-- Flyway Migration V1: Institutional Double-Entry Hospitality Ledger & Multi-Property ERP Schema

CREATE TABLE properties (
    property_id UUID PRIMARY KEY,
    property_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    time_zone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_types (
    room_type_id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_rate DECIMAL(12, 2) NOT NULL,
    max_occupancy INT NOT NULL DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_property_roomtype_code UNIQUE (property_id, code)
);

CREATE TABLE rate_plans (
    rate_plan_id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT uk_property_rateplan_code UNIQUE (property_id, code)
);

CREATE TABLE rooms (
    room_id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES room_types(room_type_id),
    room_number INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    daily_rate DECIMAL(12, 2) NOT NULL,
    version BIGINT DEFAULT 0,
    CONSTRAINT uk_property_room_number UNIQUE (property_id, room_number)
);

CREATE TABLE guests (
    guest_id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    identification_no VARCHAR(50),
    loyalty_tier VARCHAR(30) DEFAULT 'STANDARD',
    active_folio_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservations (
    reservation_id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(guest_id),
    assigned_room_id UUID REFERENCES rooms(room_id),
    rate_plan_id UUID REFERENCES rate_plans(rate_plan_id),
    confirmation_code VARCHAR(30) NOT NULL UNIQUE,
    check_in_date TIMESTAMP NOT NULL,
    check_out_date TIMESTAMP NOT NULL,
    adult_count INT DEFAULT 1,
    child_count INT DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
    total_amount DECIMAL(12, 2) NOT NULL,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE folios (
    folio_id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    reservation_id UUID UNIQUE REFERENCES reservations(reservation_id),
    guest_id UUID NOT NULL REFERENCES guests(guest_id),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    check_in_date TIMESTAMP NOT NULL,
    check_out_date TIMESTAMP,
    is_settled BOOLEAN DEFAULT FALSE,
    total_due DECIMAL(12, 2) DEFAULT 0.00,
    total_paid DECIMAL(12, 2) DEFAULT 0.00,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE guests ADD CONSTRAINT fk_guest_active_folio FOREIGN KEY (active_folio_id) REFERENCES folios(folio_id) ON DELETE SET NULL;

CREATE TABLE folio_transactions (
    transaction_id UUID PRIMARY KEY,
    folio_id UUID NOT NULL REFERENCES folios(folio_id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(property_id),
    transaction_type VARCHAR(10) NOT NULL, -- DEBIT, CREDIT
    department_code VARCHAR(20) NOT NULL, -- ROOM, F_AND_B, SPA, TAX, PAYMENT, MISC
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    reference_code VARCHAR(100),
    is_voided BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tax_configurations (
    tax_id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    tax_code VARCHAR(20) NOT NULL,
    tax_name VARCHAR(100) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    department_code VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT uk_property_tax_code UNIQUE (property_id, tax_code)
);

CREATE TABLE invoices (
    invoice_id UUID PRIMARY KEY,
    folio_id UUID NOT NULL REFERENCES folios(folio_id),
    property_id UUID NOT NULL REFERENCES properties(property_id),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    guest_name VARCHAR(150) NOT NULL,
    issue_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) NOT NULL,
    pdf_url VARCHAR(255)
);

-- Indexing for high performance queries
CREATE INDEX idx_rooms_property_status ON rooms(property_id, status);
CREATE INDEX idx_reservations_dates ON reservations(property_id, check_in_date, check_out_date);
CREATE INDEX idx_folio_txns_folio ON folio_transactions(folio_id, created_at);
