import { env } from "../config/env.js";
import Project from "../models/Project.js";
import Testimonial from "../models/Testimonial.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about-me", changefreq: "monthly", priority: "0.9" },
  { path: "/services", changefreq: "monthly", priority: "0.9" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/testimonials", changefreq: "weekly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
];

// Dynamic sitemap: <lastmod> follows the latest content edit made in the admin panel.
export const sitemap = asyncHandler(async (_req, res) => {
  const [p, t] = await Promise.all([
    Project.findOne().sort({ updatedAt: -1 }).select("updatedAt").lean(),
    Testimonial.findOne().sort({ updatedAt: -1 }).select("updatedAt").lean(),
  ]);
  const day = (d) => (d ? new Date(d) : new Date()).toISOString().slice(0, 10);
  const lastmod = {
    "/projects": day(p?.updatedAt),
    "/testimonials": day(t?.updatedAt),
    "/": day(Math.max(p?.updatedAt || 0, t?.updatedAt || 0) || undefined),
  };
  const urls = PAGES.map(
    (pg) => `  <url>
    <loc>${env.siteUrl}${pg.path === "/" ? "" : pg.path}</loc>
    <lastmod>${lastmod[pg.path] || day()}</lastmod>
    <changefreq>${pg.changefreq}</changefreq>
    <priority>${pg.priority}</priority>
  </url>`
  ).join("\n");

  res.set("Content-Type", "application/xml");
  res.set("Cache-Control", "public, s-maxage=3600");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
});

// Aggregated stats used for Review structured data (JSON-LD) on the frontend.
export const reviewStats = asyncHandler(async (_req, res) => {
  const [agg] = await Testimonial.aggregate([
    { $match: { published: true } },
    { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: "$rating" } } },
  ]);
  res.set("Cache-Control", "public, s-maxage=300");
  res.json({
    success: true,
    count: agg?.count || 0,
    average: agg ? Math.round(agg.avg * 10) / 10 : 0,
  });
});
