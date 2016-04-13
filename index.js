var express = require('express')
var ciscospark = require('ciscospark')
var bodyParser = require('body-parser');
var sha1 = require('sha1');
var winston = require('winston');
var morgan = require('morgan');
var http = require('http');


var secretKey = process.env.SPARKY_SECRET_KEY || "badpassword"

var app = express();

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/ping',  function(req, res){
    res.end("pong")
});

app.post('/join',  function(req, res){
    params = req.body
    if (params.email && params.roomId && params.sha1)
    {
            var hash = sha1(params.email+" "+params.roomId+" "+secretKey)

            if (hash == params.sha1)

                ciscospark.memberships.create({
                        personEmail: params.email,
                        roomId: params.roomId
                })
                .then(function(membership) {
                    if (membership)
                    {
                        res.sendStatus(200)
                        winston.debug('memebership created: \n'+ JSON.stringify(membership,null,2));

                    }
                    else
                    {
                        res.sendStatus(400)
                        winston.error('Membership creation error: \n'+ JSON.stringify(params,null,2));

                    }
                })
                .catch(function(e){
                    res.sendStatus(400)
                    winston.error('Membership creation error: \n'+ JSON.stringify(params,null,2)+"\n"+JSON.stringify(e,null,2));

                })
            else {
                res.sendStatus(422)
                winston.error('Hash does not match: \n'+ JSON.stringify(params,null,2));

            }

    }
    else {
        res.sendStatus(422)
        winston.error('Invalid parameters: \n'+ JSON.stringify(params,null,2));
    }
});

http.createServer(app).listen(3002);