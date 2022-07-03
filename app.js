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
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const OutlookStrategy = require("passport-outlook").Strategy;
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
/*-----------------------------SESSIONS-------------------------------------*/
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/*-----------------------------DATABASE-------------------------------------*/
// mongoose.connect(
//   "mongodb+srv://admin-blog-website:" +
//     process.env.MONGO_DB_PASSWORD +
//     "@cluster0.ngpc9.mongodb.net/blogWebsiteDB"
// );

mongoose.connect("mongodb://localhost:27017/campusOLX");

//Items------------------------------------------
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  imageUrl: String,
  sellerName: String,
  creationTime: String,
});
const Item = mongoose.model("Item", itemSchema);

//Users------------------------------------------
const userSchema = new mongoose.Schema({
  outlookId: String,
  email: String,
  name: String,
  //custom values that user can edit
  course: String,
  department: String,
  hostelName: String,
  roomNo: String,
  profileImg: String,
  contactNo: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new OutlookStrategy(
    {
      clientID: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/outlook/olxclone", ////////////////////////////////////////////////////////////////////
      passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, profile, done) {
      // console.log(profile);
      let user = {
        outlookId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        // accessToken: accessToken,
      };

      User.findOrCreate(user, function (err, user) {
        return done(err, user);
      });
    }
  )
);

/*------------------------------AUTHENTICATE---------------------------------*/
app.get(
  "/auth/outlook",
  passport.authenticate("windowslive", {
    scope: [
      "openid",
      "profile",
      "offline_access",
      "https://outlook.office.com/Mail.Read", //Disabling this throws error :|
    ],
  })
);

app.get(
  "/auth/outlook/olxclone", ///////////////////////////////////////////////////////////////////////////////////////////////////
  passport.authenticate("windowslive", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

/*--------------------------------------------------------------------------*/
/*--------------------------------ROUTES-------------------------------------*/

//Login Page --DONE
app.get("/login", (req, res) => {
  res.render("login");
});

//HOME PAGE --DONE
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    //try to add filter here
    Item.find({}, (err, foundItems) => {
      if (!err) {
        // console.log(typeof(foundItems[0].price))//number
        res.render("home", { items: foundItems });
      } else console.log("error retrieving all items");
    });
  } else {
    res.redirect("/login");
  }
});

//User Profile Page
app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("profile");
  } else {
    res.redirect("/login");
  }
});

//Individual Item Page --DONE
app.get("/item/:itemId", (req, res) => {
  const itemId = req.params.itemId;
  //find the item
  if (req.isAuthenticated()) {
    Item.findOne({ _id: itemId }, (err, foundItem) => {
      if (!err) {
        if (foundItem) res.render("item", { item: foundItem });
        else res.send("Sorry Item Doesn,t Exist");
      } else {
        console.log("error retrieving item" + err);
        res.send("Sorry Item Doesn,t Exist");
      }
    });
  } else {
    res.redirect("/login");
  }
});

//Selling Page --DONE
app.get("/sell", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("sell");
  } else {
    res.redirect("/login");
  }
});

/*--------------------------------------------------------------------------*/
app.post("/sell", (req, res) => {
  //create new item
  //add user who posted ans date/time of post
  // console.log(req.user);
  const _now = new Date();
  const options = {
    weekday: "long",
    month: "long",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  };
  const item_creation_time = _now.toLocaleDateString(undefined, options);

  console.log(item_creation_time);
  if (req.files === null) {
    //save default image url
    const newItem = new Item({
      name: req.body.item_name, //string
      price: req.body.item_price, //number
      description: req.body.item_description, //string
      imageUrl:
        "https://res.cloudinary.com/dwytcg1ux/image/upload/q_30/v1656751976/campusOLX_items/default_item_x6mw8w.jpg", //string
      sellerName: req.user.name,
      creationTime: item_creation_time,
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
            sellerName: req.user.name,
            creationTime: item_creation_time,
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
