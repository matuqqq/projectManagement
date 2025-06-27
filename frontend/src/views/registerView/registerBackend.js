import { sendPost } from "../../connections/backendConnect";

export const handleRegister = async (values, navigate) => {
 
  const { email, password, username } = values;
  try {
    const res = await sendPost("/user/register", { email, password, username });
    console.log("res register", res);

    if (res.success === true) {
      if (res.accessToken) localStorage.setItem("accessToken", res.accessToken);
      if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);

      localStorage.setItem("user", JSON.stringify(res.user || { email, username }));


      navigate("/home");
      return { success: true };
    }

    if (res.success === false && res.field) {
      return res;
    }

    if (res.error) {
      return {
        success: false,
        message: res.error,
      };
    }

    return {
      success: false,
      message: res.message || "Error desconocido al registrar",
    };
  } catch (error) {
    console.error("[RegisterBackend]: Error en handleRegister:", error);
    return { success: false, message: "Error inesperado" };
  }
};