import React, { useState } from "react";
import { useNavigate} from "react-router-dom";
import '../../styles/login.css'
import { Link } from "react-router-dom";

export default function LoginForm({setToken}) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handlSubmit(event) {
    event.preventDefault();

    fetch("http://localhost:8001/api//auth/login", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({email , password}),
    })
      .then((res) => res.json())
      .then(
        (result) => {
            if(result.message === 'Successful login ;)'){
                localStorage.setItem('token', result.token);
                setToken(result.token)
                localStorage.setItem('user_id', result.data._id);
                navigate("/");
            }
            else alert(result.message)
        },
        (error) => {
          alert(error.message);
        }
      );
  }

  return (
<div className="login-page">
  <div className="login-card">
    <form onSubmit={handlSubmit}>
      <h2>Login</h2>
      <div>
        <label>Email</label>
        <input type="email" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" placeholder="Enter Password" onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit">Submit</button>
      <div className="login-links">
        Не маєш аккаунта? <Link to={`/registration`}>Зареєструватися</Link>
      </div>
    </form>
  </div>
</div>
  );
}