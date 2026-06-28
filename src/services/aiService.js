import api from "./api";

export const suggestEstimate = (title, description) =>
  api.post("/ai/suggest", { title, description });