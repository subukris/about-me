/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

var bodyParser = require('body-parser');

var userinfo = require('./config/user.json');

var http_host = (process.env.VCAP_APP_HOST || '0.0.0.0');
var http_port = (process.env.VCAP_APP_PORT || 7000);

// create a new express server
var app = express();
app.set('port', http_port);
app.set('host', http_host);

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
    //console.log('this is a get for >>> ' +  resource);

});

app.post('/v1/messages', function(req, res) {
    res.send('Received your message');
    console.log(JSON.stringify(req.body));
});

var server = app.listen(app.get('port'), app.get('host'), function() {
    console.log('Express server listening on ' + server.address().address + ':' + server.address().port);
});
