var request = require('request');
var cheerio = require('cheerio');
var tinygradient = require('tinygradient');
var _ = require('underscore');
var express = require('express');

var airQuality = [
    {
        title: "good",
        range: [0, 50],
        colors: ["#31AF44", "#97CF3D"]
    },
    {
        title: "moderate",
        range: [51, 100],
        colors: ["#97CF3D", "#FEF935"]
    },
    {
        title: "unhealthy for sensitive groups",
        range: [101, 150],
        colors: ["#FEF935", "#F99A24"]
    },
    {
        title: "unhealthy for all",
        range: [151, 200],
        colors: ["#F99A24", "#F72819"]
    },
    {
        title: "very unhealthy",
        range: [201, 300],
        colors: ["#F72819", "#B91B10"]
    },
    {
        title: "hazardous",
        range: [300, 500],
        colors: ["#B91B10", "#B91B10"]
    }
];

var colorArray = [];
_.each(airQuality, function (param) {
    var gradient = tinygradient(param.colors);
    var length = param.range[1] - param.range[0];
    colorArray = colorArray.concat(gradient.rgb(length))
});

var server = express();
server.get('/*', function (req, res) {
    var url = "http://aqicn.org/city/paris/";
    request(url, function (err, result, html) {
        if (err) {
            res.sendStatus(500);
            return console.log(err);
        }
        else {
            var $ = cheerio.load(html);
            try {
                var data = $('.aqivalue');
                data = parseInt(data.html());

                var color = colorArray[data];
                res.status(200).json({
                    level: getAirQuality(data).title,
                    aqi: data,
                    color: color.toRgb()
                })
            }
            catch (e) {
                res.sendStatus(500);
                return console.log(e);
            }
        }
    });
});

function getAirQuality(aqi) {
    return _.find(airQuality, function (quality) {
            return aqi >= quality.range[0] && aqi < quality.range[1]
        }) || {}
}

server.listen(process.env.PORT || 1111);
