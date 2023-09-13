const mongoose = require('mongoose')

const TweetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      defaultValue: [],
    }
  },
  { timestamps: true }
);
const Tweet = mongoose.model('Twwet',TweetSchema)

module.exports = Tweet
