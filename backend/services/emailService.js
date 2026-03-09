const nodemailer = require('nodemailer');

/**
 * Email Service for MediHelp emergency notifications.
 *
 * Sends richly-formatted HTML emergency emails to hospital contacts
 * with precise Google Maps links, patient info, and an accept-action URL.
 */

// Build the transporter lazily so the module can be required even when
// EMAIL_USER / EMAIL_PASS are not yet set (e.g. in tests).
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[EmailService] EMAIL_USER or EMAIL_PASS not configured — emails will be skipped.');
    return null;
  }

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return _transporter;
}

/**
 * Build a Google Maps link that preserves maximum coordinate precision.
 * Uses up to 9 decimal places (~0.11 mm accuracy) as requested.
 */
function mapsLink(lat, lng) {
  const la = Number(lat).toFixed(9);
  const lo = Number(lng).toFixed(9);
  return `https://www.google.com/maps/search/?api=1&query=${la},${lo}`;
}

/**
 * Send an emergency SOS email to a single recipient.
 *
 * @param {Object} opts
 * @param {string}  opts.to            – recipient email address
 * @param {string}  opts.hospitalName  – hospital being notified
 * @param {Object}  opts.patient       – { name, email, phone }
 * @param {Object}  opts.location      – { latitude, longitude }
 * @param {string}  opts.emergencyType – medical | accident | other
 * @param {string}  opts.description   – free-text description
 * @param {string}  opts.emergencyId   – Mongo _id of the EmergencyRequest
 * @param {string}  opts.acceptUrl     – URL the hospital can click to accept
 * @returns {Promise<{success:boolean, messageId?:string, error?:string}>}
 */
async function sendEmergencyEmail(opts) {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Email not configured (EMAIL_USER / EMAIL_PASS missing)' };
  }

  const {
    to,
    hospitalName,
    patient = {},
    location = {},
    emergencyType = 'medical',
    description = '',
    emergencyId = '',
    acceptUrl = '',
  } = opts;

  const lat = Number(location.latitude).toFixed(9);
  const lng = Number(location.longitude).toFixed(9);
  const mapUrl = mapsLink(location.latitude, location.longitude);

  const subject = `🚨 EMERGENCY SOS — ${emergencyType.toUpperCase()} — Immediate Response Required`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.15);">
    <!-- RED HEADER -->
    <tr>
      <td style="background:linear-gradient(135deg,#d32f2f,#b71c1c);padding:24px 32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;">🚨 EMERGENCY SOS ALERT 🚨</h1>
        <p style="color:#ffcdd2;margin:8px 0 0;font-size:14px;">MediHelp Emergency Notification System</p>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:24px 32px;">
        <p style="font-size:16px;color:#333;">Dear <strong>${hospitalName}</strong> Emergency Team,</p>
        <p style="font-size:15px;color:#555;">A patient has triggered an <strong style="color:#d32f2f;">emergency SOS alert</strong> requesting immediate medical assistance.</p>

        <!-- PATIENT INFO -->
        <table width="100%" style="background:#fff3e0;border-left:4px solid #ff9800;border-radius:4px;padding:16px;margin:16px 0;" cellpadding="8">
          <tr><td colspan="2" style="font-weight:bold;font-size:16px;color:#e65100;">Patient Information</td></tr>
          <tr><td style="color:#666;width:140px;">Name</td><td style="font-weight:bold;">${patient.name || 'Not provided'}</td></tr>
          <tr><td style="color:#666;">Email</td><td>${patient.email || 'N/A'}</td></tr>
          <tr><td style="color:#666;">Phone</td><td>${patient.phone || 'N/A'}</td></tr>
          <tr><td style="color:#666;">Emergency Type</td><td style="font-weight:bold;color:#d32f2f;">${emergencyType.toUpperCase()}</td></tr>
          ${description ? `<tr><td style="color:#666;">Description</td><td>${description}</td></tr>` : ''}
        </table>

        <!-- LOCATION -->
        <table width="100%" style="background:#e3f2fd;border-left:4px solid #1976d2;border-radius:4px;padding:16px;margin:16px 0;" cellpadding="8">
          <tr><td colspan="2" style="font-weight:bold;font-size:16px;color:#0d47a1;">📍 Precise Location</td></tr>
          <tr><td style="color:#666;width:140px;">Latitude</td><td style="font-family:monospace;font-size:15px;font-weight:bold;">${lat}</td></tr>
          <tr><td style="color:#666;">Longitude</td><td style="font-family:monospace;font-size:15px;font-weight:bold;">${lng}</td></tr>
          <tr>
            <td colspan="2" style="padding-top:12px;">
              <a href="${mapUrl}" target="_blank"
                 style="display:inline-block;background:#1976d2;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">
                📍 Open in Google Maps
              </a>
            </td>
          </tr>
        </table>

        <!-- ACCEPT BUTTON -->
        ${acceptUrl ? `
        <table width="100%" style="margin:24px 0;" cellpadding="0">
          <tr>
            <td style="text-align:center;">
              <a href="${acceptUrl}" target="_blank"
                 style="display:inline-block;background:linear-gradient(135deg,#2e7d32,#1b5e20);color:#fff;padding:16px 48px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:18px;box-shadow:0 4px 12px rgba(46,125,50,.4);">
                ✅ ACCEPT THIS EMERGENCY
              </a>
              <p style="color:#666;font-size:12px;margin-top:8px;">First hospital to accept will be assigned the ambulance dispatch.</p>
            </td>
          </tr>
        </table>
        ` : ''}

        <!-- TIMESTAMP -->
        <p style="color:#999;font-size:12px;text-align:center;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
          Alert generated at <strong>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</strong> IST<br>
          Emergency ID: <code>${emergencyId}</code>
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
        This is an automated emergency alert from MediHelp. Do not reply to this email.<br>
        &copy; ${new Date().getFullYear()} MediHelp — IIT Jodhpur
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
EMERGENCY SOS ALERT
====================
Hospital: ${hospitalName}
Patient: ${patient.name || 'Unknown'} (${patient.email || 'N/A'}, ${patient.phone || 'N/A'})
Type: ${emergencyType.toUpperCase()}
${description ? `Description: ${description}` : ''}

