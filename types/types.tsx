export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  dueDate: Date;
  paidAt?: Date;
  status: "paid" | "pending" | "overdue";
  paymentLink: string;
  merchantId: string;
  merchantName: string;
  merchantAddress: `0x${string}`;
}

export interface Flag {
  img: string;
  emoji: string;
}

export interface CurrencyData {
  code: string;
  flag: Flag | null;
}

export interface GeoData {
  flag: Flag | null;
  countryCode: string;
  isLoading: boolean;
}

export interface IpApiResponse {
  status: string;
  country: string;
  countryCode: string;
  currency: string;
  query: string;
}

