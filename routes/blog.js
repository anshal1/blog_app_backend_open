const express = require("express");
const BlogSchema = require("../MongoDB/BlogSchema");
const UserSchema = require("../MongoDB/UserSchema");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const router = express.Router()
router.post("/create/blog", async (req, res) => {
    const { blog_title, blog_image, blog_content, blogger_id, blog_tag } = req.body;
    if (!blog_content || !blog_title || !blogger_id || !blog_tag) {
        return res.status(400).json({
            error: "Invaild value",
            to_fix_error: "Please enter the all fields"
        })
    }
    const tags = blog_tag.split(",");
    const find_user = await UserSchema.findById(blogger_id);
    if (!find_user) {
        return res.status(404).json({
            error: "User not found",
            to_fix_error: ""
        })
    }
    const create_blog = await BlogSchema.create({
        blog_title,
        blog_image,
        blog_content,
        blogger_id: find_user,
        blog_tag: tags
    })
    res.json({
        msg: "Your blog has been created",
        status: 200
    })
})
router.get("/all/blog", async (req, res) => {
    let limit = req.query.limit;
    let page = req.query.page;
    const user = req.query.user_id;
    let nextpage = true;
    const decoded = jwt.verify(user, process.env.key)
    if (user) {
        const find_user = await UserSchema.findById(decoded.id);
        if (!find_user) {
            return res.status(404).json({
                error: "User not found",
                to_fix_error: ""
            })
        }
        const all_blog = await BlogSchema.find({}).limit(limit).skip(limit * (page - 1));
        if (all_blog.length < 1) {
            return res.status({
                error: "No blogs found",
                to_fix_error: ""
            })
        }
        const filter = all_blog.filter((blog) => {
            return !blog.this_blog_is_blocked_by_some_user.includes(find_user._id);
        })
        if (filter.length !== parseInt(limit)) {
            nextpage = false
        } else if (filter.length === parseInt(limit)) {
            const all_blog = await BlogSchema.find({}).limit(1).skip(limit * page);
            if (all_blog.length < 1) {
                nextpage = false
            }
        }
        res.json({
            status: 200,
            result_len: filter.length,
            nextpage,
            blog: filter,
        })
    } else {
        const all_blog = await BlogSchema.find({}).limit(limit).skip(limit * (page - 1));
        if (all_blog.length !== parseInt(limit)) {
            nextpage = false
        } else if (all_blog.length === parseInt(limit)) {
            const for_next_page = await BlogSchema.find({}).limit(1).skip(limit * page);
            if (for_next_page.length < 1) {
                nextpage = false
            }
        }
        res.json({
            status: 200,
            result_len: all_blog.length,
            nextpage,
            blog: all_blog,
        })
    }
})
router.delete("/delete/blog", async (req, res) => {
    const id = req.query.blog_id;
    const user = req.query.user_id;
    const decoded = jwt.verify(user, process.env.key)
    if (!id || !user) {
        return res.status(401).json({
            error: "Unauthorized action",
            to_fix_error: ""
        })
    }
    const find_blog = await BlogSchema.findById(id);
    if (!find_blog) {
        return res.status(401).json({
            error: "Blog not found",
            to_fix_error: ""
        })
    }
    if (find_blog.blogger_id._id.toString() !== decoded.id) {
        return res.status(401).json({
            error: "Unauthorized action",
            to_fix_error: ""
        })
    }
    const Deleted_blog = await BlogSchema.findByIdAndDelete(id);
    res.json({
        msg: "Deleted",
        blog_that_got_deleted: Deleted_blog
    })
})
router.put("/like/blog/:id", async (req, res) => {
    const id = req.params.id;
    const user = req.query.user_id
    if (!user) {
        return res.status(400).json({
            error: "User not Found",
            to_fix_error: "Login or create an account first"
        })
    }
    const decoded = jwt.verify(user, process.env.key)
    const find_user = await UserSchema.findById(decoded.id);
    if (!find_user) {
        return res.status(400).json({
            error: "User not Found",
            to_fix_error: "Login or create an account first"
        })
    }
    const find_blog = await BlogSchema.findById(id);
    if (!find_blog) {
        return res.status(401).json({
            error: "Blog not found",
            to_fix_error: ""
        })
    }
    const liked_blog = await BlogSchema.findByIdAndUpdate(id, { $push: { like: { liker: find_user } } }, { new: true })
    res.json({
        liked: liked_blog,
        status: 200,
    })
})
router.put("/unlike/blog/:id", async (req, res) => {
    const id = req.params.id;
    const user = req.query.user_id
    if (!user) {
        return res.status(400).json({
            error: "User not Found",
            to_fix_error: "Login or create an account first"
        })
    }
    const decoded = jwt.verify(user, process.env.key)
    const find_user = await UserSchema.findById(decoded.id);
    if (!find_user) {
        return res.status(400).json({
            error: "User not Found",
            to_fix_error: "Login or create an account first"
        })
    }
    const find_blog = await BlogSchema.findById(id);
    if (!find_blog) {
        return res.status(401).json({
            error: "Blog not found",
            to_fix_error: ""
        })
    }
    const dislike = await BlogSchema.findByIdAndUpdate(id, { $pull: { like: { liker: find_user } } }, { new: true });
    res.json({
        status: 200,
        dislike
    })
})
router.post("/specific/blog", async (req, res) => {
    const id = req.query.blog_id;
    const user = req.query.user_id;
    const find_blog = await BlogSchema.findById(id);
    if (!find_blog) {
        return res.status(401).json({
            error: "Blog not found",
            to_fix_error: ""
        })
    }
    const decoded = jwt.verify(user, process.env.key)
    const find_user = await UserSchema.findById(decoded.id);
    if (!find_user) {
        return res.status(400).json({
            error: "User not Found",
            to_fix_error: "Login or create an account first"
        })
    }
    const random = Math.random() * 4
    const save_tag = await UserSchema.findByIdAndUpdate(user, { $push: { usually_blog_type_read: find_blog.blog_tag[Math.floor(random)] } });
    res.json({ blog: find_blog, user_requested: find_user._id })
})
router.get("/related/blog", async (req, res) => {
    const tags = req.query.tags;
    let limit = 4;
    const alltags = tags.split(",");
    const random = Math.random() * 4
    const find_blog = await BlogSchema.find({ blog_tag: alltags[Math.floor(random)] }).limit(limit);
    if (!find_blog) {
        return
    }
    res.json({
        find_blog,
    })
})
router.post("/user/related/blog", async(req, res)=>{
    let limit = req.query.limit;
    let page = req.query.page;
    const user = req.query.user_id;
    const decoded = jwt.verify(user, process.env.key)
    const find_user = await UserSchema.findById(decoded.id);
    if(!find_user){
        return res.status(404).json({
            error:"No user found",
            to_fix_error:"Please login or create account",
        })
    }
    const random = Math.random() * 4
    const find_blog = await BlogSchema.find({ blog_tag: find_user.usually_blog_type_read[Math.floor(random)] }).limit(limit).skip(limit * (page-1));
    res.json({
        tags_used: find_user.usually_blog_type_read,
        user_related_blog:true,
        blog:find_blog
    })
})
module.exports = router;