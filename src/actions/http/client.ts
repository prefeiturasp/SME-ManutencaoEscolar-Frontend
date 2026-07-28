import axios from "axios";

const urlBase = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
const normalizedBaseUrl = urlBase ? urlBase.replace(/\/$/, "") : "";
const baseURL = normalizedBaseUrl ? `${normalizedBaseUrl}/api/v1` : "/api/v1";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
