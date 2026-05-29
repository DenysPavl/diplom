const Comment = require('../models/Comment');
const User = require('../models/User');

const CommentsService = {
  async addComment(userId, movieId, text, rating) {
    const user = await User.findById(userId);
    const comment = new Comment({
      text,
      rating,
      authorId: userId,
      movieId,
      authorName: user.username
    });
    await comment.save();
    user.comments.push(comment._id);
    await user.save();
    return comment;
  },

  async getCommentsByMovie(movieId) {
    const comments = await Comment.find({ movieId });
    return comments;
  },

  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }
    await Comment.findByIdAndDelete(commentId);
    const user = await User.findById(userId);
    user.comments = user.comments.filter(id => id.toString() !== commentId.toString());
    await user.save();
    return { message: 'Comment deleted' };
  }
};

module.exports = CommentsService;
