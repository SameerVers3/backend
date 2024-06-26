const { Router } = require('express');
const { Recruiter, Company } = require('../database/db');
const jwt = require("jsonwebtoken");
const recruiterAuth = Router();
const Joi = require("joi");
const bcrypt = require('bcryptjs');
const {generateRandomHash} = require("../utils/hash")

require('dotenv').config();

const { hashPassword, comparePassword } = require("../utils/passwordHash");

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    contactNumber: Joi.string().allow(null)
});


recruiterAuth.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await Recruiter.findOne({ email });

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

recruiterAuth.post("/register", async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);

        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Check if user already exists
        const existingUser = await Recruiter.findOne({ email: value.email });

        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: "Email is already registered"
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(value.password);
        
        let id = generateRandomHash(10);
        while (true){
            let eu = await Recruiter.findOne({ email: id });
            if (!eu) {
                break;
            }
            else {
                id = generateRandomHash(10);
            }
        }

        const newUser = new Recruiter({
            name: value.name,
            email: value.email,
            passwordHash: hashedPassword,
            contactNumber: value.contactNumber,
            id: id
        });        
        
        const user = await newUser.save();
        
        const company = new Company({
            id: generateRandomHash(10),
            recruiters: [newUser._id]
        });

        company.save();

        user.companyId = company.id;
        await user.save();

        // Generate JWT token
        const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        res.json({ accessToken });
        
    } catch (err) {
        console.error("Error occurred during registration:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = { recruiterAuth };