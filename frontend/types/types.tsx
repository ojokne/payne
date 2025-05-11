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