PRECISE LOCATION
Latitude:  ${lat}
Longitude: ${lng}
Google Maps: ${mapUrl}

${acceptUrl ? `ACCEPT THIS EMERGENCY: ${acceptUrl}` : ''}

Alert Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
Emergency ID: ${emergencyId}
`.trim();

  try {
    const info = await transporter.sendMail({
      from: `"MediHelp Emergency 🚨" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'high',
      },
    });

    console.log(`[EmailService] Emergency email sent to ${to} — messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to send to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Broadcast an emergency SOS email to ALL given hospitals in parallel.
 *
 * @param {Object} opts
 * @param {Array}   opts.hospitals     – array of Hospital docs
 * @param {Object}  opts.patient       – { name, email, phone }
 * @param {Object}  opts.location      – { latitude, longitude }
 * @param {string}  opts.emergencyType
 * @param {string}  opts.description
 * @param {string}  opts.emergencyId
 * @param {string}  opts.acceptBaseUrl – base URL for accept link (e.g. http://localhost:5000/api/emergency)
 * @returns {Promise<Array<{hospital, email, sent, error?, sentAt}>>}
 */
async function broadcastEmergencyEmails(opts) {
  const {
    hospitals = [],
    patient = {},
    location = {},
    emergencyType = 'medical',
    description = '',
    emergencyId = '',
    acceptBaseUrl = '',
  } = opts;

  const results = [];

  // Collect all emails to send (primary + emergency emails per hospital)
  const tasks = [];
  for (const hosp of hospitals) {
    if (!hosp.acceptingEmergencies) continue;

    // Gather all emails for this hospital
    const emails = new Set();
    if (hosp.email) emails.add(hosp.email);
    if (hosp.emergencyEmails?.length) hosp.emergencyEmails.forEach((e) => emails.add(e));

    for (const email of emails) {
      const acceptUrl = acceptBaseUrl
        ? `${acceptBaseUrl}/${emergencyId}/accept?hospitalId=${hosp._id || hosp.id}`
        : '';

      tasks.push(
        sendEmergencyEmail({
          to: email,
          hospitalName: hosp.name,
          patient,
          location,
          emergencyType,
          description,
          emergencyId,
          acceptUrl,
        }).then((result) => ({
          hospital: hosp._id || hosp.id,
          email,
          sent: result.success,
          error: result.error || undefined,
          sentAt: result.success ? new Date() : undefined,
        }))
      );
    }
  }

  const settled = await Promise.allSettled(tasks);
  for (const s of settled) {
    if (s.status === 'fulfilled') results.push(s.value);
    else results.push({ sent: false, error: s.reason?.message || 'Unknown' });
  }

  const sentCount = results.filter((r) => r.sent).length;
  console.log(`[EmailService] Broadcast complete — ${sentCount}/${results.length} emails sent for emergency ${emergencyId}`);

  return results;
}

module.exports = { sendEmergencyEmail, broadcastEmergencyEmails, mapsLink };
