import React, { useState } from "react";
import { useNavigate, useParams} from "react-router-dom";
import { useLocation } from 'react-router-dom';

export default function UpdateCategory(props) {
  const query = new URLSearchParams(useLocation().search);
  const old_name = query.get('name');
  const [name, setName] = useState(old_name|| ""); // Ініціалізуємо стан
  const navigate = useNavigate();
  const { id } = useParams();
  console.log(name);

  function handlSubmit(event) {
    event.preventDefault();
    if (!name) {
      alert("Поле не може бути пустим");
      return;
    }

    fetch("http://localhost:8001/api/category/update/"+id, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
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
                value={name}
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