import type { Product } from './types';

export const catalogFallback: Product[] = [
  {
    id: 'SKU-1001',
    title: 'Aurora Wireless Headphones',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=480&q=80',
    tags: ['audio', 'wireless', 'featured'],
    stockQty: 42,
    description:
      'Noise-cancelling over-ear headphones with spatial audio and 24-hour battery life.',
  },
  {
    id: 'SKU-1002',
    title: 'Flux Mechanical Keyboard',
    price: 89.5,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=480&q=80',
    tags: ['keyboard', 'peripherals'],
    stockQty: 63,
    description:
      'Hot-swappable mechanical keyboard with per-key RGB lighting and tactile switches.',
  },
  {
    id: 'SKU-1003',
    title: 'Helio 27" 4K Monitor',
    price: 329.0,
    image: 'data:image/jpeg;base64,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',
    tags: ['display', '4k'],
    stockQty: 17,
    description:
      'Crystal-clear 27-inch 4K IPS monitor with 144Hz refresh rate and HDR10 support.',
  },
  {
    id: 'SKU-1004',
    title: 'Nimbus Smartwatch',
    price: 199.99,
    image: 'https://picsum.photos/seed/nimbuswatch/480/480',
    tags: ['wearables', 'fitness'],
    stockQty: 55,
    description:
      'Lightweight smartwatch with ECG, GPS, and 7-day battery life.',
  },
  {
    id: 'SKU-1005',
    title: 'Solstice Portable Speaker',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1490376840453-5f616fbebe5b?auto=format&fit=crop&w=480&q=80',
    tags: ['audio', 'portable'],
    stockQty: 120,
    description:
      'Water-resistant Bluetooth speaker with 360° sound and 12-hour playback.',
  },
  {
    id: 'SKU-1006',
    title: 'EchoGlass AR Lenses',
    price: 249.0,
    image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=480&q=80',
    tags: ['wearables', 'ar'],
    stockQty: 24,
    description:
      'Augmented reality glasses with adaptive dimming and voice control.',
  },
  {
    id: 'SKU-1007',
    title: 'Pulse Fitness Tracker',
    price: 49.0,
    image: 'data:image/jpeg;base64,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',
    tags: ['fitness', 'wearables'],
    stockQty: 214,
    description:
      'Slim fitness band with sleep tracking, heart rate sensor, and stress detection.',
  },
  {
    id: 'SKU-1008',
    title: 'Zenbook Laptop Stand',
    price: 39.99,
    image: 'data:image/jpeg;base64,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',
    tags: ['accessories', 'workspace'],
    stockQty: 88,
    description:
      'Adjustable aluminum laptop stand with integrated cable management.',
  },
  {
    id: 'SKU-1009',
    title: 'Lumen Desk Lamp',
    price: 74.99,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=480&q=80',
    tags: ['lighting', 'workspace'],
    stockQty: 130,
    description:
      'Smart LED desk lamp with adaptive brightness and Qi wireless charging base.',
  },
  {
    id: 'SKU-1010',
    title: 'Orbit USB-C Hub',
    price: 54.5,
    image: 'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=480&q=80',
    tags: ['peripherals', 'usb-c'],
    stockQty: 140,
    description:
      '7-in-1 USB-C hub with dual HDMI, SD reader, and PD pass-through charging.',
  },
  {
    id: 'SKU-1011',
    title: 'PulseBeat Action Camera',
    price: 219.99,
    image: 'https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?auto=format&fit=crop&w=480&q=80',
    tags: ['camera', 'outdoors'],
    stockQty: 35,
    description:
      'Waterproof 5K action camera with stabilization and voice commands.',
  },
  {
    id: 'SKU-1012',
    title: 'Mira Drone Mini',
    price: 159.99,
    image: 'https://picsum.photos/seed/miradrone/480/480',
    tags: ['drone', 'outdoors'],
    stockQty: 48,
    description:
      'Foldable mini drone with 30-minute flight time and 4K camera.',
  },
  {
    id: 'SKU-1013',
    title: 'Nebula Smart Projector',
    price: 289.99,
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=480&q=80',
    tags: ['projector', 'home'],
    stockQty: 28,
    description:
      'Compact smart projector with 1080p resolution and auto-keystone correction.',
  },
  {
    id: 'SKU-1014',
    title: 'Aria Noise Buds',
    price: 99.99,
    image: 'https://picsum.photos/seed/arianoise/480/480',
    tags: ['audio', 'wireless'],
    stockQty: 200,
    description:
      'True wireless earbuds with adaptive ANC and wireless charging case.',
  },
  {
    id: 'SKU-1015',
    title: 'Coda Studio Mic',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=480&q=80',
    tags: ['audio', 'creators'],
    stockQty: 75,
    description:
      'USB-C condenser microphone with cardioid pattern and live monitoring.',
  },
  {
    id: 'SKU-1016',
    title: 'Atlas Portable SSD 1TB',
    price: 139.49,
    image: 'https://picsum.photos/seed/atlassign/480/480',
    tags: ['storage', 'portable'],
    stockQty: 112,
    description:
      'Rugged NVMe SSD with 1TB storage and 1,000 MB/s transfers.',
  },
  {
    id: 'SKU-1017',
    title: 'Voyager Travel Backpack',
    price: 119.0,
    image: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=480&q=80',
    tags: ['travel', 'bags'],
    stockQty: 90,
    description:
      'Carry-on approved travel backpack with modular packing cubes.',
  },
  {
    id: 'SKU-1018',
    title: 'Spark Smart Mug',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1523365280197-f1783db9fe62?auto=format&fit=crop&w=480&q=80',
    tags: ['home', 'smart'],
    stockQty: 150,
    description:
      'Temperature-controlled mug with auto-sleep and mobile app presets.',
  },
  {
    id: 'SKU-1019',
    title: 'Pulse Mat Standing Desk',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=480&q=80',
    tags: ['workspace', 'fitness'],
    stockQty: 65,
    description:
      'Anti-fatigue standing desk mat with balance ramps and massage nodes.',
  },
  {
    id: 'SKU-1020',
    title: 'Nimbus Smart Frame',
    price: 129.0,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=480&q=80',
    tags: ['home', 'smart'],
    stockQty: 47,
    description:
      'Wi-Fi photo frame with ambient light sensor and shared album support.',
  }
];
