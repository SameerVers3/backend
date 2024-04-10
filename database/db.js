const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoURI = process.env.MONGO_URI;

const recruiterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  imageUrl: String,
  passwordHash: { type: String, required: true },
  contactNumber: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: String,
  website: String,
  description: String,
  location: String,
  size: String,
  recruiters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter' }],
  postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const jobPostingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  requirements: [String],
  responsibilities: [String],
  location: String,
  salaryRange: {
    min: Number,
    max: Number
  },
  tags: [String],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter' },
  postedDate: { type: Date, default: Date.now },
  expiryDate: Date,
  status: { type: String, default: 'active' },
  viewCount: { type: Number, default: 0 },
  applicants: [
    {
      applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker' },
      appliedDate: Date,
      status: { type: String, default: 'pending' }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const jobSeekerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  imageUrl: String,
  profile: {
    resume: String,
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String
      }
    ],
    education: [
      {
        degree: String,
        institution: String,
        yearCompleted: Number
      }
    ]
  },
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const Recruiter = mongoose.model('Recruiter', recruiterSchema);
const Company = mongoose.model('Company', companySchema);
const Job = mongoose.model('Job', jobPostingSchema);
const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);

module.exports = { Recruiter, Company, Job, JobSeeker };