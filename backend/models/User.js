const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  roles: [String],
  comments: [mongoose.Schema.Types.ObjectId],
  favoritelist: [Number],
  watchedlist: [Number],
  plannedlist: [Number],
  createdAt: [Date],
  updatedAt: Date,
  _v: Number,
  token: String
});

module.exports = mongoose.model('User', userSchema);
