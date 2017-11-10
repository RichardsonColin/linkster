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
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userId: "userID1"
  },
  "9sm5xk": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userId: "userID2"
  }
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

function urlsForUser(id) {
  let userUrls = {};

  for(let each in urlDatabase) {
    if(id === urlDatabase[each].userId) {
      userUrls[each] = {
        shortURL: urlDatabase[each].shortURL,
        longURL: urlDatabase[each].longURL,
        userId: id
      };
    }
  }
  return userUrls;
}

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  //console.log(users);
  res.render('urls_login', templateVars);
});
app.post("/login", (req, res) => {
  // Add different for email and password.
  for(let each in users) {
    if (req.body.email === users[each].email)
      if(req.body.password === users[each].password) {
        res.cookie('user_id', users[each].id);
        res.redirect("/");
      }
  }
    res.status(403);
    res.send('Wrong password and email');

})
app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.cookies['user_id']);
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
  for(let each in users) {
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
  let ownUrls = urlsForUser(req.cookies['user_id']);
  let templateVars = { urls: ownUrls, user: users[req.cookies['user_id']] };

  if(!req.cookies['user_id']) {
    res.send("Please login first to view this page.")
  }

  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  if(req.cookies['user_id'] === undefined) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  //console.log(req.body.longURL);  // debug statement to see POST parameters
  let longUrlString = req.body.longURL;
  let randomString = generateRandomString();
  urlDatabase[randomString] = {
    shortURL: randomString,
    longURL: `http://${longUrlString}`,
    userId: req.cookies['user_id']
  };
  res.redirect(`urls/${randomString}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id, user: users[req.cookies['user_id']] };

  if(!req.cookies['user_id']) {
    res.send("Please login first to view this page.")
  }
  if(req.params.id === urlDatabase[req.params.id].shortURL){
    if(req.cookies['user_id'] !== urlDatabase[req.params.id].userId) {
      res.send("You are not allowed to view this url.")
    }
  }

  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body['longURL'];
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: `http://${longURL}`,
    userId: req.cookies['user_id']
  };
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