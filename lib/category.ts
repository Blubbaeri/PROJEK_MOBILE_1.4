import { api } from "./api";

// GET all category
export const getCategories = async () => {
    const res = await api.get("/api/category");
    return res.data;
};

// GET category by id
export const getCategoryById = async (id: string) => {
    const res = await api.get(`/api/category/${id}`);
    return res.data;
};

// POST create category
export const createCategory = async (data: any) => {
    const res = await api.post("/api/category", data);
    return res.data;
};
