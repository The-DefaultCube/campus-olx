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
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
/*----------------------------------------------------------------------------*/
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
/*----------------------------------------------------------------------------*/
let port = process.env.PORT;
if (port === null || port === "" || port === undefined) {
  port = 3000;
}
app.listen(port, function () {
  console.log("Running on Port : " + port);
});
/*----------------------------Cloudinary----------------------------------*/
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
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
  imageUrl: String,
});

// const userSchema = new mongoose.Schema({
//   name: String//Stores full name
// });

const Item = mongoose.model("Item", itemSchema);

/*----------------------------------------------------------------------------*/

/*--------------------------------------------------------------------------*/
/*--------------------------------ROUTES-------------------------------------*/

//Login Page
app.get("/login", (req, res) => {});

//HOME PAGE
app.get("/", (req, res) => {
  //try to add filter here
  Item.find({}, (err, foundItems) => {
    if (!err) {
      // console.log(typeof(foundItems[0].price))//number
      res.render("home", { items: foundItems });
    } else console.log("error retrieving all items");
  });
});

//Profile Page
app.get("/profile", (req, res) => {});

//Individual Item Page
app.get("/item/:itemId", (req, res) => {
  const itemId = req.params.itemId;
  //find the item
  Item.findOne({ _id: itemId }, (err, foundItem) => {
    if (!err) {
      if (foundItem) res.render("item", { item: foundItem });
      else res.send("Sorry Item Doesn,t Exist");
    } else {
      console.log("error retrieving item" + err);
      res.send("Sorry Item Doesn,t Exist");
    }
  });
});

//Selling Page
app.get("/sell", (req, res) => {
  res.render("sell");
});

/*--------------------------------------------------------------------------*/
app.post("/sell", (req, res) => {
  //create new item
  if (req.files === null) {
    //save default image url
    const newItem = new Item({
      name: req.body.item_name, //string
      price: req.body.item_price, //number
      description: req.body.item_description, //string
      imageUrl: "https://res.cloudinary.com/dwytcg1ux/image/upload/q_30/v1656751976/campusOLX_items/default_item_x6mw8w.jpg", //string
    });
    newItem.save((error) => {
      if (!error) {
        console.log("Item saved to DB successfully !");
        res.redirect("/");
      } else console.log("Error while saving items to DB");
    });
  } else {
    //save to cloudinary
    const itemImage = req.files.itemImage;
    const itemImageOptions = {
      folder: "campusOLX_items",
      quality: "auto",
      fetch_format: "auto",
      width: 800,
      crop: "scale",
    };
    cloudinary.uploader.upload(
      itemImage.tempFilePath,
      itemImageOptions,
      (err, result) => {
        if (!err) {
          const newItem = new Item({
            name: req.body.item_name, //string
            price: req.body.item_price, //number
            description: req.body.item_description, //string
            imageUrl: result.url,
          });
          newItem.save((error) => {
            if (!error) {
              console.log("Item saved to DB successfully !");
              res.redirect("/");
            } else console.log("Error while saving items to DB");
          });
        } else {
          console.log("error saving to cloudinary");
        }
      }
    );
  }
});

//css class >> abc-def
//post req variables >> abc_def
//js and ejs var >> abcDef

//post request as string only
