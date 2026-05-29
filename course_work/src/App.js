import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import './App.css';
import Categorys from "./pages/Category/Categorys";
import AddCategory from "./pages/Category/AddCategory";
import UpdateCategory from "./pages/Category/UpdateCategory";
import InfoCategory from "./pages/Category/InfoCategory";
import LoginForm from "./pages/Auth/LoginForm";
import RegisterForm from "./pages/Auth/RegisterForm";
import Profile from "./pages/User/Profile";
import HeaderA from "./components/HeaderAdaptiv";
import Header from "./components/Header"
import Home from "./pages/Home";
import PrivateRoutes from "./utils/PrivateRoutes";
import MovieInfo from "./pages/Movie/MovieInfo";
import Recommendations from "./pages/Movie/Recommendations";
import AIChat from "./pages/Chat/AIChat";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token')); // Управляємо токеном в стані

  return (
    <div>
      <BrowserRouter>

        <HeaderA setToken={setToken} />
        <Routes>

          <Route element = {<PrivateRoutes token = {token}/>} >
            <Route path="/category/create" element={<AddCategory />} />
            <Route path="/category/update/:id" element={<UpdateCategory />} />
          </Route>

          <Route path="/" element={<Home token={token}/>} />
          <Route path="/movie/:id" element={<MovieInfo />} />
          <Route path="/categories" element={<Categorys token={token}/>} />
          <Route path="/category/info/:id" element={<InfoCategory />} />
          <Route path="/recommendations" element={<Recommendations token={token} />} />
          <Route path="/ai-chat" element={<AIChat token={token} />} />
          <Route path="/login" element={<LoginForm setToken={setToken}/>} />
          <Route path="/registration" element={<RegisterForm setToken={setToken}/>} />
          <Route path="/profile" element={<Profile token={token} setToken={setToken}/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

