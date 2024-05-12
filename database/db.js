const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { application } = require('express');

const mongoURI = process.env.MONGO_URI;

const recruiterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  imageUrl: String,
  passwordHash: { type: String, required: true },
  id: String,
  contactNumber: String,
  companyId: String,
  postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const companySchema = new mongoose.Schema({
  name: String,
  industry: String,
  website: String,
  description: String,
  location: String,
  size: String,
  id: String,
  recruiters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter' }],
  postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  isApproved: Boolean,
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
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
      appliedDate: Date,
    }
  ],
  id: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const jobSeekerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  imageUrl: String,
  username: String,
  resume: String,
  // profile: {
  //   resume: String,
  //   skills: [String],
  //   experience: [
  //     {
  //       title: String,
  //       company: String,
  //       startDate: Date,
  //       endDate: Date,
  //       description: String
  //     }
  //   ],
  //   education: [
  //     {
  //       degree: String,
  //       institution: String,
  //       yearCompleted: Number
  //     }
  //   ]
  // },
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  // savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false}
});

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isSubscribed: { type: Boolean, default: true }
});

const interviewHistorySchema = new mongoose.Schema({
  status: { type: String, required: true }, // Status of the interview (e.g., scheduled, completed, canceled)
  dateTime: { type: Date, required: true }, // Date and time of the status change
  notes: String // Additional notes related to the status change
});

const interviewSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true }, // Reference to the job application
  date: { type: Date, required: true }, // Date of the interview
  location: String, // Location of the interview
  onlineMeetingLink: String, // Link to the meeting if the interview is held online
  notes: String, // Any additional notes related to the interview
  history: [interviewHistorySchema] // History of the interview (array of status changes)
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected', 'accepted'],
    required: true
  },
  dateChanged: { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // Reference to the job applied for
  jobSeekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker', required: true }, // Reference to the job seeker who applied
  coverletter: String,
  dateApplied: { type: Date, default: Date.now }, // Date when the application was submitted
  viewed: { type: Boolean, default: false }, // Whether the application has been viewed by the recruiter
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  }, // Current status of the application
  statusHistory: [statusHistorySchema] // History of status changes
  // Add any other fields you may need for additional details about the application
});

const Application = mongoose.model('Application', applicationSchema);
const Interview = mongoose.model('Interview', interviewSchema);

const Recruiter = mongoose.model('Recruiter', recruiterSchema);
const Company = mongoose.model('Company', companySchema);
const Job = mongoose.model('Job', jobPostingSchema);
const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = { Recruiter, Company, Job, JobSeeker, Application, Interview, Newsletter };