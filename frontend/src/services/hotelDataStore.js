import { useState, useEffect } from 'react';
import { apiFetch } from './apiClient';

// Fallback initial dataset (used only if backend API is initializing)
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
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
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
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
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
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Spacious deluxe king room with high-speed fiber internet, executive workstation, floor-to-ceiling glass, and marble bath.',
    amenities: ['High-Speed Wi-Fi', 'Executive Workstation', 'Marble Bathroom', 'Smart Suite Controls']
  }
];

const defaultDiningItems = [
  {
    id: 'DISH-01',
    name: 'Truffle Glazed Wagyu Ribeye',
    category: 'Fine Dining',
    price: 95,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    description: 'A5 Japanese Wagyu ribeye grilled over binchotan charcoal, finished with black winter truffle jus.'
  },
  {
    id: 'DISH-02',
    name: 'Wild Ocean Bluefin Tuna Tartare',
    category: 'Starters',
    price: 42,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
    description: 'Line-caught bluefin tuna tossed with avocado mousse, oscietra caviar, crisp shallots, and citrus ponzu.'
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
  }
];

const defaultReviews = [
  {
    id: 'REV-01',
    guestName: 'Lady Eleanor Vance',
    location: 'London, United Kingdom',
    rating: 5,
    comment: 'The Presidential Ocean Penthouse was pure perfection. The private butler service and sunset lagoon views set a new benchmark.',
    date: 'August 2026'
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

    this.syncWithPostgresDatabase();
  }

  async syncWithPostgresDatabase() {
    try {
      const suitesFromDb = await apiFetch('/api/suites').catch(() => null);
      if (suitesFromDb && Array.isArray(suitesFromDb) && suitesFromDb.length > 0) {
        this.data.suites = suitesFromDb;
      }

      const diningFromDb = await apiFetch('/api/dining').catch(() => null);
      if (diningFromDb && Array.isArray(diningFromDb) && diningFromDb.length > 0) {
        this.data.diningItems = diningFromDb;
      }

      const spaFromDb = await apiFetch('/api/spa').catch(() => null);
      if (spaFromDb && Array.isArray(spaFromDb) && spaFromDb.length > 0) {
        this.data.spaServices = spaFromDb;
      }

      this.notify();
    } catch (e) {
      console.warn("PostgreSQL database fetch fallback active:", e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  addSuite(suite) {
    const newSuite = { ...suite, id: `SUITE-${Date.now()}` };
    this.data.suites = [newSuite, ...this.data.suites];
    this.notify();
  }

  deleteSuite(id) {
    this.data.suites = this.data.suites.filter(s => s.id !== id);
    this.notify();
  }

  addDiningItem(item) {
    const newItem = { ...item, id: `DISH-${Date.now()}` };
    this.data.diningItems = [newItem, ...this.data.diningItems];
    this.notify();
  }

  deleteDiningItem(id) {
    this.data.diningItems = this.data.diningItems.filter(d => d.id !== id);
    this.notify();
  }

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
