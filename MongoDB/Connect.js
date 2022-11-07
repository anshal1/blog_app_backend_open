const mongoose = require("mongoose");
require("dotenv").config()
const URI = process.env.uri
const express = require("express");

const Connect =(req, res)=>{
    mongoose.connect(URI, (err)=>{
        if(err){
            return res.json({
                error: "Internal server error",
                status: 500
            })
        } else {
            console.log("Connected to DB");
        }
    })
}
module.exports = Connect;
