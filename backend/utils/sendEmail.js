const nodemailer = require("nodemailer");

// 1. Rename the 3rd parameter from 'text' to 'html'
const sendEmail = async (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Now use the variable 'html' which matches the parameter above
    await transporter.sendMail({
        from: '"Yari Dosti Cafe" <support@yaridosti.com>',
        to: email,
        subject: subject,
        html: html,
    });
};

module.exports = sendEmail;