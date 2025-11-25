import { api } from "./api";

// GET all equipment
export const getEquipments = async () => {
    const res = await api.get("/api/equipment");
    return res.data;
};

// POST create equipment
export const createEquipment = async (data: any) => {
    const res = await api.post("/api/equipment", data);
    return res.data;
};
