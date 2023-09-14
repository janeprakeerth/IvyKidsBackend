const express = require('express')
const morgan = require('morgan')
const app = express()
const usercontroller = require('../Controllers/UserController')

const router = express.Router()

app.use(morgan('dev'))
app.use(express.json())

router.post('/signUp',usercontroller.signUp)
router.post('/login',usercontroller.login)
router.put("/follow/:id", usercontroller.protect, usercontroller.follow);
router.put("/unfollow/:id", usercontroller.protect, usercontroller.unFollow);
router.get("/allUsers",usercontroller.protect,usercontroller.allUsers)
module.exports = router