import React from "react";
import { Link } from "react-router-dom";

export default function ChatMessage({ message }) {
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w185";
  const movies = message.movies || [];

  return (
    <>
      <div className={`message ${message.type}-message`}>
        <div className="message-bubble">
          <p>{message.text}</p>
        </div>
      </div>

      {movies.length > 0 && (
        <div className="recommended-movies">
          <div className="movies-grid">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="movie-card-link"
              >
                <div className="movie-card-item">
                  <div className="movie-poster">
                    {movie.poster_path ? (
                      <img
                        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                        alt={movie.title}
                      />
                    ) : (
                      <img
                        src="https://placehold.co/185x278/333/666?text=No+Image"
                        alt="No poster"
                      />
                    )}
                  </div>
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <p className="rating">⭐ {movie.vote_average?.toFixed(1)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
