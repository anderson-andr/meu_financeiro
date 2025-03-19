import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/context/AuthContext";
import "./login.css"; // Importa o CSS específico para o Login
import { fetchUserData } from "../../services/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState(""); // Altere o estado para armazenar apenas o userId
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext);

  useEffect(() => {
    const pingApi = async () => {
      try {
        const response = await fetch("https://api.minhas-financias.online/ping");
        if (response.ok) {
          console.log("Ping bem-sucedido!");
        } else {
          console.log("Erro ao acessar a API");
        }
      } catch (error) {
        console.error("Erro de rede:", error);
      }
    };

    pingApi();
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", { username, password });
      const token = response.data.token;
      login(token);

      const id = await fetchUserData();
      setUserId(id);

      navigate("/home");
      console.log(token);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Credenciais inválidas");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {userId && <p>Bem-vindo, usuário {userId}!</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="password-container" style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button type="submit">Entrar</button>
      </form>
      <div className="register-link">
        <button onClick={() => navigate("/register")}>Registrar-se</button>
      </div>
    </div>
  );
};

export default Login;
