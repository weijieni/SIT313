const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;


const UserDataSchema = new Schema({
	id: String,
	fname: String,
	lname: String,
	mail: {
		type: String,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Invalid email.");
			}
		}
	},
	password: {
		type: String,
		minlength: 8
	},
	cf_password: String,
	address: String,
	city: String,
	state: String,
	country: String,
	poscode: String,
	mobile: {
		type: String,
		minlength: 10,
		maxlength: 10
	},
	resetLink: {
		type: String,
		default:''
	}
});

const Userdata = mongoose.model('userdata', UserDataSchema);

module.exports = Userdata;