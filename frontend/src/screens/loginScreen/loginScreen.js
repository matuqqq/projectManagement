import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./loginStyle.css";
import { handleLogin } from "./loginBackend";

const validationSchema = Yup.object().shape({
  email: Yup.string().required("Falta email o nombre de usuario"),
  password: Yup.string()
    .required("Falta contraseña")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
      "La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número"
    ),
});

export default function LoginScreen() {
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setFieldErrorRef = useRef(null);

  return (
    <div className="container">
      <h1 className="title">Falso Discord</h1>
      <h2 className="subtitle">Inicio de sesión</h2>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setFieldError }) => {
          if (loading) return;
          setLoading(true);
          setGeneralError(""); // Limpiar error general antes del envío
          setFieldErrorRef.current = setFieldError;

          try {
            const result = await handleLogin(
              values.email,
              values.password,
              navigate
            );

            if (result?.success === false && result.field) {
              setFieldError(result.field, result.message);
            } else if (result?.success === false) {
              setGeneralError(result.message);
            }
          } catch (error) {
            console.error("Error en onSubmit:", error);
            setGeneralError("Ocurrió un error inesperado");
          } finally {
            setLoading(false);
          }
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
          dirty,
          setFieldError,
        }) => {
          setFieldErrorRef.current = setFieldError;

          return (
            <form className="form" onSubmit={handleSubmit}>
              <input
                placeholder="email/nombre de usuario"
                className="input"
                value={values.email}
                onChange={(e) => {
                  handleChange("email")(e);
                  setGeneralError("");
                  setFieldError("email", "");
                }}
                onBlur={handleBlur("email")}
              />
              {errors.email && touched.email && (
                <div className="error">{errors.email}</div>
              )}

              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="contraseña"
                  className="input"
                  value={values.password}
                  onChange={(e) => {
                    handleChange("password")(e);
                    setGeneralError("");
                    setFieldError("password", "");
                  }}
                  onBlur={handleBlur("password")}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && touched.password && (
                <div className="error">{errors.password}</div>
              )}

              {generalError && <div className="error">{generalError}</div>}

              <button
                type="submit"
                className="submit-button"
                disabled={!isValid || !dirty || loading}
              >
                {loading ? "Cargando..." : "Iniciar sesión"}
              </button>

              <button
                type="button"
                className="register-button"
                onClick={() => navigate("/register")}
              >
                ¿No tienes cuenta? Regístrate
              </button>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}