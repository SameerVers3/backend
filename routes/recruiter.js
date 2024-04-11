const { Router } = require('express');
const { recruiterAuthMiddleware } = require("../middleware/auth");
const { Company, Recruiter, Job } = require("../database/db")
const Joi = require("joi")
const {generateRandomHash} = require("../utils/hash")
const recruiter = Router();

const companySchema = Joi.object({
    name: Joi.string().required(),
    industry: Joi.string().required(),
    website: Joi.string().uri().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    size: Joi.string().required()
});

const jobPostingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    requirements: Joi.array().items(Joi.string()).required(),
    responsibilities: Joi.array().items(Joi.string()).required(),
    location: Joi.string().required(),
    salaryRange: Joi.object({
        min: Joi.number().required(),
        max: Joi.number().required()
    }).required(),
    tags: Joi.array().items(Joi.string()),
    company: Joi.string().required(),
    postedBy: Joi.string().required(),
    expiryDate: Joi.date().required()
});

recruiter.get('/hi', recruiterAuthMiddleware, (req, res) => {
    res.json({ message: 'Hi there, recruiter!' });
});

recruiter.post('/addCompany', recruiterAuthMiddleware, async (req, res) => {
    try {
        // Validate request body against the companySchema
        const { error, value } = companySchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
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

        // Create a new company profile
        const newCompany = new Company({
            name: value.name,
            industry: value.industry,
            website: value.website,
            description: value.description,
            location: value.location,
            size: value.size,
            id: id,
            isApproved: false // Set isApproved to false by default
        });

        // Save the new company profile
        await newCompany.save();

        const recruiter = await Recruiter.findOne({ id: req.id });

        if (recruiter) {
            try {
                recruiter.companyId = id;
                await recruiter.save();
            } catch (error) {
                console.error('Error updating recruiter:', error);
            }
        }

        res.status(201).json({
            success: true,
            message: "company profile added successfully"
        });

    } catch (error) {
        console.error("Error occurred while adding company profile:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
});

recruiter.post('/addJob', recruiterAuthMiddleware, async (req, res) => {
    try {
        // Validate request body using Joi schema
        const { error, value } = jobPostingSchema.validate(req.body);

        if (error) {
            // If validation fails, return a 400 error with details
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message });
        }

        // Create a new job posting object
        const newJobPosting = new Job(value);

        // Save the new job posting to the database
        const savedJobPosting = await newJobPosting.save();

        console.log(req.id)
        await Recruiter.findByIdAndUpdate(req.id, {
            $push: { postedJobs: savedJobPosting._id }
        });

        // Respond with the saved job posting
        res.status(201).json({
            success: true,
            message: "job added successfully"
        });
    } catch (error) {
        // Handle errors
        console.error('Error creating job posting:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' });
    }
});

module.exports = {recruiter};