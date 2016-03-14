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

app.get('/api/v1/links', function(request, response, next) {
    return deps.linksClient.get()
    .then(function(links) {
        for (var i = 0; i < links.links.length; i++) {
            var link = links.links[i];
            link.id = link._id;
        }
        response.json({
            links: links.links
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
