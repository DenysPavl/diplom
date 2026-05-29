import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export default function ListOfCategorys({ category, fnDelete }) {

  return (
    <>
      <tr key={category._id}>
        <td>{category.name}</td>
        <td>
          <Link to={`/category/info/${category._id}`} className="btn btn-info">
            Details
          </Link>
          <Link
            to={`/category/update/${category._id}?name=${category.name}`}
            className="btn btn-primary"
          >
            Update
          </Link>
          <button
            onClick={(e) => fnDelete(category._id)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </td>
      </tr>
    </>
  );
}

ListOfCategorys.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    products: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    __v: PropTypes.number,
  }).isRequired,
  fnDelete: PropTypes.func.isRequired
};


  /*async function handlDelete(id) {
    try {
      await fetch("http://localhost:8001/api/category/" + id, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(
          (result) => {
            if (result === "Success") window.location.reload();
            else alert(result);
          },
          (error) => {
            alert(error.message);
          }
        );
    } catch (err) {
      console.log(err);
    }
  }*/