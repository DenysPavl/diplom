import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Header({setToken}){
  const [userMenuOpen, setuserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const storedToken = localStorage.getItem('token');

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [setToken]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };

    return(
        <header className="header">
          {storedToken ? (
            <>
              <button
                className="menu_button"
                onClick={() => setuserMenuOpen(!userMenuOpen)}
              ></button>
              <nav className={`menu ${userMenuOpen ? "active" : ""}`}>
                <ul className="menu_list">
                  <li className="menu_item" onClick={handleLogout}>
                    logout
                  </li>
                </ul>
              </nav>
            </>
          ) : (
            <div className="link-container">
            <Link to={`/login`} className="text-white">
              login 
            </Link>
            <Link to={`/registration`} className="text-white">
              register 
            </Link>
          </div>
          )}
        </header>
    )
}