const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const Client = require("instagram-private-api").IgApiClient;

let session;

const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.resolve(__dirname, "..", "front/build")));
const ig = new Client();

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/login", async (req, res) => {
  const { login, password } = req.body;
  ig.state.generateDevice(login);
  await ig.simulate.preLoginFlow();
  session = await ig.account.login(login, password);
  process.nextTick(async () => await ig.simulate.postLoginFlow());
  res.sendStatus(200);
});

app.get("/logoff", (req, res) => {
  session = null;
  res.sendStatus(200);
});

app.post("/follow", async (req, res) => {
  if (!session) {
    res.send("Authentication Error");
    return;
  }
  const accounts = JSON.parse(req.body.accounts);
  accounts.map(async account => {
    await ig.friendship.create(account);
  });
  res.sendStatus(200);
});

app.get("/search", async (req, res) => {
  if (!session) {
    res.send("Authentication Error");
    return;
  }
  const { users } = await ig.user.search(req.query.account);
  res.send(
    JSON.stringify(
      users.map(account => ({
        username: account.username,
        id: account.pk,
        follow: false
      }))
    )
  );
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "front/build", "index.html"));
});

app.listen(1337);
