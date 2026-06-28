import api from "./api";

import axios from "axios";

const API =
  `${import.meta.env.VITE_API_URL || "https://task.sawaitechsolutions.com"}/api/users`;

export const getUsers = () => {
  return axios.get(API, {
    headers: {
      Authorization:
        `Bearer ${localStorage.getItem("token")}`
    }
  });
};

export const getProfile = () =>
  api.get("/profile");

export const updateProfile = ({ name, email, password }) =>
  api.put("/profile", { name, email, password });