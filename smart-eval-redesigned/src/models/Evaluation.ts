import mongoose, { Document, Schema } from "mongoose";

interface IMark {
  criteria: string;
  awardedMarks: number;
  maxMarks: number;
}

export interface IEvaluationModel extends Document {
  studentId: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  subject: string;
  marks: IMark[];
  totalMarks: number;
  grade: string;
  feedback: string;
}

const MarkSchema = new Schema<IMark>(
  {
    criteria: { type: String, required: true },
    awardedMarks: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const EvaluationSchema = new Schema<IEvaluationModel>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    subject: { type: String, required: true },
    marks: { type: [MarkSchema], default: [] },
    totalMarks: { type: Number, required: true, min: 0 },
    grade: { type: String, required: true },
    feedback: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model<IEvaluationModel>("Evaluation", EvaluationSchema);
