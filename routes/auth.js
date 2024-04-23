const { Router } = require('express');
const { JobSeeker } = require('../database/db');
const jwt = require("jsonwebtoken")
const auth = Router();
const Joi = require("joi");
const bcrypt = require('bcryptjs');

require('dotenv').config();


const {hashPassword, comparePassword} = require("../utils/passwordHash");
const { sendEmail_verify, sendEmail_Confirmation } = require('../email/email');


const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().length(11).pattern(/^[0-9]+$/).required()
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
            console.log(error)
            return res.status(400).send({
                success: false,
                messag: error.details[0].message
            });
        }

        // Check if user already exists
        const existingUserByEmail = await JobSeeker.findOne({ email: value.email });

        if (existingUserByEmail) {
            return res.status(400).send({
                success: false,
                message: "Email is already registered"
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(value.password);

        console.log(hashPassword)
        const newUser = new JobSeeker({
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email,
            phone: value.phone,
            passwordHash: hashedPassword,
        });

        const user = await newUser.save();

        const accessToken = jwt.sign({ _id: user.email }, process.env.JWT_SECRET);

        const verifyJwt = jwt.sign({
            id: user.email
        }, process.env.JWT_SECRET);

        const link = `https://wizwork.live/verify?token=${verifyJwt}`;

        await sendEmail_verify({
            email: user.email,
            link: link
        })

        res.json({
            success: true,
            accessToken: accessToken,
            message: "User registered successfully, Please verify your Email!!"
        });

    } catch (err) {
        console.error("Error occurred during registration:", err);
        res.status(500).send("Internal Server Error");
    }
});


auth.post("/verifyAcount", async (req, res) => {
    
    try {
        const token = req.body.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await JobSeeker.findOne({ email: decoded.id });

        if(!user) {
            return res.status(404).send("User not found");
        }

        if (user.isVerified) {
            return res.status(400).send("Account already verified");
        }
        
        user.isVerified = true;

        await user.save();

        await sendEmail_Confirmation({
            email: user.email
        });

        res.json({
            success: true,
            message: "Account verified successfully"
        });

    }
    catch(error) {
            console.error("Error occurred during verification:", error);
            res.status(500).send("Internal Server Error");
    }
})

module.exports = {auth};