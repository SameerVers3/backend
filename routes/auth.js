const { Router } = require('express');
const { JobSeeker } = require('../database/db');
const jwt = require("jsonwebtoken")
const auth = Router();
const Joi = require("joi");
const bcrypt = require('bcryptjs');

require('dotenv').config();


const {hashPassword, comparePassword} = require("../utils/passwordHash")


const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    username: Joi.string().min(3).max(10).required()
});

auth.post('/login', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user;
        if (username) {
            // If username is provided, find user by username
            user = await JobSeeker.findOne({ username });
        } else if (email) {
            // If email is provided, find user by email
            user = await JobSeeker.findOne({ email });
        } else {
            // If neither username nor email is provided, return error
            return res.status(400).json({ error: "Username or email is required" });
        }

        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare passwords
        const isPasswordValid = await comparePassword(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Create and send JWT token
        const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.json({ accessToken });
    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

auth.post("/register", async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Check if user already exists
        const existingUserByEmail = await JobSeeker.findOne({ email: value.email });
        const existingUserByUsername = await JobSeeker.findOne({ username: value.username });

        if (existingUserByEmail) {
            return res.status(400).send("Email is already registered");
        }

        if (existingUserByUsername) {
            return res.status(400).send("Username is already taken");
        }

        console.log("registyering")

        // Hash the password
        const hashedPassword = await hashPassword(value.password);

        console.log(hashPassword)
        const newUser = new JobSeeker({
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email,
            phone: value.phone,
            passwordHash: hashedPassword,
            username: value.username
        });

        const user = await newUser.save();

        console.log(process.env.JWT_SECRET)
        const accessToken = jwt.sign({ _id: user.username }, process.env.JWT_SECRET);

        console.log("done")
        res.json({ accessToken });
    } catch (err) {
        console.error("Error occurred during registration:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = {auth};