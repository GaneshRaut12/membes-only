const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
let passport = require("passport");

mongoose
  .connect("mongodb://localhost:27017/ganesh-db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connection succesful"))
  .catch((err) => console.log(err));

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);
app.use(passport.initialize());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// app.use(session)
app.use(passport.initialize());
// app.use(passport.session());

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/style", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "style.css"));
});
app.get("/home-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.post("/register-user", (req, res) => {
  console.log(req.body);
  let { name, password, phoneNumber, confrimPassword, email } = req.body;
  console.log(name, password, confrimPassword, phoneNumber);
  let error;
  if (!name || !password || !confrimPassword || !phoneNumber || !email) {
    error = "Please Enter All Field Details";
    res.send(
      `<h1>${error}</h1> <br/> <br/> <button><a href="/">Go Back To  Form</a></button>`
    );
  }

  if (password != confrimPassword) {
    error = "Please Enter Correct Confirm Password";
    res.send(
      `<h1>${error}</h1> <br/> <br/> <button><a href="/">Go Back To  Form</a></button>`
    );
  }

  if (typeof error == "undefined") {
    User.findOne({ email: email }, function (err, data) {
      if (err) {
        throw err;
      }
      if (data) {
        console.log("User Exist");
        error = " User Exist with this Email id";
        res.send(
          `<h1>${error}</h1> <br/> <br/> <button><a href="/">Go Back To  Form</a></button>`
        );
      } else {
        bcrypt.hash(10, (plaintext, ) => {
          if (err) {
            throw err;
          }

          password = hash;
          User({
            name,
            phoneNumber,
            email,
            password,
          }).save((err, data) => {
            if (err) {
              throw err;
            }
            res.sendFile(path.join(__dirname, "public", "login.html"));
          });
        });
      }
    });
  }
});

// authenticatioin start
const LocalStrategy = require("passport-local").Strategy;
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email }, (err, data) => {
      if (err) throw err;
      if (!data) {
        return done(null, false, { message: "User Doesn't Exist !" });
      }
      console.log(data);
      console.log(password);
      console.log(data.password);
      bcrypt.compare(password, data.password, (err, match) => {
        if (err) {
          console.log("error");
          return done(null, false);
        }
        console.log('match data',match);
        if (!match) {
          console.log("not match");
          return done(null, false, { message: "Password Doesn't match !" });
        }
        if (match) {
          console.log("match ");
          console.log("MATCHING DATA", data);
          return done(null, match);
        }
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  console.log("login succesful");
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  console.log("login unsuccesful");
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// app.use(passport.session());
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.post("/login-user", (req, res, next) => {
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/home-page",
  })(req, res, next);
});

app.listen(3500, () => {
  console.log("Server running pn PORT 3000");
});
