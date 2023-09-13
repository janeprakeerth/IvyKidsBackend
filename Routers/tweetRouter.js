const express = require('express')
const morgan = require('morgan')
const app = express()
const usercontroller = require('../Controllers/UserController')
const tweetcontroller = require('../Controllers/tweetController')

const router = express.Router()

app.use(morgan('dev'))
app.use(express.json())


router.post("/",usercontroller.protect, tweetcontroller.createTweet);
// router.delete("/:id",usercontroller.protect, deleteTweet);
// router.put("/:id/like",usercontroller.protect,likeOrDislike);
// router.get("/timeline/:id",usercontroller.protect,getAllTweets);
// router.get("/user/all/:id",usercontroller.protect, getUserTweets);
// router.get("/explore", getExploreTweets);

module.exports = router