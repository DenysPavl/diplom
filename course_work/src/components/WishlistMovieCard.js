import React from "react";
import "../card.css";
import { Link } from 'react-router-dom';
import { useNavigate} from "react-router-dom";
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

export default function WishlistMovieCard({ movie }) {
  const navigate = useNavigate();
  const handleClick = () => {
  navigate(`/movie/${movie.id}`)
  };

  return (
    <li className="product-favorite-item">
      <article className="favorite-card">
          <div className="product-img" onClick={handleClick}>
            {movie.poster_path ? (
              <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt="img"/>
            ) : (
              <img src="https://placehold.co/180x270" alt="img"/>
            )}
          <div className="overlay">{movie.title}</div>
        </div>
      </article>
    </li>
  );
}
