#!/bin/sh
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE omnistay_db;
    CREATE DATABASE keycloak_db;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "omnistay_db" <<-EOSQL
    -- 1. Suites & Villas Table
    CREATE TABLE IF NOT EXISTS suites (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        capacity VARCHAR(50) NOT NULL,
        size VARCHAR(50) NOT NULL,
        image TEXT NOT NULL,
        gallery TEXT[] NOT NULL,
        description TEXT NOT NULL,
        amenities TEXT[] NOT NULL
    );

    -- 2. Dining Items Table
    CREATE TABLE IF NOT EXISTS dining_items (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL
    );

    -- 3. Spa Services Table
    CREATE TABLE IF NOT EXISTS spa_services (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL
    );

    -- 4. Guest Reviews Table
    CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(50) PRIMARY KEY,
        guest_name VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        rating INT NOT NULL,
        comment TEXT NOT NULL,
        review_date VARCHAR(50) NOT NULL
    );

    -- 5. Pending Booking Requests Table
    CREATE TABLE IF NOT EXISTS pending_bookings (
        id VARCHAR(50) PRIMARY KEY,
        guest_name VARCHAR(100) NOT NULL,
        guest_email VARCHAR(100) NOT NULL,
        guest_phone VARCHAR(50),
        requested_room_type VARCHAR(150) NOT NULL,
        check_in VARCHAR(50) NOT NULL,
        check_out VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Occupied Active Rooms Table
    CREATE TABLE IF NOT EXISTS occupied_rooms (
        room_number VARCHAR(20) PRIMARY KEY,
        guest_name VARCHAR(100) NOT NULL,
        guest_email VARCHAR(100),
        guest_phone VARCHAR(50),
        folio_id VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        check_in VARCHAR(50) NOT NULL,
        check_out VARCHAR(50) NOT NULL,
        nightly_rate DECIMAL(10, 2) NOT NULL
    );

    -- 7. Folio Line Item Transactions Table
    CREATE TABLE IF NOT EXISTS folio_transactions (
        id VARCHAR(100) PRIMARY KEY,
        room_number VARCHAR(20) NOT NULL,
        transaction_date VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        department_code VARCHAR(50) NOT NULL,
        guest_name VARCHAR(100) NOT NULL
    );

    -- 8. Housekeeping Room Statuses Table
    CREATE TABLE IF NOT EXISTS room_statuses (
        room_number VARCHAR(20) PRIMARY KEY,
        cleaning_status VARCHAR(50) NOT NULL
    );

    -- 9. Settled Past Stay Invoices Table
    CREATE TABLE IF NOT EXISTS invoices (
        invoice_id VARCHAR(100) PRIMARY KEY,
        room_number VARCHAR(20) NOT NULL,
        guest_name VARCHAR(100) NOT NULL,
        guest_email VARCHAR(100),
        guest_phone VARCHAR(50),
        folio_id VARCHAR(100) NOT NULL,
        check_in VARCHAR(50) NOT NULL,
        check_out VARCHAR(50) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) NOT NULL,
        grand_total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        settled_at VARCHAR(100) NOT NULL
    );

    -- ==========================================
    -- SEED INITIAL LUXURY RESORT DATASET
    -- ==========================================

    -- Seed Suites & Villas
    INSERT INTO suites (id, title, category, price, capacity, size, image, gallery, description, amenities) VALUES
    ('SUITE-101', 'Presidential Ocean Penthouse', 'SUITES', 850.00, '4 Guests', '220 sq.m',
     'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
     ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'],
     'Top-floor oceanfront penthouse suite featuring private infinity plunge pool, panoramic deck, marble bathroom, and 24/7 dedicated butler service.',
     ARRAY['Private Infinity Pool', 'Master Hydro Tub', '24/7 Butler Service', 'Executive Lounge Access']),
    
    ('VILLA-102', 'Executive Sunset Lagoon Villa', 'VILLAS', 520.00, '2 Guests', '160 sq.m',
     'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
     ARRAY['https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
     'Overwater lagoon villa offering direct ocean staircase, private sunset deck, king feather bedding, and oceanfront dining.',
     ARRAY['Direct Lagoon Deck', 'Overwater Hammock', 'King Feather Bed', 'Personalized Mini Bar']),

    ('DELUXE-103', 'Grand Deluxe King Suite', 'SUITES', 340.00, '2 Guests', '95 sq.m',
     'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
     ARRAY['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
     'Spacious deluxe king room with high-speed fiber internet, executive workstation, floor-to-ceiling glass, and marble bath.',
     ARRAY['High-Speed Wi-Fi', 'Executive Workstation', 'Marble Bathroom', 'Smart Suite Controls']),

    ('VILLA-104', 'Royal Overwater Pavilion', 'VILLAS', 980.00, '6 Guests', '310 sq.m',
     'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
     ARRAY['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
     'Ultra-exclusive 3-bedroom overwater pavilion with private glass floor salon, infinity pool, and personal chef service.',
     ARRAY['Glass Floor Viewing', 'Private Chef Service', 'Helipad Access', 'Infinity Pool']),

    ('VILLA-105', 'Imperial Horizon Pool Villa', 'VILLAS', 750.00, '4 Guests', '240 sq.m',
     'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
     ARRAY['https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'],
     'Secluded cliffside villa with panoramic sea views, private heated infinity pool, and open-air rainfall outdoor shower.',
     ARRAY['Cliffside Sea View', 'Heated Infinity Pool', 'Outdoor Rain Shower', '24/7 Butler Service']),

    ('SUITE-106', 'Oceanfront Sanctuary Residence', 'SUITES', 1200.00, '8 Guests', '450 sq.m',
     'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
     ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
     'Flagship beachfront compound featuring private garden, 20m lap pool, spa treatment room, and dedicated chauffeur service.',
     ARRAY['Private Beach Garden', '20m Lap Pool', 'Private Spa Room', 'Luxury Chauffeur Service']);

    -- Seed Dining Items
    INSERT INTO dining_items (id, name, category, price, image, description) VALUES
    ('DISH-01', 'Truffle Glazed Wagyu Ribeye', 'Fine Dining', 95.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 'A5 Japanese Wagyu ribeye grilled over binchotan charcoal, finished with black winter truffle jus.'),
    ('DISH-02', 'Wild Ocean Bluefin Tuna Tartare', 'Starters', 42.00, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80', 'Line-caught bluefin tuna tossed with avocado mousse, oscietra caviar, crisp shallots, and citrus ponzu.'),
    ('DISH-03', 'Vintage Dom Pérignon Champagne Flute', 'Sommelier Drinks', 65.00, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', 'Chilled flute of Dom Pérignon Brut, served with organic strawberries and artisan dark chocolate truffles.'),
    ('DISH-04', 'Pan-Seared Chilean Sea Bass', 'Chef Signature', 88.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80', 'Wild-caught sea bass served over saffron risotto, braised baby fennel, and caviar butter emulsion.'),
    ('DISH-05', 'Heirloom Burrata & Golden Beet Salad', 'Starters', 34.00, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb23659?auto=format&fit=crop&w=1200&q=80', 'Creamy Apulian burrata, roasted golden beets, aged Modena balsamic reduction, and candied pistachios.'),
    ('DISH-06', 'Valrhona Chocolate Grand Soufflé', 'Desserts', 28.00, 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=1200&q=80', 'Warm 70% dark chocolate soufflé served with Tahitian vanilla bean gelato and 24K edible gold leaf.');

    -- Seed Spa Services
    INSERT INTO spa_services (id, title, duration, price, image, description) VALUES
    ('SPA-01', 'Royal Mineral Hydrotherapy Massage', '90 Min', 220.00, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80', 'Deep tissue therapy combined with volcanic hot stone massage and mineral-infused thermal bath soak.'),
    ('SPA-02', 'Aromatherapy Botanical Facial', '60 Min', 160.00, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80', 'Rejuvenating facial treatment using organic botanical serums, chilled quartz roller massage, and hydration mask.'),
    ('SPA-03', 'Himalayan Pink Salt Scrub & Detox', '75 Min', 195.00, 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80', 'Full body exfoliation with hand-mined pink salt crystals, followed by nourishing essential oil wrap.'),
    ('SPA-04', 'Couples Sunset Lagoon Ritual', '120 Min', 420.00, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', 'Overwater cabana massage for two featuring champagne, rose bath soak, and personalized body oils.'),
    ('SPA-05', 'Balinese Deep Tissue Reflexology', '60 Min', 145.00, 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80', 'Acupressure techniques combined with warm herbal compresses to relieve muscle tension and stress.'),
    ('SPA-06', 'Gold Leaf Anti-Aging Body Wrap', '90 Min', 280.00, 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80', 'Luxurious 24K gold infused serum wrap with head-to-toe lymphatic drainage massage.');

    -- Seed Reviews
    INSERT INTO reviews (id, guest_name, location, rating, comment, review_date) VALUES
    ('REV-01', 'Lady Eleanor Vance', 'London, United Kingdom', 5, 'The Presidential Ocean Penthouse was pure perfection. The private butler service and sunset lagoon views set a new benchmark.', 'August 2026'),
    ('REV-02', 'Alexander Sterling', 'Zurich, Switzerland', 5, 'Unrivaled culinary experiences at Azure Restaurant. The Wagyu Ribeye and sommelier pairings were extraordinary.', 'July 2026'),
    ('REV-03', 'Dr. Sophia Chen', 'Tokyo, Japan', 5, 'The Hydrotherapy Pavilion is world-class. Absolute tranquility and flawless hospitality throughout our entire stay.', 'August 2026'),
    ('REV-04', 'Marcus & Elena Vane', 'New York, USA', 5, 'Arriving by private yacht and staying at the Sunset Lagoon Villa was an unforgettable dream. 10/10 service excellence.', 'August 2026'),
    ('REV-05', 'Sheikh Hamdan Al-Maktoum', 'Dubai, UAE', 5, 'OmniStay sets the standard for ultra-luxury resorts worldwide. Immaculate attention to privacy and personalized concierge detail.', 'June 2026'),
    ('REV-06', 'Claire de la Tour', 'Paris, France', 5, 'Sensational spa therapies and exquisite beachfront dining under the stars. We are already booking our return stay for next summer!', 'August 2026');

    -- Seed Initial Pending Booking
    INSERT INTO pending_bookings (id, guest_name, guest_email, guest_phone, requested_room_type, check_in, check_out, status, total_amount) VALUES
    ('BK-1001', 'Siddharth K.', 'siddharth@omnistay.com', '+1 (555) 234-5678', 'Presidential Ocean Penthouse', '2026-08-23', '2026-08-25', 'PENDING_APPROVAL', 850.00);

    -- 10. User Accounts Authentication Table
    CREATE TABLE IF NOT EXISTS user_accounts (
        account_id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        guest_tier VARCHAR(100) NOT NULL,
        created_at VARCHAR(100) NOT NULL
    );

    -- Seed Default System Accounts
    INSERT INTO user_accounts (account_id, username, email, phone, password, role, full_name, guest_tier, created_at) VALUES
    ('a3e81000-0000-4000-8000-000000001000', 'guest', 'guest@omnistay.com', '9876543210', 'guest123', 'GUEST', 'Valued OmniStay Guest', 'VIP Executive Member', NOW()::text),
    ('b1e82001-0000-4000-8000-000000002001', 'restaurant', 'restaurant@omnistay.com', '9123456789', 'rest123', 'STAFF_RESTAURANT', 'Chef Antoine (F&B Manager)', 'Restaurant Manager', NOW()::text),
    ('c1e83001-0000-4000-8000-000000003001', 'housekeeping', 'housekeeping@omnistay.com', '9234567890', 'hk123', 'STAFF_HOUSEKEEPING', 'Elena Rostova (Housekeeping Exec)', 'Housekeeping Lead', NOW()::text),
    ('d1e84001-0000-4000-8000-000000004001', 'frontdesk', 'frontdesk@omnistay.com', '9345678901', 'fd123', 'STAFF_FRONTDESK', 'Marcus Vance (Front Desk Lead)', 'Front Desk Lead', NOW()::text),
    ('e1e81001-0000-4000-8000-000000001001', 'admin', 'admin@omnistay.com', '9999999999', 'admin123', 'ADMIN', 'System Administrator', 'Staff Command Center', NOW()::text);
EOSQL
