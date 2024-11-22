const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { transporter } = require("../utils/sendMail");
router.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const mailOptions = {
      from: email,
      to: process.env.EMAIL,
      subject: `New Contact Request from ${name} - ${email}`,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: "Email sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
