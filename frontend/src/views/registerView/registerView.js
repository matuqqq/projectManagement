import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./registerStyle.css";
import { handleRegister } from "./registerBackend";

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Falta nombre de usuario")
    .min(3, "Mínimo 3 caracteres")
    .matches(/^\S+$/, "No puede contener espacios"),
  email: Yup.string().required("Falta email").email("Email inválido"),
  password: Yup.string()
    .required("Falta contraseña")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
      "Debe contener al menos una mayúscula, una minúscula y un número"
    ),
  confirmPassword: Yup.string()
    .required("Falta confirmar contraseña")
    .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden"),
});

export default function RegisterView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const setFieldErrorRef = useRef(null);

  return (
    <div className="container">
      <h1 className="title">Falso Discord</h1>
      <h2 className="subtitle">Registro de usuario</h2>

      <Formik
        initialValues={{
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setFieldError }) => {
       
          if (loading) return;
          setLoading(true);
          setGeneralError("");
          setFieldErrorRef.current = setFieldError;
          try {
            const result = await handleRegister(values, navigate);
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
                type="text"
                placeholder="nombre de usuario"
                className="input"
                value={values.username}
                onChange={(e) => {
                  handleChange("username")(e);
                  setGeneralError("");
                  setFieldError("username", "");
                }}
                onBlur={handleBlur("username")}
              />
              {errors.username && touched.username && (
                <div className="error">{errors.username}</div>
              )}

              <input
                type="email"
                placeholder="email"
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

              <div className="password-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="confirmar contraseña"
                  className="input"
                  value={values.confirmPassword}
                  onChange={(e) => {
                    handleChange("confirmPassword")(e);
                    setGeneralError("");
                    setFieldError("confirmPassword", "");
                  }}
                  onBlur={handleBlur("confirmPassword")}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <div className="error">{errors.confirmPassword}</div>
              )}

              {generalError && <div className="error">{generalError}</div>}

              <button
                type="submit"
                className="submit-button"
                disabled={!isValid || !dirty || loading}
              >
                {loading ? "Cargando..." : "Registrarme"}
              </button>

              <button
                type="button"
                className="register-button"
                onClick={() => navigate("/")}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}