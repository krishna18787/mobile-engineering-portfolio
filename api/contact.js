const TO_EMAIL = "krishna18787@gmail.com";
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_SUBJECT = 150;
const MAX_MESSAGE = 5000;

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, function (char) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Please submit the contact form." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  // Honeypot field: bots often fill every field, while real visitors never see this one.
  if (cleanText(body.website, 200)) return res.status(200).json({ ok: true });

  const name = cleanText(body.name, MAX_NAME);
  const email = cleanText(body.email, MAX_EMAIL);
  const subject = cleanText(body.subject, MAX_SUBJECT).replace(/[\r\n\t]+/g, " ");
  const message = cleanText(body.message, MAX_MESSAGE);

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Please complete all fields before sending." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (name.length < 2 || message.length < 5) {
    return res.status(400).json({ error: "Please enter your name and a little more detail in your message." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form configuration missing: RESEND_API_KEY");
    return res.status(503).json({ error: "The contact form is temporarily unavailable. Please try again later." });
  }

  const from = process.env.RESEND_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";
  const receivedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata"
  });
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const textBody = [
    "NEW PORTFOLIO ENQUIRY",
    "=====================",
    "",
    "Name: " + name,
    "Email: " + email,
    "Subject: " + subject,
    "Received: " + receivedAt + " (IST)",
    "",
    "MESSAGE",
    "-------",
    message,
    "",
    "Reply directly to this email to respond to the enquirer."
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: from,
        to: [TO_EMAIL],
        reply_to: email,
        subject: "[Portfolio Enquiry] " + subject,
        text: textBody,
        html: "<div style=\"font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172d29\">" +
          "<div style=\"background:#155e52;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0\"><p style=\"margin:0 0 6px;font-size:12px;letter-spacing:1px\">PORTFOLIO CONTACT FORM</p><h1 style=\"margin:0;font-size:22px\">New enquiry received</h1></div>" +
          "<div style=\"border:1px solid #dce5df;border-top:0;padding:24px;border-radius:0 0 12px 12px\">" +
          "<table style=\"width:100%;border-collapse:collapse\"><tr><td style=\"padding:8px 0;color:#5d706a;width:110px\">Name</td><td style=\"padding:8px 0;font-weight:600\">" + safeName + "</td></tr>" +
          "<tr><td style=\"padding:8px 0;color:#5d706a\">Email</td><td style=\"padding:8px 0\"><a href=\"mailto:" + safeEmail + "\">" + safeEmail + "</a></td></tr>" +
          "<tr><td style=\"padding:8px 0;color:#5d706a\">Subject</td><td style=\"padding:8px 0\">" + safeSubject + "</td></tr>" +
          "<tr><td style=\"padding:8px 0;color:#5d706a\">Received</td><td style=\"padding:8px 0\">" + escapeHtml(receivedAt) + " IST</td></tr></table>" +
          "<hr style=\"border:0;border-top:1px solid #dce5df;margin:18px 0\"><h2 style=\"font-size:15px\">Message</h2><p style=\"line-height:1.7;white-space:normal\">" + safeMessage + "</p>" +
          "<p style=\"margin-top:24px;font-size:12px;color:#5d706a\">Reply to this email to respond directly to " + safeName + ".</p></div></div>"
      })
    });
    const result = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      console.error("Resend email API error:", response.status, result.name || result.message || "Unknown error");
      return res.status(502).json({ error: "We couldn't deliver your enquiry right now. Please try again shortly." });
    }
    return res.status(200).json({ ok: true, id: result.id });
  } catch (error) {
    console.error("Contact form send failed:", error.message);
    return res.status(502).json({ error: "We couldn't deliver your enquiry right now. Please try again shortly." });
  }
};
