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
            return res.status(404).send({
                success: false,
                message: "user not found or access token not valid"
            });
        }

        res.send({
            success: true,
            message: "user updated successfully"
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "error in updated user"
        });
    }
});

jobSeeker.put("/checkUserName", async (req, res) => {
    try {
        const { username } = req.body; // Assuming the username is sent in the request body

        // Check if the username already exists in the database
        const existingUser = await JobSeeker.findOne({ username });

        if (existingUser) {
            // Username already exists
            return res.status(200).json({ success: true, usernameValid: false, message: "Username is already taken" });
        } else {
            // Username is available
            return res.status(200).json({ success: true, usernameValid: true, message: "Username is available" });
        }
    } catch (error) {
        console.error("Error checking username availability:", error);
        return res.status(500).json({ success: false, usernameValid: false, message: "Internal server error" });
    }
});

jobSeeker.get("/getUser/:username", async (req, res) => {
    try {
        const { username } = req.params; // Extracting username from URL parameter

        // Find the user based on the provided username, excluding certain fields
        const user = await JobSeeker.findOne({ username }, { updatedAt: 0, savedJobs: 0, appliedJobs: 0, passwordHash: 0, email: 0 });

        if (!user) {
            // If user with provided username is not found, return 404
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // If user found, return user data
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});


module.exports = {jobSeeker};