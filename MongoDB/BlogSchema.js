const mongoose = require("mongoose");
const {Schema} = mongoose;

const Blog = new Schema({
    blog_title:{
        type:String,
        required:true
    },
    blog_image:{
        type:String
    },
    blog_content:{
        type:String,
        required:true
    },
    blogger_id:{
        type:Object,
        required:true
    },
    blog_tag:{
        type:Array,
        required:true
    },
    // If some user has blocked this specific blog
    this_blog_is_blocked_by_some_user:[{type:String}],
    report:[{
        reason_for_report:{
            type:String,
            required:true
        }
    }],
    like:[{liker:{
        type:Object
    }}],
    comment:[{
        comment_body:{
            type:String,
            required: true
        },
        comment_by:{
            type:Object,
            required:true
        }
    }]
})

module.exports = mongoose.model("blogs", Blog);