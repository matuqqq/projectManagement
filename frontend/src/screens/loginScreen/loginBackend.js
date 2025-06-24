import { sendPost } from "../../connections/backendConnect";

export const handleLogin = async (email, password, navigate) => {
  const payload = { email, password };

  try {
    const res = await sendPost("/user/login", payload);
    console.log("res login", res);

    if (res.success === true) {
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      navigate("/home");
      return { success: true };
    }

    if (res.error) {
      return {
        success: false,
        message: res.error,
      };
    }

    return {
      success: false,
      field: res.field,
      message: res.message || "Error desconocido",
    };
  } catch (error) {
    console.error("[LoginBackend]: Error inesperado:", error);
    return {
      success: false,
      message: "Error de conexión al servidor",
    };
  }
};