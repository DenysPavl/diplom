import axios from "axios";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryList from "../../components/CategoryList.js";
import ImageUpload from "../../components/imageUpload.js";

export default function AddProduct({ token }) {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  //const [isSubmit, setIsSubmit]=useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    text: "",
    category: "",
  });
  const [image, setImage] = useState("");

  const validation = (values) => {
    const errors = {};
    if (values.name === "") 
      errors.name = "Name is required!";
    if (values.price === "" || values.price <= 0)
      errors.price = "Price is required and > 0!";
    if (values.text === "") 
      errors.text = "Text is required!";
    if (values.category === "") 
      errors.category = "Category is required!";
    return errors;
  };

  const handlChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log(formData);
  };

  function handlSubmit(e) {
    e.preventDefault();
    setFormErrors(validation(formData));
    if (Object.keys(validation(formData)).length === 0) {
      const productData = {
        ...formData,
        image,
      };

      try {
        axios
          .post("http://localhost:8001/api/product/create", productData, {
            headers: { Authorization: "Bearer " + token },
          })
          .then((res) => console.log(res.data))
          .then(alert("Success operation"))
          .catch((err) => console.log(err));
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
      <div className="w-50 bg-white rounded p-3">
        <form onSubmit={handlSubmit}>
          <h2>AddProduct</h2>
          <div className="mb-2">
          {formErrors.name && <p style={{color:"red"}}>{formErrors.name}</p>}
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Enter Name"
              className="form-control"
              onChange={handlChange}
            />
            {formErrors.price && <p p style={{color:"red"}}>{formErrors.price}</p>}
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              placeholder="Enter Name"
              className="form-control"
              onChange={handlChange}
            />
            {formErrors.text && <p p style={{color:"red"}}>{formErrors.text}</p>}
            <label>Text</label>
            <input
              type="text"
              name="text"
              value={formData.text}
              placeholder="Enter Name"
              className="form-control"
              onChange={handlChange}
            />
            {formErrors.category && <p p style={{color:"red"}}>{formErrors.category}</p>}
            <label>Category</label>
            <CategoryList name="category" setFormData={setFormData} />
            <p> </p>
            <label>Photo</label>
            <ImageUpload setImage={setImage} />
          </div>
          <button className="btn btn-success">Submit</button>
        </form>
      </div>
    </div>
  );
}
