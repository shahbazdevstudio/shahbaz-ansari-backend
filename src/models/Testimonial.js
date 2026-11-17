import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    title: { type: String, default: "", trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1200 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    platform: {
      type: String,
      enum: ["google", "fiverr", "upwork", "linkedin", "direct"],
      default: "direct",
    },
    profilePic: { type: String, default: "" },
    profilePicPublicId: { type: String, default: "" },
    reviewDate: { type: Date, default: Date.now },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.index({ published: 1, reviewDate: -1 });

export default mongoose.models.Testimonial ||
  mongoose.model("Testimonial", testimonialSchema);
