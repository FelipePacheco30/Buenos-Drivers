import { getToken } from "./api";

const DriverService = {
  uploadDocument: async (formData) => {
    const token = getToken();
    const res = await fetch("http://localhost:3333/documents", {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao enviar documento");
    }

    return res.json();
  },
};

export default DriverService;
