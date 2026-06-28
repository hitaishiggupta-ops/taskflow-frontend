import api from "./api";

export const getBoards = () =>
  api.get("/boards");

export const createBoard = (
    formData
) =>
    api.post(
        "/boards",
        formData,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data"
            }
        }
    );

export const updateBoard = (id, title, description) =>
  api.put(`/boards/${id}`, { title, description });

export const deleteBoard = (id) =>
  api.delete(`/boards/${id}`);