import API from "./api";

export const generateReport = async (data) => {
  const res = await API.post("/report/generate", data);
  return res.data;
};