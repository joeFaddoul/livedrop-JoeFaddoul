export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  tags: string[];
  stockQty: number;
  description: string;
};

export type CartLineItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Delivered';

export type OrderStatusRecord = {
  _id?: string;
  orderId: string;
  status: OrderStatus;
  carrier?: string;
  eta?: string;
  updatedAt: string;
  history?: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
};

export type SupportQA = {
  qid: string;
  category: string;
  question: string;
  answer: string;
};

export type SupportMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citedQid?: string;
};

export type CustomerProfile = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  preferences?: {
    favoriteCategories?: string[];
    locale?: string;
  };
};

export type CustomerLookupResponse = {
  customer: CustomerProfile;
  recentOrders: Array<{
    _id: string;
    orderId: string;
    status: OrderStatus;
    total: number;
    currency?: string;
    createdAt: string;
  }>;
};

export type OrderStatusEvent =
  | {
      type: 'snapshot';
      order: OrderStatusRecord;
    }
  | {
      type: 'update';
      order: OrderStatusRecord;
    }
  | {
      type: 'error';
      message: string;
    };

export type DashboardMetrics = {
  latestOrders: Array<{
    _id: string;
    email: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    stock: number;
  }>;
  assistantSummary: Array<{
    _id: string;
    total: number;
    successRate: number;
  }>;
  activeCustomers: number;
  totalCustomers: number;
  revenue?: number;
  orders?: number;
  averageOrderValue?: number;
  performance?: {
    uptimeSeconds: number;
    assistantRequests30d: number;
    assistantAvgLatencyMs: number;
    activeSseConnections: number;
    sampledWindowDays: number;
  };
};

export type AssistantInvocation = {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
};

export type AssistantReply = {
  intent: string;
  confidence: number;
  answer: string;
  citations: string[];
  invocations: AssistantInvocation[];
  policies: Array<{ qid: string; question: string }>;
  citationReport?: {
    isValid: boolean;
    citedCitations: string[];
    validCitations: string[];
    invalidCitations: string[];
  };
};

export type DailyRevenuePoint = {
  date: string;
  revenue: number;
  orderCount: number;
};
