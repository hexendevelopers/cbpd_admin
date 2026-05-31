import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuestion {
  text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
}

export interface IModule {
  title: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  courseCode: string;
  examinationTerm: string;
  courseName: string;
  time: string;
  marks: string;
  modules: IModule[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true },
  }
});

const ModuleSchema = new Schema<IModule>({
  title: { type: String, required: true },
  questions: [QuestionSchema]
});

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    courseCode: { type: String, required: true },
    examinationTerm: { type: String, required: true },
    courseName: { type: String, required: true },
    time: { type: String, required: true },
    marks: { type: String, required: true },
    modules: [ModuleSchema]
  },
  {
    timestamps: true,
  }
);

const QuestionPaper: Model<IQuestionPaper> =
  mongoose.models.QuestionPaper || mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);

export default QuestionPaper;
