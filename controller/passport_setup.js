const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const HttpsProxyAgent = require('https-proxy-agent');


passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

var gStrategy = new GoogleStrategy({
    clientID: "359313887580-3qpvj37j2ate1u3priplrtb914052kt1.apps.googleusercontent.com",
    clientSecret: "GDXhdHfEf6SCAxy-aCqlkP-y",
    callbackURL: "http://localhost:4000/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      return done(null, profile);
  }
);

// As my laptop has an https proxy so I have to add https proxy agent to obtain access token
// It might not working on your site
// Please comment line 27 and 28 while running the app in yours
const agent = new HttpsProxyAgent(process.env.HTTP_PROXY || "http://127.0.0.1:1087");
gStrategy._oauth2.setAgent(agent);

passport.use(gStrategy);
