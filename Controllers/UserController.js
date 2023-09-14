const User = require('../Models/userModel')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')


exports.signUp = catchAsync(async(req,res,next)=>{
    const newUser = await User.create(req.body)
    const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
    res.status(201).json({
        message:"Success",
        token:token,
        body:newUser
    }) 
})

exports.login = catchAsync(async(req,res,next)=>{
    const email = req.body.email
    console.log(req.body)
    const pass = req.body.password
    console.log(pass)
    if(!email ||!pass){
        return next(new AppError('Please send the emailId and password to the api',400))
    }
    const user = await User.findOne({email})
    if(!user){
        return next(new AppError('Please check your EmaiId',400)) 
    }
    const isValidPass = await bcrypt.compare(pass,user.password)
    if(isValidPass){
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
            expiresIn:process.env.JWT_EXPIRES_IN
        })
        res.status(200).json({
            message:"Login Success",
            token:token,
            role:user.role,
            userId:user._id
        })
    }else{
        return next(new AppError('Incorrect EmaiId or Password',400))
    }
})

exports.follow = catchAsync(async (req, res, next) => {
      const user = await User.findById(req.params.id);
      console.log(user)
      const currentUser = await User.findById(req.user._id);
  
      if (!user.followers.includes(req.user._id)) {
        await user.updateOne({
          $push: { followers: req.user._id }
        });
        await currentUser.updateOne({ $push: { following: req.params.id } });
      } else {
        res.status(403).json({
            Status:"Fail",
            message:"you already follow this user"
        });
      }
      res.status(200).json({
        Status:"Success",
        message:"Following the user"
      });
    
})
  exports.unFollow = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (currentUser.following.includes(req.params.id)) {
      await user.updateOne({
        $pull: { followers: req.user._id },
      });

      await currentUser.updateOne({ $pull: { following: req.params.id } });
    } else {
      res.status(403).json({
          Status:"Fail",
          message:"you are not following this user"
      });
    }
    res.status(200).json({
      Status:"Success",
      message:"Unfollowing the user"
    });
})
exports.allUsers = catchAsync(async(req,res,next)=>{
    const users = await User.find()
    const userArray = [];
    for(let i=0;i<users.length;i++){
    
        if(users[i]._id!=req.user._id.toString()){
            if(users[i].followers.includes(req.user._id.toString())){
                const user  = {}
                user.userName = users[i].name
                user._id = users[i]._id
                user.isFollowing = true
                userArray.push(user)
            }else{
                const user  = {}
                user.userName = users[i].name
                user._id = users[i]._id
                user.isFollowing = false
                userArray.push(user)
            }
        }
    }
    res.status(200).json({
        status:"Success",
        users:userArray
    })
})

exports.protect = catchAsync(async(req,res,next)=>{
        let token
        if(req.headers.authorization){
            // getting the token
            token =  req.headers.authorization
            console.log(typeof(token))
            console.log(token)
            // verifying the token
            const decoded = await jwt.verify(token,process.env.JWT_SECRET)
            console.log(decoded)
            // checking user exists
            const user = await User.findById(decoded.id)
            if(!user){
                return next(new AppError('User No Longer Exists',404))
            }
            req.user  = user
        }
        if(!token){
            return next(new AppError('You are not logged In',404))
        }
    next();
})

exports.restrictTo = (...roles)=>{ 
    return (req,res,next)=>{
            if(!roles.includes(req.user.role)){
                console.log("no permission to access this route")
                return next(new AppError('You do not have permission to this route',404))
            }
        next();
    }
}