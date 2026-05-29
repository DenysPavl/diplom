import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/movieInfo.css'
import axios from 'axios';

const MovieInfo = () => {
  const { id } = useParams(); // Отримуємо ID з URL
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);

  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const API_KEY = 'c85178492d59c53b4fc5c8921eb820e5';

  const currentUserId = localStorage.getItem("user_id");

  useEffect(() => {
    // Запит на сервер для отримання фільму за ID
    axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=uk-UA`)
      .then(res => {
        setMovie(res.data);
      })
      .catch(error => {
        console.error('Error fetching movie:', error);
      });
  }, [id]);

  const fetchStatuses = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`http://localhost:8001/api/user/status/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setIsFavorite(res.data.isFavorite);
      setIsWatched(res.data.isWatched);
      setIsPlanned(res.data.isPlanned);
    } catch (error) {
      console.error("Error fetching movie status:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  useEffect(() => {
    axios.get(`http://localhost:8001/api/comment/movie/${id}`)
      .then(res => setComments(res.data))
      .catch(error => console.error('Error fetching comments:', error));
  }, [id]);

  const handleStatusChange = async (status) =>{
    try {
      const token = localStorage.getItem("token");
      const currentState = {
      favorite: isFavorite,
      watched: isWatched,
      planned: isPlanned,
      };
      if(!currentState[status]){
        await axios.post(`http://localhost:8001/api/user/${status}`, {movieId: id}, {
          headers: {
            Authorization: `Bearer ${token}`
          }});
      }
      else{
        await axios.delete(`http://localhost:8001/api/user/${status}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { movieId: id } // <-- ось так правильно
        });
      }
      await fetchStatuses();
    } catch (error) {
      console.error(`Error updating ${status} status:`, error);
      setError('Не вдалося оновити статус. Увійдіть, щоб зберігати зміни.');
    }
  };
  
  const handleDeleteComment = async (comment_id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8001/api/comment/${comment_id}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updated = await axios.get(`http://localhost:8001/api/comment/movie/${id}`);
      setComments(updated.data);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Сесія закінчилась або ви не увійшли. Увійдіть, щоб додати коментар.');
    }
  };

  const handleAddComment = async () => {
    setError(null);
    if (!newComment || newComment.trim() === '') {
      setError('Коментар не може бути порожнім');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8001/api/comment', {
        movie: id,
        text: newComment,
        rating: 5
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNewComment('');
      const updated = await axios.get(`http://localhost:8001/api/comment/movie/${id}`);
      setComments(updated.data);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Сесія закінчилась або ви не увійшли. Увійдіть, щоб додати коментар.');
    }
  };

  if (!movie) return <p>Завантаження фільму...</p>;

  return (
  <div className="movie-container">
    <div className="movie-content">
      {movie.poster_path ? (
        <img className="movie-info-poster" src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title}/>
      ) : (
        <img className="movie-info-poster" src="https://placehold.co/300x450" alt="placeholder"/>
      )}
      <div className="movie-details">
        <h2>{movie.title}</h2>
        <p>{movie.overview}</p>
        <p><strong>Дата випуску:</strong> {movie.release_date}</p>
        <p><strong>Рейтинг:</strong> {movie.vote_average}/10</p>
        <p><strong>Тривалість:</strong> {movie.runtime} хв.</p>
        {movie.homepage && (
          <a href={movie.homepage} target="_blank" rel="noopener noreferrer">
            Офіційний сайт
          </a>
        )}
        
        {/* Секція жанрів */}
        <div className="genres-section">
          {movie.genres && movie.genres.map(genre => (
            <span key={genre.id} className="genre-badge">{genre.name}</span>
          ))}
        </div>
        {/* Секція з кнопками статусу */}
        <div className="movie-actions">
          <button 
            className={`action-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => handleStatusChange('favorite')}
          >
            <i className="heart-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" fill="#ff4000"></path> </g></svg></i> Улюблені
          </button>
          <button 
            className={`action-btn ${isWatched ? 'active' : ''}`}
            onClick={() => handleStatusChange('watched')}
          >
            <i className="eye-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#00e1ff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 12c0-2.25 3.75-7.5 10.5-7.5S22.5 9.75 22.5 12s-3.75 7.5-10.5 7.5S1.5 14.25 1.5 12zM12 16.75a4.75 4.75 0 1 0 0-9.5 4.75 4.75 0 0 0 0 9.5zM14.7 12a2.7 2.7 0 1 1-5.4 0 2.7 2.7 0 0 1 5.4 0z" fill="#00fbff"></path></g></svg></i> Переглянуті
          </button>
          <button 
            className={`action-btn ${isPlanned ? 'active' : ''}`}
            onClick={() => handleStatusChange('planned')}
          >
            <i className="clock-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#facc15" viewBox="0 0 24 24"><path d="M6 2a2 2 0 0 0-2 2v18l8-5.333L20 22V4a2 2 0 0 0-2-2H6z"/></svg></i> В планах
          </button>
        </div>
      </div>
    </div>

    <div className="comments-section">
      <h3>Коментарі</h3>
      <div className="comment-form">
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ваш коментар..."
        />
        <button onClick={handleAddComment}>Додати</button>
      </div>
      <ul className="comments-list">
        {comments.length === 0 ? (
          <p>Коментарів ще немає. Будьте першим!</p>
        ) : (
          comments.map(comment => (
            <li key={comment._id} className={String(comment.authorId) === String(currentUserId) ? "user-comment" : "other-comment"}>
              <p>{comment.authorName}</p>
              <p className="comment-text">{comment.text}</p>
              {(String(comment.authorId) === String(currentUserId)) && (
                <button className="del-button" onClick={() => handleDeleteComment(comment._id)}>
                  Видалити
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  </div>
);
};

export default MovieInfo;
