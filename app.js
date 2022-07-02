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
if (port === null || port === "" || port === undefined) {
  port = 3000;
}
app.listen(port, function () {
  console.log("Running on Port : " + port);
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
  Item.findOne({_id: itemId}, (err, foundItem)=>{
    if(!err)
    {
      if(foundItem)
        res.render("item", {item: foundItem});
      else
        res.send("Sorry Item Doesn,t Exist");
    }
    else
    {
      console.log("error retrieving item"+err);
      res.send("Sorry Item Doesn,t Exist"); 
    }
  })
});

//Selling Page
app.get("/sell", (req, res) => {
  res.render("sell");
});

/*--------------------------------------------------------------------------*/
app.post("/sell", (req, res) => {
  //create new item
  // console.log(typeof(req.body.item_price));//string
  const newItem = new Item({
    name: req.body.item_name, //string
    price: req.body.item_price, //number
    description: req.body.item_description, //string
  });

  newItem.save((err) => {
    if (!err) {
      console.log("Item saved to DB successfully !");
      res.redirect("/");
    } else console.log("Error while saving items to DB");
  });
});

//css class >> abc-def
//post req variables >> abc_def
//js and ejs var >> abcDef

//post request as string only