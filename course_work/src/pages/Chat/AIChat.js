import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ChatMessage from "../../components/ChatMessage";
import API_URL from "../../utils/api";
import "../../styles/chat.css";

const TMDB_API_KEY = 'c85178492d59c53b4fc5c8921eb820e5';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export default function AIChat({ token }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

  const fetchMoviesByNames = async (movieNames) => {
    try {
      const movies = [];
      for (const movieName of movieNames) {
        try {
          let response = await axios.get(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}&language=uk-UA`
          );
          if (!response.data.results || response.data.results.length === 0) {
            response = await axios.get(
              `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}&language=en-US`
            );
          }
          if (response.data.results && response.data.results.length > 0) {
            const movie = response.data.results[0];
            movies.push({
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              overview: movie.overview,
              release_date: movie.release_date,
            });
          }
        } catch (err) {
          console.error(`Error fetching movie ${movieName}:`, err);
        }
      }
      return movies;
    } catch (err) {
      console.error("Error fetching movies:", err);
      return [];
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    setError("");
    const userMessage = inputValue;
    setInputValue("");

    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', text: userMessage, movies: null }]);
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat`,
        {
          userMessage,
          conversationHistory
        },

        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { response: aiResponse, movies } = response.data;

      const movieCards = movies && movies.length > 0
        ? await fetchMoviesByNames(movies)
        : [];

      // Add AI message to chat with its own movie cards
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse, movies: movieCards }]);

      // Update conversation history (keep only last 3 Q&A)
      const newHistory = [
        ...conversationHistory,
        { userMessage, aiResponse }
      ];
      if (newHistory.length > 3) {
        newHistory.shift();
      }
      setConversationHistory(newHistory);

    } catch (err) {
      setError(err.response?.data?.error || "Помилка при отриманні відповіді");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container ai-chat-page">
      <header className="container-head">
        <div className="top-row">
          <h1 className="logo">AI Рекомендації Фільмів</h1>
          <Link to="/" className="nav-link">На головну</Link>
        </div>
      </header>

      <hr className="divider" />

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && !loading && (
            <div className="chat-welcome">
              <p>👋 Привіт! Розкажи мені, які фільми тобі подобаються, і я рекомендую тобі що-нибудь цікаве!</p>
            </div>
          )}

          {messages.map((message, idx) => (
            <ChatMessage
              key={idx}
              message={message}
            />
          ))}

          {loading && (
            <div className="message ai-message">
              <div className="message-bubble">
                <p>⏳ Думаю...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишіть про ваші переваги до фільмів..."
            rows="3"
            disabled={loading}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={loading || !inputValue.trim()}
          >
            {loading ? "Надсилання..." : "Надіслати"}
          </button>
        </div>
      </div>
    </div>
  );
}
