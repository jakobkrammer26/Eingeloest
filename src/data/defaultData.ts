import { FamilyProduct, ScanLog, FamilyOrder, TeamMember, Task, OKR } from '../types';

export const DEFAULT_PRODUCTS: FamilyProduct[] = [
  {
    barcode: '40084911',
    name: 'Ibuprofen 400mg ActiFast',
    description: 'Rapid pain relief and anti-inflammatory. Verified batch, 24 count box.',
    category: 'Medicines (FMD)',
    quantity: 3,
    unit: 'boxes',
    minStock: 2,
    isFavorite: true,
    expiryDate: '2027-12-31',
    serialNumber: 'SN-7734-9921',
  },
  {
    barcode: '50126723',
    name: 'Paracetamol 500mg Extra Strength',
    description: 'Paracetamol with caffeine booster. Effective fever reducer, 32 count.',
    category: 'Medicines (FMD)',
    quantity: 1,
    unit: 'boxes',
    minStock: 2,
    isFavorite: true,
    expiryDate: '2028-06-30',
    serialNumber: 'SN-1120-8349',
  },
  {
    barcode: '40084000',
    name: 'Nespresso Arpeggio Capsules',
    description: 'Dark roast, intense and creamy espresso coffee capsules. Intensity 9.',
    category: 'Beverages',
    quantity: 45,
    unit: 'pcs',
    minStock: 20,
    isFavorite: true,
  },
  {
    barcode: '03800020',
    name: 'Clif Bar Chocolate Chip',
    description: 'Organic rolled oats energy bars with premium chocolate chips. High energy snack.',
    category: 'Snacks',
    quantity: 12,
    unit: 'packs',
    minStock: 6,
    isFavorite: false,
  },
  {
    barcode: '12000000',
    name: 'San Pellegrino Sparkling Water 750ml',
    description: 'Natural mineral sparkling water bottled at source in San Pellegrino, Italy.',
    category: 'Drinks',
    quantity: 4,
    unit: 'bottles',
    minStock: 6,
    isFavorite: true,
  },
  {
    barcode: '40256000',
    name: 'Vitamin C 1000mg + Zinc',
    description: 'Immune system booster effervescent tablets. Orange flavor, 20 count.',
    category: 'Medicines (FMD)',
    quantity: 2,
    unit: 'tubes',
    minStock: 1,
    isFavorite: false,
    expiryDate: '2027-03-15',
    serialNumber: 'SN-4491-0329',
  }
];

export const DEFAULT_SCAN_LOGS: ScanLog[] = [
  {
    id: 'SL-9932',
    timestamp: '2026-06-26 11:45:12',
    barcode: '40084911',
    productName: 'Ibuprofen 400mg ActiFast',
    type: 'CHECK_IN',
    quantityChange: 1,
    status: 'SUCCESS',
    message: 'Added 1 box to main medicine cabinet. Expiry date validated (2027-12-31).'
  },
  {
    id: 'SL-9931',
    timestamp: '2026-06-26 09:12:05',
    barcode: '50126723',
    productName: 'Paracetamol 500mg Extra Strength',
    type: 'VERIFY',
    quantityChange: 0,
    status: 'SUCCESS',
    message: 'FMD authenticity check: Active product registered in national system.'
  },
  {
    id: 'SL-9930',
    timestamp: '2026-06-25 18:30:22',
    barcode: '40084000',
    productName: 'Nespresso Arpeggio Capsules',
    type: 'CHECK_OUT',
    quantityChange: -5,
    status: 'SUCCESS',
    message: 'Consumed 5 capsules. Stock reduced to 45.'
  },
  {
    id: 'SL-9929',
    timestamp: '2026-06-25 14:02:11',
    barcode: '12000000',
    productName: 'San Pellegrino Sparkling Water 750ml',
    type: 'CHECK_OUT',
    quantityChange: -2,
    status: 'WARNING',
    message: 'Stock reduced to 4. Warning: Stock fell below target minimum (6).'
  }
];

export const DEFAULT_ORDERS: FamilyOrder[] = [
  {
    id: 'FO-101',
    date: '2026-06-25',
    status: 'PENDING',
    items: [
      {
        barcode: '12000000',
        productName: 'San Pellegrino Sparkling Water 750ml',
        quantityNeeded: 6,
        unit: 'bottles'
      },
      {
        barcode: '50126723',
        productName: 'Paracetamol 500mg Extra Strength',
        quantityNeeded: 2,
        unit: 'boxes'
      }
    ],
    notes: 'Regular household reorder. Need sparkling water before next family dinner.'
  }
];

// BACKWARD COMPATIBLE SYSTEM DEFAULTS
export const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'TM-1',
    name: 'Helena Vance',
    role: 'VP of Product Operations',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    email: 'helena@global.inc'
  },
  {
    id: 'TM-2',
    name: 'Marcus Chen',
    role: 'Lead Systems Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    email: 'marcus@global.inc'
  },
  {
    id: 'TM-3',
    name: 'Sarah Jenkins',
    role: 'Director of HR Operations',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    email: 'sarah@global.inc'
  }
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'TSK-1',
    title: 'Audit FMD Cryptographic Seals',
    description: 'Scan and verify medicine serial numbers across the primary inventory registry.',
    priority: 'high',
    stage: 'todo',
    dueDate: '2026-06-30'
  },
  {
    id: 'TSK-2',
    title: 'Review Expiration Date Warnings',
    description: 'Ensure automated scan logs warn correctly on out-of-date medicines.',
    priority: 'medium',
    stage: 'progress',
    dueDate: '2026-07-02'
  }
];

export const DEFAULT_OKRS: OKR[] = [
  {
    id: 'OKR-1',
    title: 'Achieve 100% compliant medicine distribution ledger checks',
    progress: 85
  },
  {
    id: 'OKR-2',
    title: 'Rollout automated local reordering aggregator for stock',
    progress: 90
  }
];
