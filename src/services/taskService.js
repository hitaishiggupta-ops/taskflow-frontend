import api from "./api";

export const getTasks = (boardId) =>
  api.get(`/tasks/${boardId}`);


export const createTask = (formData) =>
  api.post("/tasks", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const updateTask = (id, data) =>
  api.put(`/tasks/${id}`, data);

export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status });

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`);