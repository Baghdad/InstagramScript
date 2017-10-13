var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var Client = require('instagram-private-api').V1;

var device;
var storage;
var login;
var password;

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/ping', (req, res) => {
  res.send(req.body);
});

app.post('/login', function (req, res) {
    login = req.body.login;
    password = req.body.password;
    device = new Client.Device(login);
    storage = new Client.CookieFileStorage('./cookies/' + login + '.json');
        Client.Session.create(device, storage, login, password)
            .then(function () {
                res.send('OK');
            })
            .catch(Client.Exceptions.AuthenticationError, function () {
                res.send('Authentication Error');
                login = "";
                password = "";
                device = null;
                storage = null;
            })
});

app.get('/logoff', function (req, res) {
    login = "";
    password = "";
    device = null;
    storage = null;
    res.send('OK');
});

app.post('/follow', function (req, res) {
    if (device == null || storage == null) {
        res.send("Authentication Error");
        return;
    }
	var accounts = JSON.parse(req.body.accounts);
    Client.Session.create(device, storage, login, password)
        .then(function(session) {
			accounts.forEach(function(element) {
				Client.Relationship.create(session, element)
			})
        })
		.then(function() {
			res.send("OK");
		})
});

app.get('/search', function (req, res) {
    if (device == null || storage == null) {
        res.send("Authentication Error");
        return;
    }
    Client.Session.create(device, storage, login, password)
        .then(function (session) {
            return Client.Account.search(session, req.query.account);
        })
        .then(function (accounts) {
            var result = [];
            accounts.forEach(function (element) {
                result.push({username: element.params.username, id: element.params.id, follow: false});
            });
            res.send(JSON.stringify(result));
        })
});

app.listen(1337);

