import api from "./api";

export const getActivities = () =>
  api.get("/activity");