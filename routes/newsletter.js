const { Router } = require("express");
const Joi = require("joi");
const newsletter = Router();
const { Newsletter } = require("../database/db");
const { sendEmail_Welcome } = require("../email/email");

newsletter.post("/subscribe", async (req, res) => {
    try {
        const { email } = req.body;

        // Validate the email
        const schema = Joi.object({
            email: Joi.string().email().required(),
        });

        const { error } = schema.validate({ email });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const existingSubscriber = await Newsletter.findOne( { email });
        if (existingSubscriber) {
            return res.status(200).json({ 
                message: "Email already subscribed",
                success: false
            });
        }
        else {
            await Newsletter.create({ email });
            await sendEmail_Welcome({ email });
            res.status(200).json({ 
                message: "Subscribed successfully",
                success: true
            });
        }
    } catch (error) {
        console.error("Error occurred during subscription:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = {newsletter};

