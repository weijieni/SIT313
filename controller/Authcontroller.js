const Userdata = require('../userdata');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const mailgun = require("mailgun-js");

require('dotenv').config();
const DOMAIN = 'sandbox0f696b279e664f5e85e76e3a42f26ba7.mailgun.org'
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});

//register methods
const register = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, function(err, hashedPass){
        if(err) {
            res.json({
                error:err
            })
        }

        const fname = req.body.fname;
        const lname = req.body.lname;
        const mail = req.body.mail;
        const password = req.body.password;
        const cf_password = req.body.cf_password;
        const address = req.body.address;
        const city = req.body.city;
        const state = req.body.state;
        const country = req.body.country;
        const poscode = req.body.poscode;
        const mobile = req.body.mobile;
        const resetLink = "";
    
        const user = new Userdata({
            fname: fname,
            lname: lname,
            mail: mail,
            password: hashedPass,
            cf_password: cf_password,
            address: address,
            city: city,
            state: state,
            country: country,
            poscode: poscode,
            mobile: mobile, 
            resetLink: resetLink
        });

        if (JSON.stringify(req.body.password) != JSON.stringify(cf_password)) {
            res.json({
                message: 'Please confirm your password correctly!'
            })
        }
        
        if (mobile.length != 10) {
            res.json({
                message: 'Please enter 10-digit mobile number.'
            })
        }
    
        // const data = {
        //     members: [{
        //         email_address: mail,
        //         status: "subscribed",
        //         merge_fields:{
        //             FNAME: fname,
        //             LNAME: lname
        //         }
        //     }]
        // };
        // jsonData = JSON.stringify(data);
    
        // const apiKey = "b42ab99c7015dbe167b41cda1672a02c-us17";
        // const list_id = "57ad2f1eed";
        // const url = "https://us17.api.mailchimp.com/3.0/lists/57ad2f1eed";
        // const options = {
        //     method: "POST",
        //     auth: "leo:b42ab99c7015dbe167b41cda1672a02c-us17"
        // };
    
        // const request = https.request(url, options, (response) => {
        //     response.on("data", (data) => {
        //         console.log(JSON.parse(data));
        //     });
        // });
    
        // request.write(jsonData);
        // request.end();

        // const token = jwt.sign({fname,mail,password,cf_password}, process.env.JWT_ACC_ACTIVATE, {expiresIn: '20m'});

        // const data = {
        //     from: 'noreply@hello.com',
        //     to: mail,
        //     subject: 'Account Activation Link',
        //     html: `
        //         <h2>Please follow the link to confirm your email</h2>
        //         <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        //     `
        // };

        // mg.messages().send(data, function (error, body) {
        //     console.log(body);
        // });
            
        user.save();

        res.redirect('/login');
    });
};

//login methods
const login = (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;

    Userdata.findOne({$or: [{mail: username}]})
    .then(user => {
        if(user){
            bcrypt.compare(password, user.password, function(err, result) {
                if (err) {
                    res.json({
                        error:err
                    })
                }
                else if (result) {
                    let token = jwt.sign({name: user.fname}, 'verySecretValue', {expiresIn: '1h'});
                    res.redirect('/iCrowdTasks');
                }
                else
                {
                    res.json({
                        message: 'Password not match.' + JSON.stringify(password) + JSON.stringify(user.cf_password)
                    })
                }
            })

        }
        else
        {
            res.json({
                message:'No user found.'
            })
        }
    });
}

// forgot password
const forgotPassword = (req, res) => {
    const {mail} = req.body;

    Userdata.findOne({$or: [{mail: mail}]}, (err, user) => {
        if (err || !user) {
            return res.status(400).json({error: "User not exist with this email."});
        }

        const token = jwt.sign({mail}, process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'});
        const data = {
            from: 'noreply@hello.com',
            to: mail,
            subject: 'Reset Password',
            html: `
                <h2>Please follow the link to reset your password</h2>
                <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
            `
        };

        return user.updateOne({resetLink: token}, (err, success) => {
            if (err) {
                return res.status(400).json({error: "Reset password link error"});
            } else {
                mg.messages().send(data, function (error, body) {
                    if (error) {
                        return res.json({
                            error: err.message
                        });
                    }
                    return res.json({message: 'Reset email has been sent.'});
                });
            }
        });
    })

    res.redirect('/login');
}
//export module
module.exports = {
    register,login
    ,forgotPassword
}