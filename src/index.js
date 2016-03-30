var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var req = require('request');
var _Promise = require('promise');

var LinksClient = require('./LinksClient');
var deps = {
    linksClient: new LinksClient()
};

app.use(express.static(__dirname + '/../.tmp'));

app.use(bodyParser.urlencoded({ extended: false }));  // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                           // parse application/json

// We need to set to 9005 (to match gruntfile - 'grunt serve') but also when using 'node-debug src/index.js'.
// Otherwise, it randomly takes a port which the UI does not expect which prevents debugging from working.
app.set('port', process.env.PORT || 9005);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

app.get('/api/v1/links', function(request, response, next) {
    return deps.linksClient.get()
    .then(function(result) {
        response.json({
            links: result.links
        });
    })
    .catch(next);
});

app.post('/api/v1/links', function(request, response, next) {
    return deps.linksClient.add(request.body.link)
    .then(function(result) {
        if (result && result.errors) {
            response.status(422).send(result);
        } else {
            response.send();
        }
    })
    .catch(next);
});

app.get('/api/v1/title/:url', function(request, response, next) {
    return new _Promise.resolve()
    .then(function () {
        var url = request.params.url;
        req(url, function (error, res, body) {
            if (!error && res.statusCode === 200) {
                var getTitle = /<\s*title[^>]*>\s*(.*)\s*<\s*\/\s*title>/i;
                var matches = getTitle.exec(body);
                if (matches) {
                    return response.json({
                        url: url,
                        title: matches[1]
                    });
                }
            } else {
                console.log('Could not parse title:' + error);
            }
            return response.json({
                url: url,
                title: ''
            });
        });
    })
    .catch(next);
});

module.exports = app;
