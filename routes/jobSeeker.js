const { Router } = require("express");
const { JobSeeker } = require("../database/db");
const { authMiddleware } = require("../middleware/auth");

const jobSeeker = Router();

jobSeeker.get("/", authMiddleware, async (req, res) => {
    res.send(req.user)
})

// Route to update user information
jobSeeker.put('/update',authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have middleware to extract user ID from the token
        const updates = req.body;

        // Define allowed fields to be updated (excluding email and password)
        const allowedUpdates = ['firstName', 'lastName', 'imageUrl', 'profile'];

        // Filter out the fields from the request body that are not allowed to be updated
        const filteredUpdates = {};
        Object.keys(updates).forEach(update => {
            if (allowedUpdates.includes(update)) {
                filteredUpdates[update] = updates[update];
            }
        });

        // Find the user by ID and update the filtered fields
        const user = await JobSeeker.findByIdAndUpdate(userId, filteredUpdates, { new: true, runValidators: true });

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});



module.exports = {jobSeeker};