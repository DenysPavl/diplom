const User = require('../models/User');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'c85178492d59c53b4fc5c8921eb820e5';

const RecommendationService = {
  async getRecommendations(userId, limit = 12) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const userMovies = {
        favorites: this.normalizeMovieIds(user.favoritelist),
        watched: this.normalizeMovieIds(user.watchedlist),
        planned: this.normalizeMovieIds(user.plannedlist)
      };

      const allUserMovieIds = new Set([
        ...userMovies.favorites,
        ...userMovies.watched,
        ...userMovies.planned
      ]);

      if (allUserMovieIds.size === 0) {
        const movies = await this.getPopularMovies(limit);
        return {
          movies,
          basedOnMovies: [],
          isFallback: true,
          hasMore: movies.length >= limit
        };
      }

      const preferenceData = await this.getUserPreferenceData(Array.from(allUserMovieIds), userMovies);
      const userMovieGenres = preferenceData.genres;
      const topGenres = userMovieGenres.slice(0, 5);

      if (topGenres.length === 0) {
        const movies = await this.getPopularMovies(limit);
        return {
          movies,
          basedOnMovies: preferenceData.basedOnMovies,
          isFallback: true,
          hasMore: movies.length >= limit
        };
      }

      const candidates = await this.fetchCandidateMovies(topGenres, limit, allUserMovieIds.size);
      const scored = await this.scoreMovies(candidates, userMovieGenres, allUserMovieIds);
      const filteredMovies = scored.filter(movie => !allUserMovieIds.has(movie.id));

      const movies = filteredMovies
        .slice(0, limit)
        .map(movie => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids || [],
          overview: movie.overview,
          release_date: movie.release_date
        }));

      return {
        movies,
        basedOnMovies: preferenceData.basedOnMovies,
        isFallback: false,
        hasMore: filteredMovies.length > limit
      };

    } catch (error) {
      console.error('Recommendations error:', error);
      const movies = await this.getPopularMovies(limit);
      return {
        movies,
        basedOnMovies: [],
        isFallback: true,
        hasMore: movies.length >= limit
      };
    }
  },

  normalizeMovieIds(movieIds = []) {
    return movieIds
      .map(movieId => Number(movieId))
      .filter(movieId => Number.isInteger(movieId));
  },

  async getUserPreferenceData(movieIds, userMovies) {
    const genreMap = {};
    const basedOnMovies = [];

    for (const movieId of movieIds.slice(0, 10)) {
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=uk-UA`
        );
        if (!response.ok) continue;

        const movie = await response.json();
        if (movie.genres) {
          movie.genres.forEach(genre => {
            genreMap[genre.id] = (genreMap[genre.id] || 0) + 1;
          });
        }

        basedOnMovies.push({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
          source: this.getMovieSource(movie.id, userMovies),
          genres: movie.genres || []
        });
      } catch (error) {
        console.error(`Error fetching movie ${movieId}:`, error);
      }
    }

    const genres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => parseInt(id));

    return { genres, basedOnMovies };
  },

  getMovieSource(movieId, userMovies) {
    if (userMovies.favorites.includes(movieId)) return 'favorite';
    if (userMovies.watched.includes(movieId)) return 'watched';
    if (userMovies.planned.includes(movieId)) return 'planned';
    return 'unknown';
  },

  async fetchCandidateMovies(genreIds, limit = 12, excludedCount = 0) {
    const candidatesById = new Map();
    const pagesPerGenre = Math.min(
      5,
      Math.max(2, Math.ceil((limit + excludedCount + 20) / (genreIds.length * 20)))
    );

    for (const genreId of genreIds) {
      for (let page = 1; page <= pagesPerGenre; page++) {
        try {
          const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=uk-UA&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&vote_count.gte=50`
          );
          if (!response.ok) continue;

          const data = await response.json();
          (data.results || []).forEach(movie => {
            if (!candidatesById.has(movie.id)) {
              candidatesById.set(movie.id, movie);
            }
          });
        } catch (error) {
          console.error(`Error fetching genre ${genreId}, page ${page}:`, error);
        }
      }
    }

    return Array.from(candidatesById.values());
  },

  async scoreMovies(candidates, userGenres, userMovieIds) {
    return candidates
      .filter(movie => movie.id && !userMovieIds.has(movie.id))
      .map(movie => {
        let score = 0;

        const movieGenres = movie.genre_ids || movie.genres?.map(genre => genre.id) || [];

        if (Array.isArray(movieGenres)) {
          const genreMatches = movieGenres.filter(g => userGenres.includes(g));
          score += genreMatches.length * 10;
        }

        if (movie.vote_average) {
          score += movie.vote_average;
        }

        if (movie.vote_count) {
          score += Math.min(movie.vote_count / 1000, 2);
        }

        const year = movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : 0;
        if (year >= new Date().getFullYear() - 3) {
          score += 1;
        }

        return { ...movie, score };
      })
      .sort((a, b) => b.score - a.score);
  },

  async getPopularMovies(limit) {
    try {
      const movies = [];
      const pagesToFetch = Math.min(5, Math.max(1, Math.ceil(limit / 20)));

      for (let page = 1; page <= pagesToFetch; page++) {
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=uk-UA&page=${page}`
        );
        if (!response.ok) continue;

        const data = await response.json();
        movies.push(...(data.results || []));
      }

      return movies
        .slice(0, limit)
        .map(movie => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids || [],
          overview: movie.overview,
          release_date: movie.release_date
        }));
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  }
};

module.exports = RecommendationService;
