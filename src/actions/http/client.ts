import axios from "axios";

const urlBase  = process.env.NEXT_PUBLIC_API_URL

if (!urlBase) {
    throw new Error(
        "A variável NEXT_PUBLIC_API_URL não foi configurada."
    );
}
export const api = axios.create({
    baseURL: urlBase,
    headers: {
        "Content-Type": "application/json",
    },
});
