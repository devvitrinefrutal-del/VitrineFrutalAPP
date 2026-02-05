
export type UserRole = 'DEV' | 'LOJISTA' | 'PRESTADOR' | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  document?: string; // CPF or CNPJ
  address?: string;
  storeId?: string;
  serviceId?: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  image: string;
  images?: string[];
  address: string;
  rating: number;
  whatsapp: string;
  email: string;
  cnpj: string;
  deliveryFee?: number;
  neighborhood?: string;
  hasDelivery?: boolean;
  latitude?: number;
  longitude?: number;
  dailyRevenueAdj?: number;
  monthlyRevenueAdj?: number;
  isActive?: boolean;
  lastFinanceUpdate?: string; // ISO Date para controle de resets
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  images?: string[];
  stock: number;
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  type: string;
  description: string;
  priceEstimate: string;
  image: string;
  images?: string[];
  whatsapp: string;
  address: string;
  email?: string; // Added for provider login/contact
  cnpj_cpf?: string;
}

export interface CulturalItem {
  id: string;
  title: string;
  type: string;
  description: string;
  date: string;
  image: string;
  images?: string[];
}


export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryMethod: 'ENTREGA' | 'RETIRADA';
  deliveryFee?: number;
  status: 'PENDENTE' | 'PREPARANDO' | 'EM_ROTA' | 'ENTREGUE' | 'CANCELADO';
  dispatchedAt?: string; // Timestamp quando saiu para entrega
  total: number;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod?: string;
  observation?: string;
  createdAt: string;
}

export interface StoreRating {
  id: string;
  storeId: string;
  orderId: string;
  customerId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}
