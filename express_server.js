const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
//const morgan = require('morgan');
const PORT = process.env.PORT || 8080; // default port 8080

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//app.use(morgan('dev'));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userID1": {
    id: "userID1",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "userID2": {
    id: "userID2",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  const possibleChoices = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";

  for(var i = 0; i <= 5; i++) {
    randomString += possibleChoices.charAt(Math.floor(Math.random() * possibleChoices.length));
  }
  return randomString;
}



app.post("/login", (req, res) => {
  res.cookie('userId', req.body.user_id);
  res.redirect("/urls");
})
app.post("/logout", (req, res) => {
  res.clearCookie('userId', req.cookies.user_id);
  console.log(req.cookies);
  res.redirect("/urls");
});
app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/register", (req, res) => {
  res.render("urls_registration");
});
app.post("/register", (req, res) => {
  if(req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('None shall pass');
  }
  for(each in users) {
    if(users[each].email === req.body.email) {
      res.status(400);
      res.send('Email exists');
    }
  }

  userId = `userID${generateRandomString()}`;
  users[userId] = { id: userId,
                    email: req.body.email,
                    password: req.body.password
                  };
  res.cookie('user_id', userId);
  res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  //console.log(req);
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  //console.log(req.body.longURL);  // debug statement to see POST parameters
  let longUrlString = req.body.longURL;
  let randomString = generateRandomString();
  urlDatabase[randomString] = `http://${longUrlString}`;
  res.redirect(`urls/${randomString}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body['longURL'];
  urlDatabase[shortURL] = `http://${longURL}`;
  res.redirect("/urls");
});
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  let templateVars = { urls: urlDatabase };
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req, res) => {
  const shortUrlDelete = req.params['id'];
  delete urlDatabase[shortUrlDelete];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});