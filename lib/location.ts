import { api } from "./api";

// GET all location
export const getLocations = async () => {
    const res = await api.get("/api/location");
    return res.data;
};

// GET location by id
export const getLocationById = async (id: string) => {
    const res = await api.get(`/api/location/${id}`);
    return res.data;
};

// POST create location
export const createLocation = async (data: any) => {
    const res = await api.post("/api/location", data);
    return res.data;
};
