<h1 align="center">
🛍 Campus OLX
</h1>
<p align="center">
MongoDB, Express, EJS, Node.js
</p>

> Campus OLX is an online platform that allows users to buy and sell old items within the campus.

## 📺 Live Demo
This project is deployed on [Heroku](https://iitg-campus-olx.herokuapp.com/) or
Check out its Working Proof [here.](https://drive.google.com/file/d/1iIIowl7md2BPDr3LZegH_OXWRtx97-CZ/view?usp=sharing)

## 🕵️‍♀️ About the Project
Project description

## 🧩 Main Features
* Home Page listing all items currently on sale.
* Authentication using Outlook OAuth.
* Filtering items by its price range.
* Adding and removing items to/from wishlist.
* Othe features include :
    * Option to post comments.
    * Seller Info page.
    * Option to mark item as sold by the seller.
    * Making an offer to the seller using whatsapp.

## 💻 TechStack Used
* [MongoDB](https://www.mongodb.com/)
* [Express](https://expressjs.com/)
* [EJS](https://ejs.co/)
* [Node.js](https://nodejs.org/en/)
* HTML
* CSS
* JavaScript

## ⭐ Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)^16.15.1
- [MongoDB](https://www.mongodb.com/try/download/community)^5.0

### Installation
 
 ```sh
 $ git clone https://github.com/The-DefaultCube/campus-olx/
 $ cd campus-olx
 $ npm i
 ```
### Environment Variables
1. Register app in application registration potal for [authentication.](https://www.passportjs.org/packages/passport-outlook/) 
2. Register on [Cloudinary](https://cloudinary.com/) for handling image uploads.
3. Create a `.env` file and add the following :
```js
CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
CLOUDINARY_API_KEY="YOUR_CLOUDINARY_API_KEY" 
CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_API_SECRET"
OUTLOOK_CLIENT_ID="YOUR_OUTLOOK_CLIENT_ID"
OUTLOOK_CLIENT_SECRET="YOUR_OUTLOOK_CLIENT_SECRET"
EXPRESS_SESSION_SECRET="YOUR_EXPRESS_SESSION_SECRET"
MONGO_DB_PASSWORD="YOUR_MONGO_DB_PASSWORD"
```

## 🖼️ Screen-shots


## 📩 Contact
- Contact me : manish0307kumar@gmail.com
- Project Link : https://github.com/The-DefaultCube/campus-olx/


## 🙏 Thanks :)
```js
if ( youLovedProject() ) {
 starIt();
}
```
