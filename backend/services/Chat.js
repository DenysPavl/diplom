const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = 'gemini-3-flash-preview';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'c85178492d59c53b4fc5c8921eb820e5';
const CHAT_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    response: {
      type: SchemaType.STRING,
      description: 'A helpful Ukrainian-language answer for the user.',
    },
    movies: {
      type: SchemaType.ARRAY,
      description: 'Movie titles discussed or recommended in this exact answer.',
      items: {
        type: SchemaType.STRING,
      },
    },
  },
  required: ['response', 'movies'],
};

function getCurrentDateContext() {
  const now = new Date();

  return {
    currentDate: new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(now),
    currentYear: new Intl.DateTimeFormat('uk-UA', {
      timeZone: 'Europe/Kyiv',
      year: 'numeric',
    }).format(now),
  };
}

function getMovieSearchQueries(message) {
  const normalizedMessage = message
    .replace(/[«»"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const queries = new Set();
  const quotedMatches = message.match(/[«"']([^«»"']{2,80})[»"']/g) || [];

  quotedMatches.forEach((match) => {
    queries.add(match.replace(/[«»"']/g, '').trim());
  });

  const movieNameMatch = normalizedMessage.match(/(?:фільм(?:і|у|ом|а)?|film|movie)\s+(.+)$/i);
  if (movieNameMatch?.[1]) {
    queries.add(
      movieNameMatch[1]
        .replace(/^(про|about|що|what|йдеться|розкажи|скажи)\s+/i, '')
        .replace(/[?!.,:;]+$/g, '')
        .trim()
    );
  }

  queries.add(
    normalizedMessage
      .replace(/^(про що йдеться у|про що|розкажи про|що таке|what is|tell me about)\s+/i, '')
      .replace(/(?:фільм(?:і|у|ом|а)?|film|movie)\s+/i, '')
      .replace(/[?!.,:;]+$/g, '')
      .trim()
  );

  return Array.from(queries)
    .map((query) => query.trim())
    .filter((query) => query.length >= 2)
    .slice(0, 4);
}

async function searchTmdbMovies(query) {
  const moviesById = new Map();

  for (const language of ['uk-UA', 'en-US']) {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query,
      language,
      include_adult: 'false',
    });
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?${params.toString()}`);

    if (!response.ok) continue;

    const data = await response.json();
    (data.results || []).slice(0, 3).forEach((movie) => {
      const currentMovie = moviesById.get(movie.id);
      moviesById.set(movie.id, {
        title: currentMovie?.title || movie.title,
        original_title: movie.original_title,
        release_date: movie.release_date,
        overview: currentMovie?.overview || movie.overview,
        vote_average: movie.vote_average,
      });
    });
  }

  return Array.from(moviesById.values()).slice(0, 3);
}

async function getTmdbContext(userMessage) {
  const movies = await getTmdbMoviesForMessage(userMessage);
  return formatTmdbContext(movies);
}

async function getTmdbMoviesForMessage(userMessage) {
  const queries = getMovieSearchQueries(userMessage);
  const moviesByTitle = new Map();

  for (const query of queries) {
    try {
      const movies = await searchTmdbMovies(query);
      movies.forEach((movie) => {
        const key = `${movie.title}-${movie.release_date}`;
        if (!moviesByTitle.has(key)) moviesByTitle.set(key, movie);
      });
    } catch (error) {
      console.error(`TMDB search error for "${query}":`, error);
    }
  }

  return Array.from(moviesByTitle.values()).slice(0, 5);
}

function formatTmdbContext(movies) {
  if (movies.length === 0) return '';

  return `\n\nTMDB context for movies that may be mentioned in the user's latest message. Use this as factual source of truth when relevant:\n${movies
    .map((movie, index) => {
      const year = movie.release_date ? movie.release_date.slice(0, 4) : 'unknown year';
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'no rating';
      return `${index + 1}. ${movie.title} (${year}; original title: ${movie.original_title}; rating: ${rating}). Overview: ${movie.overview || 'No overview available.'}`;
    })
    .join('\n')}`;
}

function buildTmdbFallbackResponse(userMessage, tmdbMovies) {
  const mainMovie = tmdbMovies[0];

  if (!mainMovie) {
    return {
      response: 'Не знайшов достатньо даних про цей фільм у TMDB. Спробуйте написати точнішу назву або оригінальну англійську назву фільму.',
      movies: [],
    };
  }

  const year = mainMovie.release_date ? mainMovie.release_date.slice(0, 4) : '';
  const titleWithYear = year ? `${mainMovie.title} (${year})` : mainMovie.title;
  const overview = mainMovie.overview || 'У TMDB поки немає детального опису цього фільму українською.';
  const asksAboutComparison = /схож|порівн|старіш|класичн/i.test(userMessage);
  const comparisonNote = asksAboutComparison
    ? 'Щодо порівняння зі старішим фільмом: у знайдених даних TMDB немає надійної інформації, з якою саме стрічкою його порівнюють, тому краще уточнити назву або джерело порівняння.'
    : '';

  return {
    response: `Знайшов у TMDB фільм «${titleWithYear}». ${overview}${comparisonNote ? ` ${comparisonNote}` : ''}`,
    movies: [mainMovie.title],
  };
}

function normalizeJsonText(text) {
  const trimmedText = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
  const firstBraceIndex = trimmedText.indexOf('{');
  const lastBraceIndex = trimmedText.lastIndexOf('}');

  if (firstBraceIndex !== -1 && lastBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
    return trimmedText.slice(firstBraceIndex, lastBraceIndex + 1);
  }

  return trimmedText;
}

function escapeControlCharactersInJsonStrings(jsonText) {
  let result = '';
  let insideString = false;
  let escaped = false;

  for (const char of jsonText) {
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      insideString = !insideString;
      result += char;
      continue;
    }

    if (insideString && char === '\n') {
      result += '\\n';
      continue;
    }

    if (insideString && char === '\r') {
      result += '\\r';
      continue;
    }

    if (insideString && char === '\t') {
      result += '\\t';
      continue;
    }

    result += char;
  }

  return result;
}

function parseMoviesFallback(text) {
  const moviesMatch = text.match(/"movies"\s*:\s*\[([\s\S]*?)\]/i);
  if (!moviesMatch) return [];

  return Array.from(moviesMatch[1].matchAll(/"([^"]+)"/g)).map((match) => match[1]);
}

function parseResponseFallback(text) {
  const normalizedText = normalizeJsonText(text);
  const responseMatch = normalizedText.match(/"response"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"movies"|",\s*"movies"|$)/i);

  if (!responseMatch?.[1]) {
    return normalizedText;
  }

  return responseMatch[1]
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .trim();
}

function parseAiResponse(responseText) {
  const normalizedText = normalizeJsonText(responseText);
  const candidates = [
    normalizedText,
    escapeControlCharactersInJsonStrings(normalizedText),
  ];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      // Try the next parser strategy.
    }
  }

  if (process.env.DEBUG_AI_RESPONSE === 'true') {
    console.warn(`AI returned malformed JSON. Response length: ${responseText.length}`);
  }

  const fallbackResponse = parseResponseFallback(responseText);
  const fallbackMovies = parseMoviesFallback(responseText);

  if (fallbackResponse.length >= 120 && /[.!?…]$/.test(fallbackResponse)) {
    return {
      response: fallbackResponse,
      movies: fallbackMovies,
    };
  }

  return null;
}

const ChatService = {
  async sendMessage(userMessage, conversationHistory = []) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not set in environment variables');
      }

      const { currentDate, currentYear } = getCurrentDateContext();
      const tmdbMovies = await getTmdbMoviesForMessage(userMessage);
      const tmdbContext = formatTmdbContext(tmdbMovies);
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: `You are a movie recommendation AI assistant for a Ukrainian-language movie app.
The current date is ${currentDate}. The current year is ${currentYear}.
Always answer only in Ukrainian, regardless of the user's language or the movie title language.
Do not say that the current year is any year other than ${currentYear}.
When a user describes what they like or asks a question, provide a helpful response in 2-3 short sentences.
Recommend 3-5 specific movies when recommendations are relevant.
If TMDB context is provided, use it to answer about recent movies or movies named by the user.
The "movies" array should contain 0-5 titles that were discussed or recommended in this exact response.
Return movie titles in the language most likely to be found by TMDB search, preferably Ukrainian localized titles when they are common.
Return only the structured JSON object that matches the configured response schema.`,
      });

      let conversationContext = '';

      for (const item of conversationHistory || []) {
        if (item.userMessage) conversationContext += `User: ${item.userMessage}\n`;
        if (item.aiResponse) conversationContext += `Assistant: ${item.aiResponse}\n`;
      }

      conversationContext += `${tmdbContext}\n\nUser: ${userMessage}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: conversationContext }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
          responseSchema: CHAT_RESPONSE_SCHEMA,
        },
      });

      const responseText = result.response?.text?.() || result.response?.text || '';

      if (!responseText) {
        throw new Error('Empty response from AI model');
      }

      const parsedResponse = parseAiResponse(responseText) || buildTmdbFallbackResponse(userMessage, tmdbMovies);

      return {
        response: parsedResponse.response || responseText,
        movies: Array.isArray(parsedResponse.movies) ? parsedResponse.movies : [],
        error: null,
      };
    } catch (error) {
      console.error('Chat service error:', error);

      let errorMessage = 'Не вдалося обробити ваш запит.';
      if (error.status === 429 || error.message.includes('429')) {
        errorMessage = 'Сервер перевантажений або вичерпано ліміт запитів. Будь ласка, зачекайте хвилину і спробуйте знову.';
      }

      return {
        response: null,
        movies: [],
        error: errorMessage,
      };
    }
  },
};

module.exports = ChatService;
