const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const AuthRoute = require('./routes/auth');
const Userdata = require('./userdata');
const AuthController = require('./controller/Authcontroller');
const e = require('express');
const app = express();
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./controller/passport_setup');
require('dotenv').config();


mongoose.connect("mongodb://localhost/iCrowdTaskDB", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieSession({
	name: 'CrowdServer-session',
	keys: ['key1', 'key2']
}));


app.get('/', (req, res) => {
	res.sendFile(__dirname + "/login.html");
});

app.get('/register', (req, res) => {
	res.sendFile(__dirname + "/register.html");
});

app.get('/iCrowdTasks', (req, res) => {
	res.sendFile(__dirname + "/iCrowdTasks.html");
});

app.get('/forgot_password', (req, res) => {
	res.sendFile(__dirname + "/forgot_password.html");
});


app.get('/logout', (req, res) => {
	req.session = null;
	req.logout();
	res.redirect('/login');
})

app.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/iCrowdTasks');
  });

app.route('/task')
.get((req, res) => {
	Userdata.find((err, userdata) => {
		if (err) {res.send(err);}
		else {res.send(userdata);}
	})
})
.post((req, res) => {
	const user = new Userdata({
		id: req.body.id,
		fname: req.body.fname,
		lname: req.body.lname,
		mail: req.body.mail,
		password: req.body.password,
		cf_password: req.body.cf_password,
		address: req.body.address,
		city: req.body.city,
		state: req.body.state,
		country: req.body.country,
		poscode: req.body.poscode,
		mobile: req.body.mobile
	});
	user.save((err) => {
		if (err) {res.send(err);}
		else {res.send('Successfully added a worker!')}
	})

})
.delete((req, res) => {
	Userdata.deleteMany((err) => {
		if (err) {res.send(err);}
		else {res.send('Successfully delete all workers.');}
	})
});

app.route('/task/:id')
.get((req, res) => {
	Userdata.findOne({id: req.params.id}, (err, foundWorker) => {
		if (!err) (res.send(foundWorker))
		else res.send("No match worker with this id.")
	});
})
.put((req, res) => {
	Userdata.update({id: req.params.id}, 
		{
			id: req.params.id,
			fname: req.body.fname,
			lname: req.body.lname,
			mail: req.body.mail,
			password: req.body.password,
			cf_password: req.body.cf_password,
			address: req.body.address,
			city: req.body.city,
			state: req.body.state,
			country: req.body.country,
			poscode: req.body.poscode,
			mobile: req.body.mobile
		}, {overwrite: true}, 
		(err) => {
			if (err) {res.send(err);}
			else res.send("Worker information updated!");
		});
})
.patch((req, res) => {
	Userdata.update(
		{id: req.params.id},
		{$set: req.body},
		(err) => {
			if (err) {res.send(err);}
			else res.send("Successfully updated!");
		}
	)
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}
app.listen(port, (req, res) => {
	console.log("Listening for request...");
});

app.use('/', AuthRoute);



