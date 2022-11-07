const express = require("express");
const UserSchema = require("../MongoDB/UserSchema");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();

router.post("/signup", async (req, res) => {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
        return res.status(400).json({
            error: "Invaild value",
            to_fix_error: "Please enter the all fields"
        })
    }
    const find_by_username = await UserSchema.findOne({ username })
    const find_by_email = await UserSchema.findOne({ email })
    if (find_by_username || find_by_email) {
        return res.status(400).json({
            error: "User already exists",
            to_fix_error: "Use another username or email"
        })
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const createUser = await UserSchema.create({
        name,
        username,
        email,
        password: hash
    })
    if (createUser._id) {
        const token = jwt.sign({ id: createUser._id }, process.env.key);
        res.json({
            token,
            status: 200,
            msg: "Successfully created account"
        })
    }
})
router.post("/login", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            error: "Invaild value",
            to_fix_error: "Please enter the all fields"
        })
    }
    const find_by_username = await UserSchema.findOne({ username })
    const find_by_email = await UserSchema.findOne({ email })
    if(!find_by_email||!find_by_username){
        return res.status(400).json({
            error: "User does not exists",
            to_fix_error: "Please create an account first to login"
        })
    }
    const compare_password = bcrypt.compareSync(password, find_by_username.password);
    if(!compare_password){
        return res.status(401).json({
            error: "Invalid password",
            to_fix_error: "Please use a valid password"
        })
    }
    const token = jwt.sign({ id: find_by_username._id }, process.env.key);
        res.json({
            token,
            status: 200,
            msg: "Successfully logged in"
        })
})
router.get("/user", async(req, res)=>{
    const id = req.query.id;
    if(!id){
        return res.status(400).json({
            error:"User id not available",
            to_fix_error:"Please login or create account for a user id"
        })
    }
    const decoded = jwt.verify(id, process.env.key)
    const find_user = await UserSchema.findById(decoded.id);
    if(!find_user){
        return res.status(404).json({
            error:"User not found",
            to_fix_error:""
        })
    }
    res.json({
        user:find_user,
        status: 200
    })
})
module.exports = router