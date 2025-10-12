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
  orderId: string;
  status: OrderStatus;
  carrier?: string;
  eta?: string;
  updatedAt: string;
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
