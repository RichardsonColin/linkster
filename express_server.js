const express = require("express");
const bodyParser = require("body-parser");
var PORT = process.env.PORT || 8080; // default port 8080

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  const possibleChoices = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for(var i = 0; i <= 5; i++) {
    randomString += possibleChoices.charAt(Math.floor(Math.random() * possibleChoices.length));
  }
  return randomString;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post("/urls", (req, res) => {
  console.log(req.body.longURL);  // debug statement to see POST parameters
  let longUrlString = req.body.longURL;
  let randomString = generateRandomString();
  urlDatabase[randomString] = `http://${longUrlString}`;
  res.redirect(`urls/${randomString}`);         // Respond with 'Ok' (we will replace this)
});
app.post("/urls/:id/delete", (req, res) => {
  //let templateVarsTwo = { urls: urlDatabase };
  const shortUrlDelete = req.params['id'];
  //console.log(shortUrlDelete);
  delete urlDatabase[shortUrlDelete];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});