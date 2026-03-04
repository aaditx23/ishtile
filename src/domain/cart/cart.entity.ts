export interface CartItem {
  id: number;
  variantId: number;
  quantity: number;
  productName: string;
  variantSize: string;
  variantColor: string | null;
  variantSku: string;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
  availableStock: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}
