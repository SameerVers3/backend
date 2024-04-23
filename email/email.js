const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require("path")

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: 'sameerghafoor34@gmail.com',
    pass: 'bnzh dcaq prbz rnsz',
  },
  secure: true,
});

const sendEmail_Welcome = async (data) => {

    // Read the HTML file
    const emailTemplate = fs.readFileSync(path.join(__dirname, '..', 'template', 'welcome.html'), 'utf8');

    await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
            reject(error);
        } else {
            console.log("Server is ready to take our messages");
            resolve(success);
        }
        });
    });

    const mailOptions = {
        from: 'sameerghafoor34@gmail.com',
        to: data.email,
        subject: "Welcome to WizWork",
        html: emailTemplate,
    };

    await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            console.log(info);
            resolve(info);
        }
        });
    });
}

const sendEmail_verify = async (data) => {
    // Read the HTML file
    const emailTemplate = fs.readFileSync(path.join(__dirname, '..', 'email/template', 'verify.html'), 'utf8');

    let compilledTemplate = emailTemplate.replace("{{link}}", data.link);

    await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
            reject(error);
        } else {
            console.log("Server is ready to take our messages");
            resolve(success);
        }
        });
    });

    const mailOptions = {
        from: 'sameerghafoor34@gmail.com',
        to: data.email,
        subject: "Verify your email",
        html: compilledTemplate,
    };

    await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            console.log(info);
            resolve(info);
        }
        });
    });

}

const sendEmail_Confirmation = async (data) => {
    // Read the HTML file
    const emailTemplate = fs.readFileSync(path.join(__dirname, '..', 'email\\template', 'confirmation.html'), 'utf8');

    await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
            reject(error);
        } else {
            console.log("Server is ready to take our messages");
            resolve(success);
        }
        });
    });

    const mailOptions = {
        from: 'sameerghafoor34@gmail.com',
        to: data.email,
        subject: "Email Confirmation Successful! Welcome to WizWork",
        html: emailTemplate,
    };

    await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            console.log(info);
            resolve(info);
        }
        });
    });
}

const sendEmail_Reset = async (data) => {
    // Read the HTML file
    const emailTemplate = fs.readFileSync(path.join(__dirname, '..', 'template', 'reset.html'), 'utf8');

    await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
            reject(error);
        } else {
            console.log("Server is ready to take our messages");
            resolve(success);
        }
        });
    });

    const mailOptions = {
        from: 'sameerghafoor34@gmail.com',
        to: data.email,
        subject: "Reset your password",
        html: emailTemplate,
    };

    await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            console.log(info);
            resolve(info);
        }
        });
    });
}


const sendEmail_ResetConfirm = async (data) => {
    // Read the HTML file
    const emailTemplate = fs.readFileSync(path.join(__dirname, '..', 'template', 'resetconfirm.html'), 'utf8');

    await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
            reject(error);
        } else {
            console.log("Server is ready to take our messages");
            resolve(success);
        }
        });
    });

    const mailOptions = {
        from: 'sameerghafoor34@gmail.com',
        to: data.email,
        subject: "Password Reset Successful!",
        html: emailTemplate,
    };

    await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            console.log(info);
            resolve(info);
        }
        });
    });
}

module.exports = { sendEmail_Welcome, sendEmail_verify, sendEmail_Confirmation, sendEmail_Reset, sendEmail_ResetConfirm}