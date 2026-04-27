import mongoose, { Document, Schema } from "mongoose";

interface IRubric {
  criteria: string;
  maxMarks: number;
}

export interface IAssignmentModel extends Document {
  title: string;
  subject: string;
  dueDate: Date;
  rubric: IRubric[];
  templateName?: string;
}

const RubricSchema = new Schema<IRubric>(
  {
    criteria: { type: String, required: true },
    maxMarks: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignmentModel>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    rubric: { type: [RubricSchema], default: [] },
    templateName: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IAssignmentModel>("Assignment", AssignmentSchema);
