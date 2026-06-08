import React from "react";
import { useAuth } from "../Context/authContext";
import { Navigate } from "react-router-dom";

const PrivateRoutes = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>loading......</div>;
  }
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoutes;
