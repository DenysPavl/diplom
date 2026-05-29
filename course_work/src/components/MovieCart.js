import React from "react";
import "../card.css";
import { Link } from 'react-router-dom';
import { useNavigate} from "react-router-dom";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

export default function MovieCart({ movie }) {
  const navigate = useNavigate();
  const handleClick = () => {
  navigate(`/movie/${movie.id}`)
  };

  return (
    <li className="product-item">
      <article className="card">
          <div className="product-img" onClick={handleClick}>
              {movie.poster_path ? (
                <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt="img"/>
              ) : (
                <img src="https://placehold.co/180x270" alt="img"/>
              )}
        </div>
        <div className="product-list">
          <h3>{movie.title}</h3>
          <div>Рейтинг: {movie.vote_average}</div>
        </div>
      </article>
    </li>
  );
}
