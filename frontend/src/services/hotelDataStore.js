import { useState, useEffect } from 'react';
import { apiFetch } from './apiClient';

// 100% Unique High-Resolution Luxury Resort Dataset (16 Unique Suites & Villas)
const defaultSuites = [
  {
    id: 'SUITE-101',
    title: 'Presidential Ocean Penthouse',
    category: 'SUITES',
    price: 850,
    capacity: '4 Guests',
    size: '220 sq.m',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Top-floor oceanfront penthouse suite featuring private infinity plunge pool, panoramic deck, marble bathroom, and 24/7 dedicated butler service.',
    amenities: ['Private Infinity Pool', 'Master Hydro Tub', '24/7 Butler Service', 'Executive Lounge Access']
  },
  {
    id: 'VILLA-102',
    title: 'Executive Sunset Lagoon Villa',
    category: 'VILLAS',
    price: 520,
    capacity: '2 Guests',
    size: '160 sq.m',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Overwater lagoon villa offering direct ocean staircase, private sunset deck, king feather bedding, and oceanfront dining.',
    amenities: ['Direct Lagoon Deck', 'Overwater Hammock', 'King Feather Bed', 'Personalized Mini Bar']
  },
  {
    id: 'DELUXE-103',
    title: 'Grand Deluxe King Suite',
    category: 'SUITES',
    price: 340,
    capacity: '2 Guests',
    size: '95 sq.m',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Spacious deluxe king room with high-speed fiber internet, executive workstation, floor-to-ceiling glass, and marble bath.',
    amenities: ['High-Speed Wi-Fi', 'Executive Workstation', 'Marble Bathroom', 'Smart Suite Controls']
  },
  {
    id: 'SUITE-104',
    title: 'Royal Horizon Sanctuary',
    category: 'SUITES',
    price: 680,
    capacity: '3 Guests',
    size: '180 sq.m',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Elevated corner sanctuary featuring floor-to-ceiling glass walls, private terrace with fire pit, and deep soaking tub.',
    amenities: ['Terrace Fire Pit', 'Deep Soaking Tub', 'Pillow Selection Menu', 'Private Wine Cellar']
  },
  {
    id: 'VILLA-105',
    title: 'Imperial Beachfront Pool Villa',
    category: 'VILLAS',
    price: 920,
    capacity: '4 Guests',
    size: '250 sq.m',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Direct beachfront villa with private lap pool, lush private garden, outdoor rain shower, and dedicated chef service.',
    amenities: ['Private Lap Pool', 'Direct Beach Path', 'Outdoor Rain Shower', 'Personal Chef Service']
  },
  {
    id: 'SUITE-106',
    title: 'Celestial Panorama Suite',
    category: 'SUITES',
    price: 490,
    capacity: '2 Guests',
    size: '110 sq.m',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Panoramic mountain and sea view suite equipped with skylight stargazing ceiling, Bose audio, and plush king bed.',
    amenities: ['Stargazing Skylight', 'Bose Surround Audio', 'Private Balcony', 'Nespresso Bar']
  },
  {
    id: 'SUITE-201',
    title: 'Executive Ocean View Suite',
    category: 'SUITES',
    price: 420,
    capacity: '2 Guests',
    size: '105 sq.m',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'High-floor ocean view residence featuring private balcony, luxury amenities, espresso bar, and marble workstation.',
    amenities: ['Oceanfront Balcony', 'Executive Workstation', 'Double Vanity Bath', 'Turndown Service']
  },
  {
    id: 'VILLA-202',
    title: 'Garden Paradise Villa',
    category: 'VILLAS',
    price: 380,
    capacity: '2 Guests',
    size: '130 sq.m',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Secluded tropical garden bungalow featuring outdoor Jacuzzi, private dining pavilion, and lush botanical surroundings.',
    amenities: ['Private Garden Jacuzzi', 'Dining Pavilion', 'Organic Spa Amenities', 'King Canopy Bed']
  },
  {
    id: 'SUITE-203',
    title: 'Royal Sapphire Spa Pavilion',
    category: 'SUITES',
    price: 750,
    capacity: '3 Guests',
    size: '195 sq.m',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Wellness-focused suite featuring in-room sauna, private hydrotherapy tub, massage tables, and aromatherapy oxygen bar.',
    amenities: ['In-Room Sauna', 'Hydrotherapy Bath', 'Private Massage Tables', 'Aromatherapy Diffuser']
  },
  {
    id: 'VILLA-204',
    title: 'Emerald Canopy Bungalow',
    category: 'VILLAS',
    price: 460,
    capacity: '2 Guests',
    size: '140 sq.m',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Treetop bungalow surrounded by lush emerald palms, offering elevated hammock deck, outdoor bath, and fresh fruit service.',
    amenities: ['Elevated Hammock Deck', 'Outdoor Soaking Bath', 'Daily Tropical Fruit', 'Bespoke Teas']
  },
  {
    id: 'SUITE-205',
    title: 'Coral Bay Overwater Suite',
    category: 'SUITES',
    price: 610,
    capacity: '2 Guests',
    size: '150 sq.m',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Stunning overwater suite built directly above living coral reefs with glass floor viewing panel and private swim platform.',
    amenities: ['Glass Ocean Floor Panel', 'Private Swim Ladder', 'Sunset Champagne Bar', 'Snorkel Gear']
  },
  {
    id: 'SUITE-206',
    title: 'Diamond Terrace Penthouse',
    category: 'SUITES',
    price: 890,
    capacity: '4 Guests',
    size: '230 sq.m',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Multi-bedroom top tier penthouse with 360-degree terrace, private infinity jacuzzi, fireplace, and private elevator access.',
    amenities: ['360-Degree Terrace', 'Private Infinity Jacuzzi', 'Private Elevator Key', 'Grand Piano']
  },
  {
    id: 'SUITE-301',
    title: 'Ambassador Oceanfront Suite',
    category: 'SUITES',
    price: 580,
    capacity: '3 Guests',
    size: '165 sq.m',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Elegant ambassador suite overlooking the azure bay, featuring formal dining table for 6, wet bar, and master suite.',
    amenities: ['6-Seat Dining Table', 'Wet Bar & Wine Cellar', 'Master King Bed', 'Luxury Bath Robes']
  },
  {
    id: 'VILLA-302',
    title: 'Orchid Garden Sanctuary',
    category: 'VILLAS',
    price: 390,
    capacity: '2 Guests',
    size: '125 sq.m',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Peaceful garden sanctuary surrounded by blooming orchid beds, featuring outdoor shower and private yoga pavilion.',
    amenities: ['Private Yoga Pavilion', 'Outdoor Stone Shower', 'Orchid Garden Terrace', 'Herbal Tea Bar']
  },
  {
    id: 'VILLA-303',
    title: 'Infinity Cliffside Residence',
    category: 'VILLAS',
    price: 950,
    capacity: '4 Guests',
    size: '260 sq.m',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Dramatic cliffside villa perched over the waves with cantilevered infinity pool, full kitchen, and 24-hour private security.',
    amenities: ['Cantilevered Pool', 'Chef Kitchen', 'Helipad Access', 'Dedicated Concierge']
  },
  {
    id: 'DELUXE-304',
    title: 'Pearl Bay Deluxe King',
    category: 'SUITES',
    price: 320,
    capacity: '2 Guests',
    size: '90 sq.m',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Charming coastal deluxe suite with king featherbed, rainfall shower, garden patio, and complimentary breakfast service.',
    amenities: ['Garden Patio', 'Rainfall Shower', 'Complimentary Breakfast', 'High-Speed Wi-Fi']
  }
];

