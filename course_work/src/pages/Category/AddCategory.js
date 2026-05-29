import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddCategory() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function handlSubmit(event) {
    event.preventDefault();

    fetch("http://localhost:8001/api/category/create", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          alert(result);
            if(result==='Success')
          navigate("/");
        },
        (error) => {
          alert(error.message);
          console.log(error);
        }
      );
  }

  return (
    <div>
      <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
        <div className="w-50 bg-white rounded p-3">
          <form onSubmit={handlSubmit}>
            <h2>AddCategory</h2>
            <div className="mb-2">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter Name"
                className="form-control"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button className="btn btn-success">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* Async function
  async function handlSubmit(event) {
    event.preventDefault();
  
    if (!name) {
      alert("Поле не може бути пустим");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8001/api/category/create", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ name }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(data);
        navigate("/");
      } else {
        alert( data);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  }*/