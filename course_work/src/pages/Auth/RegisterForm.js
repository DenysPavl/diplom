import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import '../../styles/login.css'

export default function RegisterForm({setToken}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  function handlSubmit(event) {
    event.preventDefault();
    axios.post("http://localhost:8001/api/auth/registration", {
        username,
        email,
        password,
      })
      .then((res) => {
        if (res.status !== 201) {
          throw new Error(res.data.message);
        } else {
          localStorage.setItem("token", res.data.token);
          setToken(res.data.token);
          navigate("/");
        }
      })
      .catch((err) => {
        alert(err.response.data.message);
        console.log(err.response.data.message);
      });
  }

  return (
    <div className="login-page">
    <div className="login-card">
      <form onSubmit={handlSubmit}>
        <h2>Registration Form</h2>
        <div>
          <label>Username</label>
          <input type="text" placeholder="Enter Username" onChange={(e) => setUsername(e.target.value)} />

          <label>Email</label>
          <input type="email" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)} />

          <label>Password</label>
          <input type="password" placeholder="Enter Password" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
        <div className="login-links">
        Маєш аккаунт?? <Link to={`/login`}>Ввійти</Link>
      </div>
      </form>
    </div>
  </div>
  );
}
