export interface FamilyProduct {
  barcode: string; // unique ID / barcode
  name: string;
  description: string;
  category: string; // 'Medicine' | 'Groceries' | 'Household' | 'Beverages' | 'Personal Care' | string
  quantity: number;
  unit: string; // 'pcs' | 'boxes' | 'bottles' | 'packs'
  minStock: number; // for reorder alerts
  isFavorite: boolean;
  image?: string;
  lastScanned?: string;
  expiryDate?: string; // especially for FMD/medicine verification
  serialNumber?: string; // FMD tracking
}

export interface ScanLog {
  id: string;
  timestamp: string;
  barcode: string;
  productName: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'VERIFY' | 'DECOMMISSION';
  quantityChange: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  message: string;
}

export interface FamilyOrder {
  id: string;
  date: string;
  status: 'PENDING' | 'ORDERED' | 'RECEIVED';
  items: {
    barcode: string;
    productName: string;
    quantityNeeded: number;
    unit: string;
  }[];
  notes?: string;
}

// RESTORED TYPES WITH FULL BACKWARD COMPATIBILITY
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  stage: 'todo' | 'in_progress' | 'progress' | 'review' | 'done';
  dueDate: string;
  assigneeId?: string;
  checklist?: { id: string; text: string; done: boolean }[];
  tags?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
  department?: string;
}

export interface OKR {
  id: string;
  title?: string;
  progress: number;
  ownerId?: string;
  objective?: string;
  keyResults?: { id: string; text: string; progress: number; current?: number; target?: number; unit?: string }[];
  department?: string;
}

export interface CorporateAsset {
  id: string;
  name: string;
  type: 'room' | 'hardware' | 'vehicle' | string;
  status: 'available' | 'reserved' | string;
  description?: string;
  location?: string;
}

export interface Booking {
  id: string;
  assetId: string;
  userId?: string;
  date: string;
  timeSlot?: string;
  bookedBy?: string;
  purpose?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated?: string;
  author?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