const defaultDiningItems = [
  {
    id: 'DISH-01',
    name: 'Truffle Glazed Wagyu Ribeye',
    category: 'Fine Dining',
    price: 95,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    description: 'A5 Japanese Wagyu ribeye grilled over binchotan charcoal, finished with black winter truffle jus and smoked Maldon salt.'
  },
  {
    id: 'DISH-02',
    name: 'Wild Ocean Bluefin Tuna Tartare',
    category: 'Starters',
    price: 42,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
    description: 'Line-caught bluefin tuna tossed with avocado mousse, oscietra caviar, crisp shallots, and citrus ponzu.'
  },
  {
    id: 'DISH-03',
    name: 'Vintage Dom Pérignon Champagne Flute',
    category: 'Sommelier Drinks',
    price: 65,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    description: 'Chilled flute of Dom Pérignon Brut, served with organic strawberries and artisan dark chocolate truffles.'
  },
  {
    id: 'DISH-04',
    name: 'Royal Imperial Oscietra Caviar',
    category: 'Starters',
    price: 140,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    description: '50g Caspian Oscietra caviar served on crushed ice with mother-of-pearl spoon, warm blinis, and crème fraîche.'
  },
  {
    id: 'DISH-05',
    name: 'Pan-Seared Chilean Sea Bass',
    category: 'Fine Dining',
    price: 78,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    description: 'Sustainably caught Chilean sea bass pan-seared with saffron lemongrass broth, braised fennel, and sea asparagus.'
  },
  {
    id: 'DISH-06',
    name: 'Grand Marnier Soufflé & Espresso',
    category: 'Desserts',
    price: 34,
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=1200&q=80',
    description: 'Lightly baked orange liqueur soufflé accompanied by Tahitian vanilla bean anglaise and single-origin espresso.'
  }
];

const defaultSpaServices = [
  {
    id: 'SPA-01',
    title: 'Royal Mineral Hydrotherapy Massage',
    duration: '90 Min',
    price: 220,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    description: 'Deep tissue therapy combined with volcanic hot stone massage and mineral-infused thermal bath soak.'
  },
  {
    id: 'SPA-02',
    title: 'Aromatherapy Botanical Facial',
    duration: '60 Min',
    price: 160,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    description: 'Rejuvenating facial treatment using organic botanical serums, chilled quartz roller massage, and hydration mask.'
  }
];

