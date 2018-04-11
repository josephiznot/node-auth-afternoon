require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const students = require(`${__dirname}/students.json`);

const app = express();
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new Auth0Strategy(
    {
      domain: process.env.DOMAIN,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/login",
      scope: "openid email profile"
    },

    function(accesssToken, refreshToken, extraParams, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) =>
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  })
);

passport.deserializeUser((obj, done) => done(null, obj));

app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: "/students",
    failureRedirect: "/login",
    connection: "github"
  })
);

function authenticated(req, res, next) {
  if (!req.user) {
    res.status(401).send({ message: "UNAUTHORIZED" });
  } else {
    next();
  }
}

app.get("/students", authenticated, (req, res) => {
  res.status(200).send(students);
});
const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
