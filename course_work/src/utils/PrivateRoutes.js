import axios from "axios";
import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";

export default function PrivateRoutes({ token }) {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true); // For handling the async loading state
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8001/api/profile`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        if (res.data) {
          setAuth(true);
        }
      })
      .catch((err) => {
        alert("Будь ласка, увійдіть у свій профіль");
        localStorage.removeItem("token");
        navigate("/login");
      })
      .finally(() => {
        setLoading(false); // End loading state
      });
  }, [token, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return auth ? <Outlet /> : <Navigate to="/login" />;
}
