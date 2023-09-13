const mongoose = require('mongoose')
const validator = require('validator')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        validate:[validator.isEmail]
    },
    password:{
        type:String,
        required:true,
        minlength:8,
    },
    followers: { 
        type: Array,
        defaultValue: [] 
    },
    following: { 
        type: Array, 
        defaultValue: [] 
    }
},
{timestamps:true}
)



userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password = await bcrypt.hash(this.password,12)
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User