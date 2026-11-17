import fs from "node:fs";
import Project from "../models/Project.js";
import Testimonial from "../models/Testimonial.js";

const data = JSON.parse(
  fs.readFileSync(new URL("../seed/data.json", import.meta.url), "utf8")
);

/** Imports the content that was originally hard-coded on the website. Only fills EMPTY collections. */
export async function importDefaults() {
  const result = { projects: 0, testimonials: 0 };
  if ((await Project.countDocuments()) === 0) {
    await Project.insertMany(data.projects);
    result.projects = data.projects.length;
  }
  if ((await Testimonial.countDocuments()) === 0) {
    await Testimonial.insertMany(data.testimonials);
    result.testimonials = data.testimonials.length;
  }
  return result;
}
