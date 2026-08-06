import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data);
  }

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", { name, email, password });
    persist(data);
  }

  function persist(data) {
    const { token, ...userInfo } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
