const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1- define a transporter
  const transporter = nodemailer.createTransport({
    // // service : 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // secure: false,
    // auth: {
    //   user: process.env.MAILTRAP_USER,
    //   pass: process.env.MAILTRAP_PASSWORD,
    // },
  });
  //2- define email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    // from: 'skaliya502@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3- actually send email
  // const info = await transporter.sendMail(mailOptions); //promise
  // return info.messageId;
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error:💥', error);
    } else {
      console.log('Email sent:😃', info.response);
    }
  });
};

module.exports = sendEmail;
