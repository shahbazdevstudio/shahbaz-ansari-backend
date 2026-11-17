import Testimonial from "../models/Testimonial.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { deleteImage } from "../utils/cloudinaryHelpers.js";

const FIELDS = [
  "name", "title", "message", "rating", "platform", "profilePic",
  "profilePicPublicId", "reviewDate", "published", "order",
];

const pick = (body) => {
  const out = {};
  for (const k of FIELDS) if (body[k] !== undefined) out[k] = body[k];
  if (out.reviewDate === "") delete out.reviewDate;
  return out;
};

const toPublic = (t) => ({
  _id: t._id,
  name: t.name,
  title: t.title,
  message: t.message,
  rating: t.rating,
  platform: t.platform,
  profilePic: t.profilePic,
  createdAt: t.reviewDate || t.createdAt,
});

export const getTestimonials = asyncHandler(async (_req, res) => {
  const items = await Testimonial.find({ published: true })
    .sort({ order: 1, reviewDate: -1 })
    .lean();
  res.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  res.json({ success: true, data: items.map(toPublic) });
});

export const getAllTestimonials = asyncHandler(async (_req, res) => {
  const data = await Testimonial.find().sort({ order: 1, reviewDate: -1 }).lean();
  res.json({ success: true, data });
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const body = pick(req.body);
  if (body.order === undefined) {
    const last = await Testimonial.findOne().sort({ order: -1 }).select("order").lean();
    body.order = last ? last.order + 1 : 0;
  }
  const item = await Testimonial.create(body);
  res.status(201).json({ success: true, data: item });
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findById(req.params.id);
  if (!item) throw new HttpError(404, "Testimonial not found");

  const body = pick(req.body);
  if (body.profilePic !== undefined && body.profilePic !== item.profilePic) {
    await deleteImage(item.profilePicPublicId);
    if (body.profilePicPublicId === undefined) body.profilePicPublicId = "";
  }
  Object.assign(item, body);
  await item.save();
  res.json({ success: true, data: item });
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndDelete(req.params.id);
  if (!item) throw new HttpError(404, "Testimonial not found");
  await deleteImage(item.profilePicPublicId);
  res.json({ success: true });
});
