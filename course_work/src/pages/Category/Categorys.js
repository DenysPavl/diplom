import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ListOfCategorys from "../../components/CategorysTableList";
//import "bootstrap/dist/css/bootstrap.main.css";

export default function Categorys({token}) {
  const [categorys, setCategorys] = useState([]);
  //const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/category/all", {
          headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + token
          },
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const result = await response.json();
        setCategorys(result);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [token]);

  const handleDelete = async (id) => {
    //if (!token) return; // Перевіряємо наявність токена перед видаленням

    try {
      const response = await fetch(`http://localhost:8001/api/category/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        method: "DELETE",
      });

      const result = await response.json();

      if (result === "Success") {
        setCategorys(categorys.filter(category => category._id !== id)); // Оновлюємо стан без перезавантаження сторінки
      } else {
        alert(result);
      }
    } catch (error) {
      alert("Error deleting category:", error.message);
    }
  };

  if (categorys.length > 0)
    return (
      <div>
        <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
          <div className="w-50 bg-white rounded p-3">
            <h1 className="d-flex justify-content-center align-items-center">
              Categorys
            </h1>
            <Link to={`/category/create`} className="btn btn-success">
              Add+
            </Link>
            <table className="table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categorys.map((item) => (
                  <ListOfCategorys key={item._id} category={item} fnDelete={handleDelete}/>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  else
    return (
      <div>
        <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
          <h1>Category empty</h1>
        </div>
      </div>
    );
}


/*
 <main>
        <div>
          {categorys.length > 0 ? (
            <ul>
              {categorys.map((item) => (
                <div key={item._id}>
                  <li>{item.name} :</li>
                  {item.products.map((product, index) => (
                    <li
                      style={{ listStyleType: "none", marginLeft: 10 }}
                      key={index}
                    >
                      {product}
                    </li>
                  ))}
                </div>
              ))}
            </ul>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </main>
      <aside>Aside</aside>
*/
