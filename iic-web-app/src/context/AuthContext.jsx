import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberUser, setMemberUser] = useState(() => {
    const saved = localStorage.getItem("memberUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [memberToken, setMemberToken] = useState(() => {
    return localStorage.getItem("memberToken") || "";
  });

  const login = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const loginMember = (userData, token) => {
    localStorage.setItem("memberToken", token);
    localStorage.setItem("memberUser", JSON.stringify(userData));
    setMemberToken(token);
    setMemberUser(userData);
  };

  const logoutMember = () => {
    localStorage.removeItem("memberToken");
    localStorage.removeItem("memberUser");
    setMemberToken("");
    setMemberUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, memberUser, memberToken, loginMember, logoutMember }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);