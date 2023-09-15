const Tweet = require('../Models/tweetModel.js')
const User = require('../Models/userModel.js')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')


exports.createTweet = catchAsync(async (req, res, next) => {
    req.body.userId = req.user._id
    const newTweet = new Tweet(req.body);
    const savedTweet = await newTweet.save();
    res.status(200).json({
        message:"Success",
        tweet:savedTweet
    });
})
exports.deleteTweet = catchAsync(async (req, res, next) => {
      const tweet = await Tweet.findById(req.params.id);
      if (tweet.userId == req.user._id) {
        await tweet.deleteOne();
        res.status(200).json({status:"Success",message:"Tweet Has been successfully deleted"});
      } else {
        next(new AppError("You are not allowed to delete this tweet as you are not the owner of it",404))
      }
})

exports.updateTweet = catchAsync(async(req,res,next)=>{
  const tweet = await Tweet.findById(req.params.id)
  if(tweet.userId!=req.user._id.toString()){
    res.status(404).json({
      status:"Fail",
      message:"You are not update this delete this tweet"
    })
  }
  const update = await Tweet.findByIdAndUpdate({_id:req.params.id},req.body)
  res.status(200).json({
    status:"Success",
    message:"Tweet has been updated"
  })
})

exports.likeOrDislike = catchAsync(async (req, res, next) => {
      const tweet = await Tweet.findById(req.params.id);
      if (!tweet.likes.includes(req.user._id)) {
        await tweet.updateOne({ $push: { likes: req.user._id } });
        res.status(200).json({
            status:"Success",
            message:"Tweet has been liked"
        });
      } else {
        await tweet.updateOne({ $pull: { likes: req.user._id } });
        res.status(200).json({
            status:"Success",
            message:"Tweet has been disliked"
        });
      }
    
})

exports.getAllTweets = catchAsync(async (req, res, next) => {
    const currentUser = await User.findById(req.user._id);
    const userTweets = await Tweet.find({ userId: currentUser._id });
    const followersTweets = await Promise.all(
      currentUser.following.map((followerId) => {
        return Tweet.find({ userId: followerId });
      })
    );
    const tweets = userTweets.concat(...followersTweets)
    const tweetsArray = []
    for(let i=0;i<tweets.length;i++){
      const user = await User.findById(tweets[i].userId)
      const tweet = {}
      tweet._id = tweets[i]._id
      tweet.userName = user.name
      tweet.userId = user._id
      tweet.description = tweets[i].description
      tweet.likes = tweets[i].likes
      tweet.likesize = tweets[i].likes.length
      tweet.createdAt = tweets[i].createdAt
      tweetsArray.push(tweet)
    }
    tweetsArray.sort(function(x,y){
      return y.createdAt-x.createdAt;
    })
    res.status(200).json({
      status:"Success",
      loggedInusername:req.user.name,
      tweets:tweetsArray
    }); 
})

// export const getUserTweets = async (req, res, next) => {
//   try {
//     const userTweets = await Tweet.find({ userId: req.params.id }).sort({
//       createAt: -1,
//     });

//     res.status(200).json(userTweets);
//   } catch (err) {
//     handleError(500, err);
//   }
// };
// export const getExploreTweets = async (req, res, next) => {
//   try {
//     const getExploreTweets = await Tweet.find({
//       likes: { $exists: true },
//     }).sort({ likes: -1 });

//     res.status(200).json(getExploreTweets);
//   } catch (err) {
//     handleError(500, err);
//   }
// };