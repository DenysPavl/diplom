import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function InfoCategory() {
  const [category, setCategory] = useState({});
  const { id } = useParams();

  useEffect(() => {
    fetch("http://localhost:8001/api/category/" + id, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then(
        (result) => {
          setCategory(result);
        },
        (error) => {
          alert(error.message);
        }
      );
  });

  return (
    <div>
      <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
        <div className="w-50 bg-white rounded p-3">
          <h1 className="d-flex justify-content-center align-items-center">
            {category.name}
          </h1>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
              </tr>
            </thead>
            <tbody>
              {category.products &&
                category.products.map((item, index) => (
                  <tr key={index}>
                    <td>{item}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
