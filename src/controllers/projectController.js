import Project from "../models/Project.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { deleteImage } from "../utils/cloudinaryHelpers.js";

const FIELDS = [
  "title", "description", "image", "imagePublicId", "demo", "github",
  "tech", "category", "published", "order",
];

const pick = (body) => {
  const out = {};
  for (const k of FIELDS) if (body[k] !== undefined) out[k] = body[k];
  if (typeof out.tech === "string") {
    out.tech = out.tech.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return out;
};

// Shape expected by the existing frontend cards (`id` = "01", "02" …)
const toPublic = (p, i) => ({
  _id: p._id,
  id: String(i + 1).padStart(2, "0"),
  title: p.title,
  description: p.description,
  image: p.image,
  demo: p.demo,
  github: p.github,
  tech: p.tech,
  category: p.category,
});

export const getProjects = asyncHandler(async (_req, res) => {
  const projects = await Project.find({ published: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  res.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  res.json({ success: true, data: projects.map(toPublic) });
});

export const getAllProjects = asyncHandler(async (_req, res) => {
  const data = await Project.find().sort({ order: 1, createdAt: 1 }).lean();
  res.json({ success: true, data });
});

export const createProject = asyncHandler(async (req, res) => {
  const body = pick(req.body);
  if (body.order === undefined) {
    const last = await Project.findOne().sort({ order: -1 }).select("order").lean();
    body.order = last ? last.order + 1 : 0;
  }
  const project = await Project.create(body);
  res.status(201).json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new HttpError(404, "Project not found");

  const body = pick(req.body);
  // Replaced image → remove the old one from Cloudinary
  if (body.image !== undefined && body.image !== project.image) {
    await deleteImage(project.imagePublicId);
    if (body.imagePublicId === undefined) body.imagePublicId = "";
  }
  Object.assign(project, body);
  await project.save();
  res.json({ success: true, data: project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw new HttpError(404, "Project not found");
  await deleteImage(project.imagePublicId);
  res.json({ success: true });
});

// Body: { ids: ["id1","id2",...] } in the new display order
export const reorderProjects = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) throw new HttpError(400, "ids must be an array");
  await Project.bulkWrite(
    ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { order: i } } }))
  );
  res.json({ success: true });
});
