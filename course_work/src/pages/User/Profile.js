import axios from "axios";
import MovieCart from "../../components/WishlistMovieCard";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '../../styles/profile.css'

export default function Profile({ token, setToken }) {
  const navigate = useNavigate();
  const profileCardRef = useRef(null);
  const [user, setUser] = useState(null);
  const [moviesData, setMoviesData] = useState({
    favorite: [],
    watched: [],
    planned: [],
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState({
    username: "",
    avatarUrl: "",
  });
  const [activeMovieTab, setActiveMovieTab] = useState("favorite");

const API_KEY = 'c85178492d59c53b4fc5c8921eb820e5';

  useEffect(() => {
    axios.get(`http://localhost:8001/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        setUser(res.data);
        setProfileForm({
          username: res.data.username || "",
          avatarUrl: res.data.avatarUrl || "",
        });

        const loadMovies = async (ids) => {
          const results = [];

          for (const id of ids) {
            try {
              const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=uk-UA`);
              results.push(res.data);
            } catch (err) {
              console.log(`Фільм з ID ${id} не знайдено або виникла помилка`);
            }
          }

          return results;
        };

        const [fav, watched, planned] = await Promise.all([
          loadMovies(res.data.favoritelist),
          loadMovies(res.data.watchedlist),
          loadMovies(res.data.plannedlist),
        ]);

        setMoviesData({
          favorite: fav.filter(Boolean),
          watched: watched.filter(Boolean),
          planned: planned.filter(Boolean),
        });

        setLoading(false);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Помилка автентифікації");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setToken(null);
    navigate('/');
  };

  const handleEditProfile = () => {
    setProfileError("");
    setProfileForm({
      username: user.username || "",
      avatarUrl: user.avatarUrl || "",
    });
    setIsEditing(true);
    setTimeout(() => {
      profileCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleCancelEdit = () => {
    setProfileError("");
    setProfileForm({
      username: user.username || "",
      avatarUrl: user.avatarUrl || "",
    });
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    setSavingProfile(true);

    try {
      const res = await axios.put(
        "http://localhost:8001/api/profile",
        profileForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data);
      setProfileForm({
        username: res.data.username || "",
        avatarUrl: res.data.avatarUrl || "",
      });
      setIsEditing(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Не вдалося оновити профіль");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setProfileError("Оберіть файл JPG або PNG");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setProfileError("Файл аватара завеликий. Максимум 3 МБ");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileError("");
      setProfileForm(prev => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.onerror = () => {
      setProfileError("Не вдалося прочитати файл аватара");
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const movieTabs = [
    {
      key: "favorite",
      label: "Улюблені",
      title: "Улюблені фільми",
      emptyText: "Немає улюблених фільмів",
    },
    {
      key: "watched",
      label: "Переглянуті",
      title: "Переглянуті фільми",
      emptyText: "Нічого не переглянуто",
    },
    {
      key: "planned",
      label: "В планах",
      title: "Заплановані до перегляду",
      emptyText: "Поки що пусто",
    },
  ];
  const activeMovieSection = movieTabs.find(tab => tab.key === activeMovieTab) || movieTabs[0];
  const activeMovies = moviesData[activeMovieSection.key] || [];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Мій профіль</h1>
        <Link to="/" className="back-button">
          На головну
        </Link>
      </div>

      <div className="profile-card" ref={profileCardRef}>
        <div className="profile-avatar">
          <div className="avatar-circle">
            {(isEditing ? profileForm.avatarUrl : user.avatarUrl) ? (
              <img src={isEditing ? profileForm.avatarUrl : user.avatarUrl} alt={user.username} />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <span className="info-label">Ім'я користувача:</span>
            {isEditing ? (
              <input
                className="profile-input"
                value={profileForm.username}
                onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                maxLength="30"
              />
            ) : (
              <span className="info-value">{user.username}</span>
            )}
          </div>

          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user.email}</span>
          </div>

          {isEditing && (
            <div className="info-row">
              <span className="info-label">Аватар:</span>
              <div className="avatar-upload">
                <label className="avatar-upload-button">
                  Обрати JPG/PNG
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleAvatarFileChange}
                  />
                </label>
                {profileForm.avatarUrl && (
                  <button
                    type="button"
                    className="avatar-remove-button"
                    onClick={() => setProfileForm(prev => ({ ...prev, avatarUrl: "" }))}
                  >
                    Прибрати аватар
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="info-row">
            <span className="info-label">Ролі:</span>
            <div className="roles-container">
              {user.roles.map((role, index) => (
                <span key={index} className="role-badge">
                  {role}
                </span>
              ))}
            </div>
          </div>

          {profileError && <div className="profile-error">{profileError}</div>}

          <div className="profile-card-actions">
            {isEditing ? (
              <>
                <button className="action-button edit-button" onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? "Збереження..." : "Зберегти"}
                </button>
                <button className="action-button cancel-button" onClick={handleCancelEdit} disabled={savingProfile}>
                  Скасувати
                </button>
              </>
            ) : (
              <button className="action-button edit-button" onClick={handleEditProfile}>Редагувати профіль</button>
            )}
          </div>
        </div>
      </div>

      <div className="movie-sections">
        <div className="movie-tabs" role="tablist" aria-label="Списки фільмів">
          {movieTabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              className={`movie-tab ${activeMovieTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveMovieTab(tab.key)}
            >
              {tab.label}
              <span>{moviesData[tab.key].length}</span>
            </button>
          ))}
        </div>

        <div className="movie-section">
          <h3>{activeMovieSection.title}</h3>
          {activeMovies.length > 0 ? (
            <ul className="cards profile-movie-cards">
              {activeMovies.map((movie) => (
                <MovieCart key={movie.id} movie={movie} />
              ))}
            </ul>
          ) : (
            <p>{activeMovieSection.emptyText}</p>
          )}
        </div>
      </div>

      <div className="profile-actions">
        <button className="action-button logout-button" onClick={handleLogout}>Вийти з акаунту</button>
      </div>
    </div>
  );
}
