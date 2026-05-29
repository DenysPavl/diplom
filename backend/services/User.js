const User = require('../models/User');

function normalizeMovieId(movieId) {
  const normalizedMovieId = Number(movieId);
  if (!Number.isInteger(normalizedMovieId)) {
    throw new Error('Invalid movieId');
  }
  return normalizedMovieId;
}

function removeMovieId(list = [], movieId) {
  return list.map(Number).filter(id => id !== movieId);
}

function normalizeProfileInput({ username, avatarUrl }) {
  const normalizedUsername = String(username || '').trim();
  const normalizedAvatarUrl = String(avatarUrl || '').trim();

  if (normalizedUsername.length < 2 || normalizedUsername.length > 30) {
    throw new Error('Імʼя користувача має містити від 2 до 30 символів');
  }

  const isRemoteImageUrl = /^https?:\/\/\S+$/i.test(normalizedAvatarUrl);
  const isUploadedImage = /^data:image\/(png|jpe?g);base64,[A-Za-z0-9+/=]+$/i.test(normalizedAvatarUrl);

  if (normalizedAvatarUrl && !isRemoteImageUrl && !isUploadedImage) {
    throw new Error('Аватар має бути JPG або PNG з компʼютера або коректним посиланням на зображення');
  }

  if (isUploadedImage && normalizedAvatarUrl.length > 4 * 1024 * 1024) {
    throw new Error('Файл аватара завеликий. Оберіть JPG або PNG до 3 МБ');
  }

  return {
    username: normalizedUsername,
    avatarUrl: normalizedAvatarUrl,
  };
}

const UserService = {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  },

  async updateProfile(userId, profileData) {
    const { username, avatarUrl } = normalizeProfileInput(profileData);
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      throw new Error('Користувач із таким іменем вже існує');
    }

    user.username = username;
    user.avatarUrl = avatarUrl;
    user.updatedAt = new Date();
    await user.save();

    return user;
  },

  async addToFavorite(userId, movieId) {
    movieId = normalizeMovieId(movieId);
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (!user.favoritelist.includes(movieId)) {
      user.favoritelist.push(movieId);
    }
    if (!user.watchedlist.includes(movieId)) {
      user.watchedlist.push(movieId);
    }
    user.plannedlist = removeMovieId(user.plannedlist, movieId);
    await user.save();
    return user;
  },

  async removeFromFavorite(userId, movieId) {
    movieId = normalizeMovieId(movieId);
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.favoritelist = removeMovieId(user.favoritelist, movieId);
    await user.save();
    return user;
  },

  async addToWatched(userId, movieId) {
    movieId = normalizeMovieId(movieId);
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (!user.watchedlist.includes(movieId)) {
      user.watchedlist.push(movieId);
    }
    user.plannedlist = removeMovieId(user.plannedlist, movieId);
    await user.save();
    return user;
  },

  async removeFromWatched(userId, movieId) {
    movieId = normalizeMovieId(movieId);
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.watchedlist = removeMovieId(user.watchedlist, movieId);
    user.favoritelist = removeMovieId(user.favoritelist, movieId);
    await user.save();
    return user;
  },

  async addToPlanned(userId, movieId) {
    movieId = normalizeMovieId(movieId);
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (!user.plannedlist.includes(movieId)) {
      user.plannedlist.push(movieId);
    }
    user.favoritelist = removeMovieId(user.favoritelist, movieId);
    user.watchedlist = removeMovieId(user.watchedlist, movieId);
    await user.save();
    return user;
  },

  async removeFromPlanned(userId, movieId) {
    movieId = normalizeMovieId(movieId);
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.plannedlist = removeMovieId(user.plannedlist, movieId);
    await user.save();
    return user;
  },

  async getMovieStatus(userId, movieId) {
    movieId = normalizeMovieId(movieId);
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    return {
      isFavorite: user.favoritelist.includes(movieId),
      isWatched: user.watchedlist.includes(movieId),
      isPlanned: user.plannedlist.includes(movieId)
    };
  }
};

module.exports = UserService;
