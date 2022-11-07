const mongoose = require("mongoose");
const {Schema} = mongoose;

const User = new Schema({
    name:{
        type: String,
        required: true,
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    profile:{
        type:String
    },
    follower:[{type: String}],
    following:[{type: String}],
    // This show which ,which blog channel has user subscribed
    this_user_subscribed_to:[{type: String}],
    blocked:[{type: String}],
    usually_blog_type_read:[{type: String}],
    // this shows how many users have subscribed to this user blog channel
    other_user_subscribed_to:[{type:String}]
})
module.exports = mongoose.model("users", User);