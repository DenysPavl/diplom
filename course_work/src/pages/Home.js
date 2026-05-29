import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MovieCart from "../components/MovieCart.js";
import "../card.css";

const GENRE_FILTERS = [
  { label: "Бойовики", value: "with_genres=28" },
  { label: "Пригоди", value: "with_genres=12" },
  { label: "Анімація", value: "with_genres=16" },
  { label: "Комедії", value: "with_genres=35" },
  { label: "Кримінал", value: "with_genres=80" },
  { label: "Документальні", value: "with_genres=99" },
  { label: "Драма", value: "with_genres=18" },
  { label: "Сімейні", value: "with_genres=10751" },
  { label: "Фентезі", value: "with_genres=14" },
  { label: "Історичні", value: "with_genres=36" },
  { label: "Жахи", value: "with_genres=27" },
  { label: "Музика", value: "with_genres=10402" },
  { label: "Детективи", value: "with_genres=9648" },
  { label: "Романтика", value: "with_genres=10749" },
  { label: "Фантастика", value: "with_genres=878" },
  { label: "ТБ-фільми", value: "with_genres=10770" },
  { label: "Трилери", value: "with_genres=53" },
  { label: "Воєнні", value: "with_genres=10752" },
  { label: "Вестерни", value: "with_genres=37" },
];

const YEAR_FILTERS = Array.from({ length: 16 }, (_, index) => {
  const year = new Date().getFullYear() - index;
  return { label: String(year), value: `primary_release_year=${year}` };
});

export default function Home({ token }) {
  const [movies, setMovies] = useState([]);
  const [loading,setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterId, setfilterId] = useState(null); // null = популярні
  const [searchQuery, setSearchQuery] = useState("");
  const API_KEY = 'c85178492d59c53b4fc5c8921eb820e5';

  useEffect(() => {
    fetchMovies(1,true);
  }, [filterId,searchQuery]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchMovies(page + 1);
    }
  };

  const handleFilter = (genre) => {
    setfilterId(genre);
    setSearchQuery("");
    setMovies([]);
    setPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setfilterId(null);
    setMovies([]);
    setPage(1);
  };

  const fetchMovies = async (targetPage = 1, reset = false) => {
    let baseUrl;
    if (searchQuery) {
      baseUrl = `https://api.themoviedb.org/3/search/movie?query=${searchQuery}&api_key=${API_KEY}&language=uk-UA&page=${targetPage}`; //Search
    } else if (filterId === null || filterId === '') {
      baseUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=uk-UA&page=${targetPage}`; //Popular
    } else {
      baseUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=uk-UA&${filterId}&page=${targetPage}`; //Filtered
    }
    try {
      const res = await axios.get(baseUrl);
        console.log("DATA:", res.data);
        if (res.data && res.data.results) {
          setMovies(prev => reset ? res.data.results : [...prev, ...res.data.results]);
          setTotalPages(res.data.total_pages);
        } else {
          console.error("Неправильна відповідь API:", res.data);
        }
      setPage(targetPage);
    } catch (err) {
      console.error('Помилка завантаження фільмів:', err);
    } finally {
      setLoading(true);
    }
  };


  if(!loading)
  return (
    <div className="d-flex vh-100 bg-light justify-content-center align-items-center">
        Loading...
    </div>
  )
  else
    return(
      <div className="container">
        <header className="container-head">
        <div className="top-row">
          <h1 className="logo">Пошук Фільмів</h1>
          <SearchBar onSearch={handleSearch}/>
        </div>
      <div className="top-row">
        <nav>
          <ul className="nav-links">
            <li className="dropdown">
              <p onClick={() => handleFilter("")} >Жанри</p>
              <div className="dropdown-content">
                <a onClick={() => handleFilter("")}>Усі жанри</a>
                {GENRE_FILTERS.map((genre) => (
                  <a key={genre.value} onClick={() => handleFilter(genre.value)}>
                    {genre.label}
                  </a>
                ))}
              </div>
            </li>
              <li className="dropdown">
                <p>Роки</p>
                <div className="dropdown-content">
                  {YEAR_FILTERS.map((year) => (
                    <a key={year.value} onClick={() => handleFilter(year.value)}>
                      {year.label}
                    </a>
                  ))}
                </div>
              </li>
              <li><Link to={`/profile`} className="nav-link">Збережені</Link></li>
            </ul>
          </nav>
      </div>
        </header>
        <hr className="divider" />
        {movies.length > 0 ? (
            <ul className="cards" >
                { movies.map((movie)=>(<MovieCart key={movie.id} movie={movie}/>))}
            </ul>
        )
        :(
            <p style={{ margin: "50px" }}> Не знайдено  </p>
        )}

        {page < totalPages && (
        <div className="load-more-container">
          <button onClick={handleLoadMore} className="load-more-btn">Відобразити ще</button>
        </div>
      )}
      </div>
    )
}

function SearchBar({ onSearch }) {
  const [inputValue, setInputValue] = useState("");

  const handleClick = () => {
    onSearch(inputValue);
  };

  return (
    <div className="search-bar">
        <input type="text" placeholder="Напишіть назву фільма" value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} />
        <button className="search-button" onClick={handleClick}>Search</button>
    </div>
  );
}
