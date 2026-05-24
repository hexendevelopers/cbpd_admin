import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInvoiceItem {
  key: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
}

export interface IInvoice extends Document {
  billTo: string;
  invoiceDate: string;
  accountNumber: string;
  invoiceNumber: string;
  reference: string;
  items: IInvoiceItem[];
  bankDetails: string;
  amountDue: number;
  subtotal: number;
  totalVat: number;
  totalGBP: number;
  createdAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
  key: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  vat: { type: Number, required: true },
});

const invoiceSchema = new Schema<IInvoice>(
  {
    billTo: { type: String, required: true },
    invoiceDate: { type: String, required: true },
    accountNumber: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    reference: { type: String, required: true },
    items: [invoiceItemSchema],
    bankDetails: { type: String, required: true },
    amountDue: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    totalVat: { type: Number, required: true },
    totalGBP: { type: Number, required: true },
  },
  { timestamps: true }
);

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", invoiceSchema);

export default Invoice;
