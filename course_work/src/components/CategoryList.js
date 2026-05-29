import React from "react";
import { useState, useEffect } from "react";

export default function CategoryList({name,setFormData}) {
  const [categorys, setCategorys] = useState();
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/category/all", {
          headers: {
            "Content-Type": "application/json",
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
  }, []);

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedCategory(selectedValue); // Оновлення контрольованого стану
    setFormData((prevData) => ({
      ...prevData,
      category: selectedValue, // Оновлюємо стан в основному компоненті
    }));
  };

  return (
    <>
      {categorys ? (
        <select name={name} value={selectedCategory} onChange={handleCategoryChange}>
          {categorys.map((element) => (
            <option
              key={element._id}
              value={element.name}
            >
              {element.name}
            </option>
          ))}
        </select>
      ) : (
        <p>loading categories...</p>
      )}
    </>
  );
}
