import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import MovieCart from "../../components/MovieCart";
import API_URL from "../../utils/api";
import "../../card.css";

const INITIAL_RECOMMENDATIONS_LIMIT = 18;
const RECOMMENDATIONS_STEP = 12;
const MAX_RECOMMENDATIONS_LIMIT = 60;

export default function Recommendations({ token }) {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [basedOnMovies, setBasedOnMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recommendationsLimit, setRecommendationsLimit] = useState(INITIAL_RECOMMENDATIONS_LIMIT);
  const [hasMoreRecommendations, setHasMoreRecommendations] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (recommendationsLimit === INITIAL_RECOMMENDATIONS_LIMIT) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError("");

    axios
      .get(`${API_URL}/api/recommendations?limit=${recommendationsLimit}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data || {};
        const recommendedMovies = Array.isArray(data) ? data : data.movies || [];
        setMovies(recommendedMovies);
        setBasedOnMovies(Array.isArray(data.basedOnMovies) ? data.basedOnMovies : []);
        setHasMoreRecommendations(Boolean(data.hasMore) && recommendationsLimit < MAX_RECOMMENDATIONS_LIMIT);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Не вдалося завантажити рекомендації");
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [token, navigate, recommendationsLimit]);

  const handleLoadMore = () => {
    setRecommendationsLimit(prev => Math.min(prev + RECOMMENDATIONS_STEP, MAX_RECOMMENDATIONS_LIMIT));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const visibleBasedOnMovies = basedOnMovies.slice(0, 5);
  const hasMoreBasedOnMovies = basedOnMovies.length > 5;

  return (
    <div className="container">
      <header className="container-head">
        <div className="top-row">
          <h1 className="logo">Рекомендовані фільми</h1>
          <Link to="/" className="nav-link">На головну</Link>
        </div>
      </header>

      <hr className="divider" />

      {error ? (
        <p style={{ margin: "50px" }}>{error}</p>
      ) : (
        <>
          {basedOnMovies.length > 0 && (
            <section style={{ margin: "24px 20px" }}>
              <h2 style={{ color: "#f0f0f0", fontSize: "22px", marginBottom: "12px" }}>
                На основі ваших фільмів
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  maxWidth: "100%"
                }}
              >
                {visibleBasedOnMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: "38px",
                      maxWidth: "260px",
                      padding: "8px 16px",
                      borderRadius: "999px",
                      color: "#f0f0f0",
                      background: "rgba(26, 26, 26, 0.72)",
                      border: "1px solid rgba(233, 69, 96, 0.25)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textDecoration: "none"
                    }}
                    title={movie.title}
                  >
                    {movie.title}
                  </Link>
                ))}
                {hasMoreBasedOnMovies && (
                  <Link
                    to="/profile"
                    title="Переглянути всі фільми в профілі"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: "38px",
                      padding: "8px 16px",
                      borderRadius: "999px",
                      background: "rgba(233, 69, 96, 0.12)",
                      border: "1px solid rgba(233, 69, 96, 0.35)",
                      color: "#e94560",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    ...
                  </Link>
                )}
              </div>
            </section>
          )}

          {movies.length > 0 ? (
            <section style={{ margin: "24px 0" }}>
              <h2 style={{ color: "#f0f0f0", fontSize: "22px", margin: "0 20px 12px" }}>
                Рекомендації для вас
              </h2>
              <ul className="cards">
                {movies.map((movie) => (
                  <MovieCart key={movie.id} movie={movie} />
                ))}
              </ul>
              {hasMoreRecommendations && (
                <div className="load-more-container">
                  <button
                    onClick={handleLoadMore}
                    className="load-more-btn"
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Завантаження..." : "Відобразити ще"}
                  </button>
                </div>
              )}
            </section>
          ) : (
            <p style={{ margin: "50px" }}>
              Поки що немає рекомендацій. Додайте кілька фільмів в улюблені або переглянуті.
            </p>
          )}
        </>
      )}
    </div>
  );
}
