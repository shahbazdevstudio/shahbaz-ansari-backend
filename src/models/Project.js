import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    demo: { type: String, default: "", trim: true },
    github: { type: String, default: "", trim: true },
    tech: { type: [String], default: [] },
    category: { type: String, default: "", trim: true },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.index({ published: 1, order: 1, createdAt: 1 });

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
