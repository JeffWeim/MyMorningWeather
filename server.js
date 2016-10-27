var	request = require('request'),
	path = require('path'),
	express = require('express'),
	app = express(),
	schedule = require('node-schedule'),
	nodemailer = require('nodemailer');
	PORT = process.env.PORT || 8080;

var transporter = transporter = nodemailer.createTransport('smtps://mymorningweather%40gmail.com:MyMorningWeather8899@smtp.gmail.com');


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html')
});

app.get('/startApp', function(request, response) {
	scheduler(function(res) {
		lastObservation = res;
		response.format({
			'text/plain': function(){
			response.send(lastObservation);
		  }
		});
	});
});

app.listen(PORT, function() {
  console.log("Server is up and running on port: " + PORT)
});


function scheduler(callback) {
	schedule.scheduleJob({hour: 7, minute: 00, dayOfWeek: [0, 1, 2, 3, 4, 5, 6]}, sendWeather(callback));
};

function sendWeather(callback) {
	var cbusWeather = 'http://api.wunderground.com/api/299474bc07889c93/conditions/q/OH/Columbus.json';

	request(cbusWeather, function(error, response, data) {

	    var dataJSON = JSON.parse(data),
	    	precipLastHr = dataJSON.current_observation.precip_1hr_in,
	    	tempFarenheit = dataJSON.current_observation.temp_f,
	    	feelsLike = dataJSON.current_observation.feelslike_f,
	    	location = dataJSON.current_observation.display_location.city,
	    	wind = dataJSON.current_observation.wind_mph,
	    	weather = dataJSON.current_observation.weather;

	    if (!error && response.statusCode == 200) {
	    	// Frost Alert Email
	    	if (tempFarenheit <= 38 && precipLastHr >= 0.01) {
			   var body = 'Weather for ' + location + '\n' +
						'☔️ over the last hour has been: ' + precipLastHr  + '\n' +
						'Current 🌡 is: ' + tempFarenheit + '\n' +
						'Currently feels like: ' + feelsLike + '\n' +
						'🍃 is at: ' + wind;

		    	var mailOptions = {
				    from: '"yourself" <mymorningweather@gmail.com>',
				    to: 'jeffreyaweimer@gmail.com',
				    subject: 'Frost Alert ☃',
				    text: body,
				};

				transporter.sendMail(mailOptions, function(error, info){
				    if (error){
				        return console.log(error);
				    }

				    console.log('Message sent: ' + info.response);
				});

			// Standard Email
	    	} else {
	    		var body = 'Weather for ' + location + '\n' +
	    				'Current overall weather: ' + weather + '\n' +
						'Current 🌡 is: ' + tempFarenheit + '\n' +
						'Currently feels like: ' + feelsLike + '\n';

		    	var mailOptions = {
				    from: '"yourself" <mymorningweather@gmail.com>',
				    to: 'jeffreyaweimer@gmail.com',
				    subject: 'Morning Weather ☀️☔️🍃',
				    text: body,
				};

				transporter.sendMail(mailOptions, function(error, info){
				    if (error){
				        return console.log(error);
				    }

				    console.log('Message sent: ' + info.response);
				});

	    	}


	    } else if (error) {
	    	console.log(error);
	    }

	    return callback(dataJSON.current_observation.observation_time);
	});
};