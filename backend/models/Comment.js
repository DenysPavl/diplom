const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  rating: Number,
  text: { type: String, required: true },
  authorId: mongoose.Schema.Types.ObjectId,
  movieId: Number,
  authorName: String,
  createdAt: [Date],
  updatedAt: Date,
  _v: Number
});

module.exports = mongoose.model('Comment', commentSchema);
