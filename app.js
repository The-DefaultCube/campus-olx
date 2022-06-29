/************************/
//
//   Campus OLX
//   m@nish © 2022
//
/************************/
/*----------------------------------------------------------------------------*/
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const path = require("path");
const _ = require("lodash");
/*----------------------------------------------------------------------------*/
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
/*----------------------------------------------------------------------------*/
let port = process.env.PORT;
if (port === null || port === "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Running on Port : "+port)
});
/*----------------------------------------------------------------------------*/
/*-----------------------------DATABASE-------------------------------------*/
// mongoose.connect(
//   "mongodb+srv://admin-blog-website:" +
//     process.env.MONGO_DB_PASSWORD +
//     "@cluster0.ngpc9.mongodb.net/blogWebsiteDB"
// );

mongoose.connect("mongodb://localhost:27017/campusOLX");

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  images: [String];
});

const userSchema = new mongoose.Schema({
  name: String//Stores full name
});

const Post = mongoose.model("Post", postSchema);

/*----------------------------------------------------------------------------*/

/*--------------------------------------------------------------------------*/
/*--------------------------------ROUTES-------------------------------------*/

//Login Page
app.get("/login", (req, res)=>{

});

//HOME PAGE
app.get("/", (req, res)=>{

});

//Profile Page
app.get("/profile", (req,res)=>{

});

//Product Page
app.get("/product/:productId", (req, res)=>{

});

//Selling Page
app.get("/sell", (req, res)=>{

});


