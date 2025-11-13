import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

class PublicApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async get(url, config) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url, data, config) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        throw new Error(
          errorData.error ||
            errorData.detail ||
            Object.values(errorData).flat().join(" ") ||
            "Error en la petición."
        );
      }
      throw new Error("Error de conexión o servidor no disponible.");
    }
  }
}

const publicApiClient = new PublicApiClient();
export default publicApiClient;
