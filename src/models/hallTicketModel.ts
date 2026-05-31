import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHallTicket extends Document {
  candidateName: string;
  dateOfBirth: string;
  course: string;
  courseDuration: string;
  examinationCentre: string;
  examinationDate: string;
  examinationTime: string;
  examinationTestCode: string;
  rollNumber: string;
  photoData: string;
  status: string;
  createdAt: Date;
}

const hallTicketSchema = new Schema<IHallTicket>(
  {
    candidateName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    course: { type: String, required: true },
    courseDuration: { type: String, required: true },
    examinationCentre: { type: String, required: true },
    examinationDate: { type: String, required: true },
    examinationTime: { type: String, required: true },
    examinationTestCode: { type: String, required: true },
    rollNumber: { type: String, required: true },
    photoData: { type: String, default: "" },
    status: { type: String, default: "Hall Ticket Generated" },
  },
  { timestamps: true }
);

const HallTicket: Model<IHallTicket> =
  mongoose.models.HallTicket || mongoose.model<IHallTicket>("HallTicket", hallTicketSchema);

export default HallTicket;
