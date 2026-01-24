
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
  clientId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryMethod: 'ENTREGA' | 'RETIRADA';
  deliveryFee?: number;
  status: 'PENDENTE' | 'PREPARANDO' | 'ENTREGUE' | 'CANCELADO';
  total: number;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  createdAt: string;
}
