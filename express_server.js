const express = require("express");
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt =  require('bcrypt');
//const morgan = require('morgan');
const PORT = process.env.PORT || 8080;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["sessionTest"]
}))

//app.use(cookieParser());
//app.use(morgan('dev'));
app.set("view engine", "ejs");

// Database for the URLs.
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

// Database for the users.
const users = {
  "userID1": {
    id: "userID1",
    email: "user@example.com",
    password: "$2a$10$4r.e4dxdQu0VY2LmMeM5xeNZfgrbz.c.MDrojG9AjMbPGAsY5q/uy"
  },
  "userID2": {
    id: "userID2",
    email: "user2@example.com",
    password: "$2a$10$mQM.DgNpPU8XgBQeJoNzLuVnlXuJUQ/vPiPIW9mZGyhSPxwIc5lsW"
  }
};

// Generates a random ID for new short URLs.
function generateRandomString() {
  const possibleChoices = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";

  for(var i = 0; i <= 5; i++) {
    randomString += possibleChoices.charAt(Math.floor(Math.random() * possibleChoices.length));
  }
  return randomString;
}

// Filters the URLs created per each unique user.
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
  let templateVars = { user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  bcrypt.compareSync(req.body.password, hashedPassword);

  // Tests first if the login email matches an email in the database.
  // Then checks if the password is correct for the email. If worng, status 403 is sent.
  for(let each in users) {
    if (req.body.email === users[each].email)
      if(bcrypt.compareSync(req.body.password, users[each].password)) {
        req.session.user_id = users[each].id;
        console.log(req.session.user_id);
        res.redirect("/urls");
      }
      if(req.body.email === users[each].email && !bcrypt.compareSync(req.body.password, users[each].password)) {
        res.status(403);
        res.send("wrong password");
      }
  }

  res.status(403);
  res.send("Email doesn't exist, please register first.");
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/urls")
  }

  res.render("urls_registration");
});

app.post("/register", (req, res) => {
  if(req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Please enter an email and password.');
  }
  for(let each in users) {
    if(users[each].email === req.body.email) {
      res.status(400);
      res.send('Email exists');
    }
  }
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  // Generates a random userID and sets it to req.session.user_id.
  userId = `userID${generateRandomString()}`;
  users[userId] = { id: userId,
                    email: req.body.email,
                    password: hashedPassword
                  };
  req.session.user_id = userId;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let storedCookie = req.session.user_id;
  let ownUrls = urlsForUser(storedCookie);
  let templateVars = { urls: ownUrls, user: users[req.session.user_id] };

  if(!req.session.user_id) {
    res.send("Please login first to view this page.")
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };

  if(!req.session.user_id) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let longUrlString = req.body.longURL;
  let randomString = generateRandomString();
  urlDatabase[randomString] = {
    shortURL: randomString,
    longURL: `http://${longUrlString}`,
    userId: req.session.user_id
  };

  res.redirect(`urls/${randomString}`);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id, user: users[req.session.user_id] };

  if(req.session.user_id !== urlDatabase[req.params.id].userId) {
    res.send("You are not allowed to view this url.")
  }

  if(!req.session.user_id) {
    res.send("Please login first to view this page.")
  }

  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body['longURL'];
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: `http://${longURL}`,
    userId: req.session.user_id
  };

  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
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