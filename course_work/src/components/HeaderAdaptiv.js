import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {ReactComponent as White_Icon} from './profile2.svg'

import "../headerA.css"

export default function HeaderA({setToken}){
  const navigate = useNavigate();
  const storedToken = localStorage.getItem('token');

    useEffect(() => {
        setToken(localStorage.getItem('token'));
      }, [setToken]);
    
      const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        setToken(null);
        navigate('/');
      };

    return(
      <header className="headerA">
      <div className="headerA_container">
        <Link to="/" className="headerA_logo">CineWave</Link>
    
        <ul className="nav-links">
        {storedToken ? (
                <>
                  <li className="headerA_nav-item"><Link to={`/`}>Фільми</Link></li>
                  <li className="headerA_nav-item"><Link to={`/profile`}>Профіль</Link></li>
                  <li className="headerA_nav-item"><Link to="/ai-chat" className="nav-link">AI Чат</Link></li>
                  <li className="headerA_nav-item"><Link to="/recommendations">Рекомендовані</Link></li>
                </>
              ) : (
                <>
                  <li className="headerA_nav-item"><Link to={`/`}>Фільми</Link></li>
                  <li className="headerA_nav-item"><Link to={`/login`}>Ввійти</Link></li>
                  <li className="headerA_nav-item"><Link to={`/registration`}>Зареєструватися</Link></li>
                </>
              )}
        </ul>
    
        <div className="headerA_right">
              {storedToken ? (
                <button className="headerA_menu-button" onClick={() => navigate("/profile")}>
                  <White_Icon width="30px" height="30px"/>
               </button> 
              ) : (
                <button className="headerA_menu-button" onClick={() => navigate("/login")}>
                  <White_Icon width="30px" height="30px"/>
                </button>
              )}
        </div>
      </div>
    </header>    
    )
}