const { Router } = require('express');
const { JobSeeker } = require('../database/db');
const jwt = require("jsonwebtoken")
const auth = Router();
const Joi = require("joi");
const bcrypt = require('bcryptjs');

require('dotenv').config();

const frontend_url = process.env.FRONTEND_URL;

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
    const { email, password } = req.body;


    console.log(email);
    console.log(password);

    try {
        let user;
        if (email) {
            // If email is provided, find user by email
            user = await JobSeeker.findOne({ email });
        } else {
            // If neither username nor email is provided, return error
            return res.status(400).json({
                success: false,
                message: "email is required"
            });
        }

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare passwords
        const isPasswordValid = await comparePassword(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false, 
                message: "Invalid password"
            });
        }

        // Create and send JWT token
        const accessToken = jwt.sign({ _id: user.email }, process.env.JWT_SECRET);
        res.json({
            success: true,
            accessToken, 
            email: user.email,
            jobSeeker: true,
            admin: false,
            userData: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber
            },
            message: "Login successful"
        });

    } catch (error) {
        console.error("Error occurred during login:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
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
        value.email = value.email.toLowerCase();
        // Check if user already exists
        const existingUserByEmail = await JobSeeker.findOne({ email: value.email });

        if (existingUserByEmail && !existingUserByEmail.isVerified) {

            const accessToken = jwt.sign({ _id: value.email }, process.env.JWT_SECRET);

            const verifyJwt = jwt.sign({
                id: value.email
            }, process.env.JWT_SECRET);

            const link = `${frontend_url}/verify?token=${verifyJwt}`;

            await sendEmail_verify({
                email: value.email,
                link: link
            })

            return res.status(400).send({
                success: false,
                message: "Email is already registered, Please verify your Email!!"
            });
        }

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

        const link = `${frontend_url}/verify?token=${verifyJwt}`;

        await sendEmail_verify({
            email: user.email,
            link: link
        })

        res.json({
            success: true,
            accessToken: accessToken,
            email: user.email,
            jobSeeker: true,
            admin: false,
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
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).send({
                success: false,
                message: "Account already verified"
            });
        }
        
        user.isVerified = true;

        await user.save();

        await sendEmail_Confirmation({
            email: user.email,
            is
        });

        res.json({
            success: true,
            message: "Account verified successfully"
        });

    }
    catch(error) {
            console.error("Error occurred during verification:", error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
            });
    }
})

auth.post("/forgotPassword", async (req, res) => {
    try {
        const email = req.body.email;
        const user = await JobSeeker.findOne({ email });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }
        const token = jwt.sign({
            id: user.email
        }, process.env.JWT_SECRET, { expiresIn: "10m" });

        const link = `${frontend_url}/resetPassword?token=${token}`;

        await sendEmail_Reset({
            email: user.email,
            link: link
        });

        res.json({
            success: true,
            message: "Password reset link sent to your email"
        });
    }
    catch (error) {
        console.error("Error occurred during forgot password:", error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
})

auth.post("/resetPassword", async (req, res) => {
    try {
        const token = req.body.token;
        const password = req.body.password;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await JobSeeker.findOne({ email: decoded.id });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        const hashedPassword = await hashPassword(password);
        user.passwordHash = hashedPassword;

        await user.save();

        res.json({
            success: true,
            message: "Password reset successfully"
        });
    
    } catch {
        console.error("Error occurred during password reset:", error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
})

auth.get("/verifyToken", async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)
        console.log(token)

        const user = await JobSeeker.findOne({ email: decoded._id });

        console.log(user)

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isVerified) {
            return res.status(400).send({
                success: false,
                message: "Account not verified"
            });
        }

        res.json({
            success: true,
            email: user.email,
            jobSeeker: true,
            admin: false,
            userData: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber
            },
            message: "Login successful"
        });

    } catch (error) {
        console.error("Error occurred during token verification:", error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
})

module.exports = {auth};