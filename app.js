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
  sellerId: String,
  sellerName: String,
  creationTime: String,
  comments: [{commenter: String, comment: String}],
});
const Item = mongoose.model("Item", itemSchema);

//Users------------------------------------------
const userSchema = new mongoose.Schema({
  outlookId: String,
  email: String,
  name: String,
  //custom values that user can edit
  profileImg: String,
  course: String,
  department: String,
  currentYear: String,
  hostelName: String,
  roomNo: String,
  contactNo: String,
  wishlist: [String],
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
    //added filter here
    const filter = [
      "name",
      "price",
      "description",
      "imageUrl",
      "sellerName",
      "creationTime",
    ];
    Item.find({}, filter, { sort: { _id: -1 } }, (err, foundItems) => {
      if (!err) {
        // console.log(typeof(foundItems[0].price))//number
        // foundItems.sort()
        // console.log(foundItems);
        res.render("home", { items: foundItems, user: req.user });
      } else console.log("error retrieving all items");
    });
  } else {
    res.redirect("/login");
  }
});

//User Profile Page --DONE
//http://localhost:3000/profile/62c1f4b03b96af3ae421f087
app.get("/profile/:profileId", (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.params.profileId;
    let userItems = [];
    //see if user has any items on sell
    const filter = [
      "name",
      "price",
      "description",
      "imageUrl",
      "sellerName",
      "creationTime",
    ];

    User.findOne({ _id: userId }, (err, foundUser) => {
      if (!err) {
        if (foundUser) {
          Item.find(
            { sellerId: userId },
            filter,
            { sort: { _id: -1 } },
            (err, foundItems) => {
              if (!err && foundItems) {
                userItems = foundItems;
                res.render("profile", {
                  user: foundUser,
                  items: userItems,
                });
              } else {
                console.log("no items on sale by user : " + userId);
                res.render("profile", { user: foundUser, items: userItems });
              }
            }
          );
        } else {
          res.send("User not exixt");
        }
      } else {
        res.send("User Not Found");
        console.log(err);
      }
    });
  } else {
    res.redirect("/login");
  }
});

//Profile Edit Page --DONE
app.get("/editprofile", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("editprofile", { name: req.user.name, email: req.user.email });
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
        //find its seller
        let seller = { name: "none", email: "none@123", _id: "123456", contactNo: "987654321" };
        // console.log(foundItem.sellerId);
        User.findOne(
          { _id: foundItem.sellerId },
          ["name", "email","contactNo"],
          (err, foundSeller) => {
            if (!err && foundSeller) {
              // console.log(seller);
              if (foundItem) {
                let mark_as_sold = (req.user.email==foundSeller.email)?(true):(false);
                // console.log(req.user._id + " "+ foundSeller._id + " "+mark_as_sold);
                let alreadyInWishlist = req.user.wishlist.includes(itemId);
                res.render("item", {
                  item: foundItem,
                  itemSeller: foundSeller,
                  markAsSold: mark_as_sold,
                  fill: alreadyInWishlist 
                });
              } else {
                res.send("Sorry Item Doesn't Exist");
              }
            } else {
              console.log("Couldn't find seller");
              res.render("item", { item: foundItem, itemSeller: seller, markAsSold: false, fill: false });
            }
          }
        );
      } else {
        console.log("error retrieving item :" + err);
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

app.get("/wishlist", (req, res) => {
  if (req.isAuthenticated()) {
    let users_wishlist = req.user.wishlist;
    // console.log(users_wishlist);
    // let users_wishlist = ["62c203989a8e8b20c1a33590"];
    //query acc to array
    Item.find({ _id: { $in: users_wishlist } }, (err, foundItems) => {
      // console.log(foundItems);
      if (!err) res.render("wishlist", { items: foundItems });
      else console.log("Error in wishlist");
    });
  } else {
    res.redirect("/login");
  }
});

/*--------------------------------------------------------------------------*/
//Sell Items --DONE
app.post("/sell", (req, res) => {
  //create new item
  //add user who posted and date/time of post
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
      sellerId: req.user.id,
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
            sellerId: req.user.id,
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

//Edit user profile --DONE
app.post("/editprofile", (req, res) => {
  userId = req.user.id;
  //find by id in batabase and update
  // console.log(req.body);
  User.findOne({ _id: userId }, (err, foundUser) => {
    if (!err && foundUser) {
      foundUser.course = req.body.course;
      foundUser.department = req.body.department;
      foundUser.currentYear = req.body.current_year;
      foundUser.hostelName = req.body.hostel_name;
      foundUser.roomNo = req.body.room_no;
      foundUser.contactNo = req.body.contact_no;
      foundUser.save((error) => {
        if (!error) {
          console.log("details updated successfully");
          res.redirect("/profile/" + userId);
        } else {
          console.log("Couldn't Update Profile");
          res.redirect("/editprofile");
        }
      });
    } else {
      res.redirect("/editprofile");
    }
  });
});

//logout --DONE
app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/filter", (req, res) => {
  const min = parseInt(req.body.min, 10);
  const max = parseInt(req.body.max, 10);
  const curr_user = req.user;
  if (min > max) {
    res.redirect("/");
  } else {
    //find querry
    const filter = [
      "name",
      "price",
      "description",
      "imageUrl",
      "sellerName",
      "creationTime",
    ];
    Item.find(
      { price: { $gte: min, $lte: max } },
      filter,
      { sort: { _id: -1 } },
      (err, foundItems) => {
        if (!err) {
          res.render("home", { items: foundItems, user: curr_user });
        } else console.log("error retrieving filtered items");
      }
    );
  }
});

app.post("/sold/:itemId", (req, res)=>{
  const itemId = req.params.itemId;
  Item.findByIdAndDelete(itemId, (err)=>{
    if(!err){
      res.redirect('/');
    }
    else{
      console.log("unable to delete item");
      res.redirect('/item/'+itemId);
    }

  })
})

//comments
app.post("/comment/:itemId", (req,res)=>{
  const comm = {commenter: req.user.name, comment: req.body.comment};
  // {commenter: String, comment: String}
  const itemId = req.params.itemId;
  Item.findOne({_id: itemId},(err, foundItem)=>{
    if(!err && foundItem){
      foundItem.comments.push(comm);
      foundItem.save((err)=>{
        if(!err){
          res.redirect("/item/"+itemId);
        }
      })
    }
  })

});

//edit user wishlist 
app.post("/wishlist/:itemId",(req,res)=>{
  const itemId = req.params.itemId;
  const userId = req.user._id;
  User.findOne({_id: userId}, (err, foundUser)=>{
    if(!err && foundUser){
      const rm = foundUser.wishlist.indexOf(itemId);
      if(rm > -1){
        //delete and save
        foundUser.wishlist.splice(rm,1);
        foundUser.save((error)=>{
          if(!error){
            res.redirect("/item/"+itemId);
          }
        })
      }else{
        //add and save
        foundUser.wishlist.push(itemId);
        foundUser.save((error)=>{
          if(!error){
            res.redirect("/item/"+itemId);
          }
        });
      }
    }else {
      res.send("error adding to wishlist");
    }
  });
});
