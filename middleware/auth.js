const jwt = require("jsonwebtoken");
const { JobSeeker, Recruiter } = require('../database/db'); // Assuming you have a JobSeeker model


const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await JobSeeker.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Add the user to the request object for further processing
    req.user = user._id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const recruiterAuthMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const recruiter = await Recruiter.findById(decoded._id);

    if (!recruiter) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Add the recruiter to the request object for further processing
    req.recruiter = recruiter._id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { authMiddleware, recruiterAuthMiddleware };