const defaultReviews = [
  {
    id: 'REV-01',
    guestName: 'Lady Eleanor Vance',
    location: 'London, United Kingdom',
    rating: 5,
    comment: 'The Presidential Ocean Penthouse was pure perfection. The private butler service and sunset lagoon views set a new benchmark for luxury resorts worldwide.',
    date: 'August 2026'
  },
  {
    id: 'REV-02',
    guestName: 'Alexander Sterling',
    location: 'Zurich, Switzerland',
    rating: 5,
    comment: 'Unrivaled culinary experiences at Azure Restaurant. The Wagyu Ribeye and sommelier pairings were extraordinary beyond expectation.',
    date: 'July 2026'
  },
  {
    id: 'REV-03',
    guestName: 'Baroness Charlotte von Berg',
    location: 'Munich, Germany',
    rating: 5,
    comment: 'The Royal Hydrotherapy Pavilion provided absolute serenity. OmniStay represents the gold standard of international resort hospitality.',
    date: 'August 2026'
  },
  {
    id: 'REV-04',
    guestName: 'Harrison Ford-Smythe',
    location: 'New York, USA',
    rating: 5,
    comment: 'Seamless arrival via the superyacht helipad and immaculate overwater villa design. We will return every summer without question.',
    date: 'June 2026'
  }
];

class HotelDataStore {
  constructor() {
    this.listeners = new Set();
    this.data = {
      suites: defaultSuites,
      diningItems: defaultDiningItems,
      spaServices: defaultSpaServices,
      reviews: defaultReviews
    };

    this.syncWithBackendDatabase();
  }

  async syncWithBackendDatabase() {
    try {
      const roomMatrix = await apiFetch('/api/rooms/matrix').catch(() => null);
      if (roomMatrix && Array.isArray(roomMatrix) && roomMatrix.length > 0) {
        const syncedSuites = roomMatrix.map((r, i) => ({
          id: r.id || r.roomId || `SUITE-${i}`,
          title: `Suite ${r.roomNumber} - ${r.roomType || r.type || 'Deluxe'}`,
          category: r.roomType?.includes('Villa') ? 'VILLAS' : 'SUITES',
          price: r.dailyRate || (300 + (i * 80)),
          capacity: '2-4 Guests',
          size: `${90 + (i * 25)} sq.m`,
          image: defaultSuites[i % defaultSuites.length].image,
          description: r.description || defaultSuites[i % defaultSuites.length].description,
          amenities: defaultSuites[i % defaultSuites.length].amenities
        }));
        this.data.suites = syncedSuites;
        this.notify();
      }
    } catch (e) {
      console.warn("Backend database fetch fallback active:", e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  // --- Suite CRUD ---
  addSuite(suite) {
    const newSuite = { ...suite, id: `SUITE-${Date.now()}` };
    this.data.suites = [newSuite, ...this.data.suites];
    this.notify();
  }

  deleteSuite(id) {
    this.data.suites = this.data.suites.filter(s => s.id !== id);
    this.notify();
  }

  // --- Dining CRUD ---
  addDiningItem(item) {
    const newItem = { ...item, id: `DISH-${Date.now()}` };
    this.data.diningItems = [newItem, ...this.data.diningItems];
    this.notify();
  }

  deleteDiningItem(id) {
    this.data.diningItems = this.data.diningItems.filter(d => d.id !== id);
    this.notify();
  }

  // --- Spa CRUD ---
  addSpaService(service) {
    const newService = { ...service, id: `SPA-${Date.now()}` };
    this.data.spaServices = [newService, ...this.data.spaServices];
    this.notify();
  }

  deleteSpaService(id) {
    this.data.spaServices = this.data.spaServices.filter(s => s.id !== id);
    this.notify();
  }
}

export const hotelStore = new HotelDataStore();

export const useHotelData = () => {
  const [data, setData] = useState(hotelStore.data);

  useEffect(() => {
    const unsubscribe = hotelStore.subscribe((newData) => {
      setData({ ...newData });
    });
    return unsubscribe;
  }, []);

  return {
    suites: data.suites,
    diningItems: data.diningItems,
    spaServices: data.spaServices,
    reviews: data.reviews,

    addSuite: (s) => hotelStore.addSuite(s),
    deleteSuite: (id) => hotelStore.deleteSuite(id),
    addDiningItem: (d) => hotelStore.addDiningItem(d),
    deleteDiningItem: (id) => hotelStore.deleteDiningItem(id),
    addSpaService: (s) => hotelStore.addSpaService(s),
    deleteSpaService: (id) => hotelStore.deleteSpaService(id)
  };
};
