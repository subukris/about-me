/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

var bodyParser = require('body-parser');

var userinfo = require('./config/user.json');
var credentials = require('./config/creds.json');

//var sendgrid = require('sendgrid')(credentials.sendgrid.username, credentials.sendgrid.password);
var sendgrid = require('sendgrid')("zBZi6UezfX", "NIYtUDn2XC3j5825");

var http_host = (process.env.VCAP_APP_HOST || '0.0.0.0');
var http_port = (process.env.VCAP_APP_PORT || 7000);

// create a new express server
var app = express();
app.set('port', http_port);
app.set('host', http_host);

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

var USER_ACCESS_TOKEN = userinfo.accessToken;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    accessToken = req.query.api_key;
    //console.log("accessToken >> " + accessToken);
    if (USER_ACCESS_TOKEN === accessToken)
        next();

    else
        res.status(401).send("Access denied");

});

app.get('/v1/:resource', function(req, res) {
    var resource = req.params.resource;
    if (userinfo[resource]) {
        res.json(userinfo[resource]);
    } else {
        res.sendStatus(404);
    }

});

function _validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function _validateInput(body) {
    return body.sender && _validateEmail(body.sender) && body.body;
}

app.post('/v1/messages', function(req, res) {
    if (_validateInput(req.body)) {
        sendgrid.send({
            to: userinfo.email,
            from: 'noreply@subuapi.mybluemix.net',
            subject: 'Message from API user',
            text: req.body
        }, function(err, obj) {
            if (err) {
                console.error(err);
                res.status(500).send("Sending message failed due to internal error. Try again after some time");
            } else {
		res.send('Message sent successfully');
	    }

        });

    } else {
        res.status(400).send("Missing or invalid input. Sender should be a valid email id and body should not be undefined");
    }
});

var server = app.listen(app.get('port'), app.get('host'), function() {
    console.log('Express server listening on ' + server.address().address + ':' + server.address().port);
});
