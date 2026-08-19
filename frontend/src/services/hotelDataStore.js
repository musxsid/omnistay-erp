import { useState, useEffect } from 'react';
import { apiFetch } from './apiClient';

// 100% Unique High-Resolution Luxury Resort Dataset (Zero Duplicates, No Shampoo Images!)
const defaultSuites = [
  {
    id: 'SUITE-101',
    title: 'Presidential Ocean Penthouse',
    category: 'SUITES',
    price: 850,
    capacity: '4 Guests',
    size: '220 sq.m',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    description: 'Top-floor oceanfront penthouse suite featuring private infinity plunge pool, panoramic deck, marble bathroom, and 24/7 dedicated butler service.',
    amenities: ['Private Infinity Pool', 'Master Hydro Tub', '24/7 Butler Service', 'Executive Lounge Access']
  },
  {
    id: 'VILLA-204',
    title: 'Executive Sunset Lagoon Villa',
    category: 'VILLAS',
    price: 520,
    capacity: '2 Guests',
    size: '160 sq.m',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
    description: 'Overwater lagoon villa offering direct ocean staircase, private sunset deck, king feather bedding, and oceanfront dining.',
    amenities: ['Direct Lagoon Deck', 'Overwater Hammock', 'King Feather Bed', 'Personalized Mini Bar']
  },
  {
    id: 'DELUXE-308',
    title: 'Grand Deluxe King Suite',
    category: 'SUITES',
    price: 340,
    capacity: '2 Guests',
    size: '95 sq.m',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    description: 'Spacious deluxe king room with high-speed fiber internet, executive workstation, floor-to-ceiling glass, and marble bath.',
    amenities: ['High-Speed Wi-Fi', 'Executive Workstation', 'Marble Bathroom', 'Smart Suite Controls']
  },
  {
    id: 'SUITE-402',
    title: 'Royal Horizon Sanctuary',
    category: 'SUITES',
    price: 680,
    capacity: '3 Guests',
    size: '180 sq.m',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    description: 'Elevated corner sanctuary featuring floor-to-ceiling glass walls, private terrace with fire pit, and deep soaking tub.',
    amenities: ['Terrace Fire Pit', 'Deep Soaking Tub', 'Pillow Selection Menu', 'Private Wine Cellar']
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
