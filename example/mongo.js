const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CourseSchema = new Schema({
	id: {
		type: Number,
		max: true,
		required: true,
	},
	name: {
		type: String,
	},
});

const SchoolsSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	userId: {
		type: String,
		required: true,
		ref: 'Users',
	},
},{
	timestamps: true // Enable timestamps
});

const TrainersSchema = new Schema({
	id: {
		type: Number,
		required: true,
	},
	name: {
		type: String,
	},
	user: {
		type: String,
	},
	count: {
		type: String,
	},
	level: {
		type: String,
	},
	courseId: {
		type: Number,
		required: true,
		ref: 'Course',
	},
});

const UsersSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
	},
	email: {
		type: String,
		max: true,
	},
});