import { useState, useEffect } from 'react';
import { apiFetch } from './apiClient';

// Full luxury resort catalog dataset
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
  },
  {
    id: 'VILLA-104',
    title: 'Royal Overwater Pavilion',
    category: 'VILLAS',
    price: 980,
    capacity: '6 Guests',
    size: '310 sq.m',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Ultra-exclusive 3-bedroom overwater pavilion with private glass floor salon, infinity pool, and personal chef service.',
    amenities: ['Glass Floor Viewing', 'Private Chef Service', 'Helipad Access', 'Infinity Pool']
  },
  {
    id: 'VILLA-105',
    title: 'Imperial Horizon Pool Villa',
    category: 'VILLAS',
    price: 750,
    capacity: '4 Guests',
    size: '240 sq.m',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Secluded cliffside villa with panoramic sea views, private heated infinity pool, and open-air rainfall outdoor shower.',
    amenities: ['Cliffside Sea View', 'Heated Infinity Pool', 'Outdoor Rain Shower', '24/7 Butler Service']
  },
  {
    id: 'SUITE-106',
    title: 'Oceanfront Sanctuary Residence',
    category: 'SUITES',
    price: 1200,
    capacity: '8 Guests',
    size: '450 sq.m',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Flagship beachfront compound featuring private garden, 20m lap pool, spa treatment room, and dedicated chauffeur service.',
    amenities: ['Private Beach Garden', '20m Lap Pool', 'Private Spa Room', 'Luxury Chauffeur Service']
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
    name: 'Pan-Seared Chilean Sea Bass',
    category: 'Chef Signature',
    price: 88,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    description: 'Wild-caught sea bass served over saffron risotto, braised baby fennel, and caviar butter emulsion.'
  },
  {
    id: 'DISH-05',
    name: 'Heirloom Burrata & Golden Beet Salad',
    category: 'Starters',
    price: 34,
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb23659?auto=format&fit=crop&w=1200&q=80',
    description: 'Creamy Apulian burrata, roasted golden beets, aged Modena balsamic reduction, and candied pistachios.'
  },
  {
    id: 'DISH-06',
    name: 'Valrhona Chocolate Grand Soufflé',
    category: 'Desserts',
    price: 28,
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=1200&q=80',
    description: 'Warm 70% dark chocolate soufflé served with Tahitian vanilla bean gelato and 24K edible gold leaf.'
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
  },
  {
    id: 'SPA-03',
    title: 'Himalayan Pink Salt Scrub & Detox',
    duration: '75 Min',
    price: 195,
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
    description: 'Full body exfoliation with hand-mined pink salt crystals, followed by nourishing essential oil wrap.'
  },
  {
    id: 'SPA-04',
    title: 'Couples Sunset Lagoon Ritual',
    duration: '120 Min',
    price: 420,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    description: 'Overwater cabana massage for two featuring champagne, rose bath soak, and personalized body oils.'
  },
  {
    id: 'SPA-05',
    title: 'Balinese Deep Tissue Reflexology',
    duration: '60 Min',
    price: 145,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
    description: 'Acupressure techniques combined with warm herbal compresses to relieve muscle tension and stress.'
  },
  {
    id: 'SPA-06',
    title: 'Gold Leaf Anti-Aging Body Wrap',
    duration: '90 Min',
    price: 280,
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80',
    description: 'Luxurious 24K gold infused serum wrap with head-to-toe lymphatic drainage massage.'
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
  },
  {
    id: 'REV-02',
    guestName: 'Alexander Sterling',
    location: 'Zurich, Switzerland',
    rating: 5,
    comment: 'Unrivaled culinary experiences at Azure Restaurant. The Wagyu Ribeye and sommelier pairings were extraordinary.',
    date: 'July 2026'
  },
  {
    id: 'REV-03',
    guestName: 'Dr. Sophia Chen',
    location: 'Tokyo, Japan',
    rating: 5,
    comment: 'The Hydrotherapy Pavilion is world-class. Absolute tranquility and flawless hospitality throughout our entire stay.',
    date: 'August 2026'
  },
  {
    id: 'REV-04',
    guestName: 'Marcus & Elena Vane',
    location: 'New York, USA',
    rating: 5,
    comment: 'Arriving by private yacht and staying at the Sunset Lagoon Villa was an unforgettable dream. 10/10 service excellence.',
    date: 'August 2026'
  },
  {
    id: 'REV-05',
    guestName: 'Sheikh Hamdan Al-Maktoum',
    location: 'Dubai, UAE',
    rating: 5,
    comment: 'OmniStay sets the standard for ultra-luxury resorts worldwide. Immaculate attention to privacy and personalized concierge detail.',
    date: 'June 2026'
  },
  {
    id: 'REV-06',
    guestName: 'Claire de la Tour',
    location: 'Paris, France',
    rating: 5,
    comment: 'Sensational spa therapies and exquisite beachfront dining under the stars. We are already booking our return stay for next summer!',
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

      const reviewsFromDb = await apiFetch('/api/reviews').catch(() => null);
      if (reviewsFromDb && Array.isArray(reviewsFromDb) && reviewsFromDb.length > 0) {
        this.data.reviews = reviewsFromDb.map(r => ({
          id: r.id,
          guestName: r.guestName,
          location: r.location,
          rating: r.rating,
          comment: r.comment,
          date: r.reviewDate
        }));
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
