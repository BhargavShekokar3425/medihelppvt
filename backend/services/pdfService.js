/**
 * PDF Generation Service using Puppeteer
 * Generates professional medical prescription PDFs
 */

const puppeteer = require('puppeteer');

/**
 * Generate HTML template for prescription
 */
const generatePrescriptionHTML = (prescription) => {
  const {
    patientSnapshot,
    doctorSnapshot,
    diagnosis,
    medications,
    tests,
    notes,
    prescriptionNumber,
    createdAt,
  } = prescription;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const medicationsHTML = (medications || [])
    .map(
      (med, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${med.name || ''}</strong></td>
      <td>${med.dosage || '-'}</td>
      <td>${med.frequency || '-'}</td>
      <td>${med.duration || '-'}</td>
      <td>${med.instructions || '-'}</td>
    </tr>
  `
    )
    .join('');

  const testsHTML = (tests || [])
    .map((t) => `<li>${t.name || t}${t.instructions ? ` - <em>${t.instructions}</em>` : ''}</li>`)
    .join('');

  const allergiesHTML =
    patientSnapshot?.allergies?.length > 0
      ? `
    <div class="allergy-warning">
      <strong>KNOWN ALLERGIES:</strong> ${patientSnapshot.allergies.join(', ')}
    </div>
  `
      : '';

  const medicalConditionsHTML =
    patientSnapshot?.medicalConditions?.length > 0
      ? `<p><strong>Medical Conditions:</strong> ${patientSnapshot.medicalConditions.join(', ')}</p>`
      : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prescription - ${prescriptionNumber || ''}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      padding: 40px 50px;
      color: #1a1a1a;
      line-height: 1.6;
      background: #fff;
    }

    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }

    .clinic-name {
      font-size: 28px;
      font-weight: bold;
      color: #1e40af;
      letter-spacing: 1px;
    }

    .clinic-info {
      font-size: 12px;
      color: #555;
      margin-top: 8px;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .doctor-info h3 {
      color: #1e40af;
      margin-bottom: 5px;
    }

    .doctor-info p {
      font-size: 13px;
      color: #555;
      margin: 2px 0;
    }

    .prescription-meta {
      text-align: right;
      font-size: 13px;
    }

    .prescription-meta p {
      margin: 4px 0;
    }

    .rx-number {
      font-weight: bold;
      color: #1e40af;
    }

    .patient-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
      padding: 18px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fafafa;
    }

    .patient-section p {
      font-size: 14px;
      margin: 0;
    }

    .patient-section strong {
      color: #374151;
    }

    .allergy-warning {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border: 2px solid #ef4444;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 15px 0;
      color: #991b1b;
      font-size: 14px;
    }

    .rx-section {
      margin: 30px 0 20px;
    }

    .rx-symbol {
      font-size: 52px;
      color: #2563eb;
      font-weight: bold;
      display: inline-block;
      margin-right: 15px;
      vertical-align: middle;
    }

    .diagnosis-box {
      display: inline-block;
      vertical-align: middle;
      padding: 12px 20px;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-radius: 6px;
      border-left: 4px solid #f59e0b;
      font-size: 15px;
    }

    .medications-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 13px;
    }

    .medications-table th {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
    }

    .medications-table th:first-child {
      border-radius: 6px 0 0 0;
      width: 40px;
      text-align: center;
    }

    .medications-table th:last-child {
      border-radius: 0 6px 0 0;
    }

    .medications-table td {
      padding: 12px 10px;
      border-bottom: 1px solid #e2e8f0;
    }

    .medications-table td:first-child {
      text-align: center;
      color: #666;
    }

    .medications-table tr:nth-child(even) {
      background: #f8fafc;
    }

    .medications-table tr:hover {
      background: #f1f5f9;
    }

    .section-box {
      margin: 20px 0;
      padding: 16px 20px;
      border-radius: 8px;
    }

    .tests-section {
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      border-left: 4px solid #0ea5e9;
    }

    .tests-section h4 {
      color: #0369a1;
      margin-bottom: 10px;
    }

    .tests-section ul {
      margin-left: 20px;
    }

    .tests-section li {
      margin: 6px 0;
    }

    .notes-section {
      background: linear-gradient(135deg, #f5f3ff, #ede9fe);
      border-left: 4px solid #8b5cf6;
    }

    .notes-section h4 {
      color: #6d28d9;
      margin-bottom: 10px;
    }

    .signature-area {
      margin-top: 50px;
      padding-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    .signature-box {
      text-align: center;
      min-width: 200px;
    }

    .signature-line {
      border-top: 2px solid #1a1a1a;
      padding-top: 8px;
      margin-top: 40px;
    }

    .signature-box p {
      margin: 3px 0;
      font-size: 13px;
    }

    .signature-box .doctor-name {
      font-weight: bold;
      font-size: 14px;
    }

    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #888;
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
    }

    .footer p {
      margin: 3px 0;
    }

    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="clinic-name">${doctorSnapshot?.clinic?.name || 'MediHelp Medical Center'}</div>
    <div class="clinic-info">
      ${doctorSnapshot?.clinic?.address || 'Healthcare Services'}
      ${doctorSnapshot?.clinic?.phone ? `| Tel: ${doctorSnapshot.clinic.phone}` : ''}
      ${doctorSnapshot?.phone ? `| Mobile: ${doctorSnapshot.phone}` : ''}
    </div>
  </div>

  <!-- Doctor & Prescription Meta -->
  <div class="meta-row">
    <div class="doctor-info">
      <h3>Dr. ${doctorSnapshot?.name || 'Doctor'}</h3>
      <p>${doctorSnapshot?.specialization || 'General Physician'}</p>
      <p>${(doctorSnapshot?.qualifications || []).join(', ') || ''}</p>
    </div>
    <div class="prescription-meta">
      <p><span class="rx-number">Rx No: ${prescriptionNumber || 'N/A'}</span></p>
      <p><strong>Date:</strong> ${formatDate(createdAt)}</p>
    </div>
  </div>

  <!-- Patient Information -->
  <div class="patient-section">
    <p><strong>Patient Name:</strong> ${patientSnapshot?.name || 'N/A'}</p>
    <p><strong>Age / Gender:</strong> ${calculateAge(patientSnapshot?.dateOfBirth)} yrs / ${patientSnapshot?.gender || 'N/A'}</p>
    <p><strong>Blood Group:</strong> ${patientSnapshot?.bloodGroup || 'N/A'}</p>
    <p><strong>Contact:</strong> ${patientSnapshot?.phone || patientSnapshot?.email || 'N/A'}</p>
  </div>

  ${medicalConditionsHTML}
  ${allergiesHTML}

  <!-- Rx Section -->
  <div class="rx-section">
    <span class="rx-symbol">&#8478;</span>
    <div class="diagnosis-box">
      <strong>Diagnosis:</strong> ${diagnosis || 'Not specified'}
    </div>
  </div>

  <!-- Medications Table -->
  <table class="medications-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Medicine Name</th>
        <th>Dosage</th>
        <th>Frequency</th>
        <th>Duration</th>
        <th>Instructions</th>
      </tr>
    </thead>
    <tbody>
      ${medicationsHTML || '<tr><td colspan="6" style="text-align:center;color:#888;">No medications prescribed</td></tr>'}
    </tbody>
  </table>

  <!-- Tests Section -->
  ${
    tests && tests.length > 0
      ? `
  <div class="section-box tests-section">
    <h4>Recommended Tests / Investigations</h4>
    <ul>
      ${testsHTML}
    </ul>
  </div>
  `
      : ''
  }

  <!-- Notes Section -->
  ${
    notes
      ? `
  <div class="section-box notes-section">
    <h4>Additional Notes / Advice</h4>
    <p>${notes}</p>
  </div>
  `
      : ''
  }

  <!-- Signature Area -->
  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-line">
        <p class="doctor-name">Dr. ${doctorSnapshot?.name || ''}</p>
        <p>${doctorSnapshot?.specialization || ''}</p>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>This is a computer-generated prescription from MediHelp.</p>
    <p>For any queries, please contact the clinic.</p>
  </div>
</body>
</html>
  `;
};

/**
 * Generate PDF buffer from prescription data
 */
const generatePrescriptionPDF = async (prescription) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    const html = generatePrescriptionHTML(prescription);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    return pdf;
  } finally {
    await browser.close();
  }
};

/**
 * Generate HTML template for medicine request (patient-initiated)
 */
const generateMedicineRequestHTML = (request) => {
  const {
    patientSnapshot,
    doctorSnapshot,
    medicines,
    requestNumber,
    requestType,
    status,
    patientNotes,
    doctorVerification,
    createdAt,
  } = request;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const medicinesHTML = (medicines || [])
    .map(
      (med, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${med.name || ''}</strong></td>
      <td>${med.dosage || '-'}</td>
      <td>${med.frequency || '-'}</td>
      <td>${med.duration || '-'}</td>
      <td>${med.instructions || '-'}</td>
    </tr>
  `
    )
    .join('');

  const allergiesHTML =
    patientSnapshot?.allergies?.length > 0
      ? `
    <div class="allergy-warning">
      <strong>KNOWN ALLERGIES:</strong> ${patientSnapshot.allergies.join(', ')}
    </div>
  `
      : '';

  const medicalConditionsHTML =
    patientSnapshot?.medicalConditions?.length > 0
      ? `<p><strong>Medical Conditions:</strong> ${patientSnapshot.medicalConditions.join(', ')}</p>`
      : '';

  // Determine watermark based on status
  const isApproved = status === 'approved';
  const watermarkText = isApproved ? 'DOCTOR VERIFIED' : 'APPROVAL PENDING';
  const watermarkColor = isApproved ? '#16a34a' : '#f59e0b';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medicine Request - ${requestNumber || ''}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      padding: 40px 50px;
      color: #1a1a1a;
      line-height: 1.6;
      background: #fff;
      position: relative;
    }

    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72px;
      font-weight: bold;
      color: ${watermarkColor};
      opacity: 0.12;
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
    }

    .header {
      text-align: center;
      border-bottom: 3px solid ${isApproved ? '#16a34a' : '#f59e0b'};
      padding-bottom: 20px;
      margin-bottom: 25px;
    }

    .header-title {
      font-size: 24px;
      font-weight: bold;
      color: ${isApproved ? '#166534' : '#92400e'};
      letter-spacing: 1px;
    }

    .header-subtitle {
      font-size: 14px;
      color: #555;
      margin-top: 8px;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 12px;
      background: ${isApproved ? '#dcfce7' : '#fef3c7'};
      color: ${isApproved ? '#166534' : '#92400e'};
      border: 2px solid ${isApproved ? '#16a34a' : '#f59e0b'};
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .request-info h3 {
      color: #1e40af;
      margin-bottom: 5px;
    }

    .request-info p {
      font-size: 13px;
      color: #555;
      margin: 2px 0;
    }

    .request-meta {
      text-align: right;
      font-size: 13px;
    }

    .request-meta p {
      margin: 4px 0;
    }

    .request-number {
      font-weight: bold;
      color: #1e40af;
    }

    .patient-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
      padding: 18px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fafafa;
    }

    .patient-section p {
      font-size: 14px;
      margin: 0;
    }

    .patient-section strong {
      color: #374151;
    }

    .allergy-warning {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border: 2px solid #ef4444;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 15px 0;
      color: #991b1b;
      font-size: 14px;
    }

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #374151;
      margin: 25px 0 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }

    .medications-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 13px;
    }

    .medications-table th {
      background: linear-gradient(135deg, ${isApproved ? '#16a34a' : '#f59e0b'}, ${isApproved ? '#15803d' : '#d97706'});
      color: white;
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
    }

    .medications-table th:first-child {
      border-radius: 6px 0 0 0;
      width: 40px;
      text-align: center;
    }

    .medications-table th:last-child {
      border-radius: 0 6px 0 0;
    }

    .medications-table td {
      padding: 12px 10px;
      border-bottom: 1px solid #e2e8f0;
    }

    .medications-table td:first-child {
      text-align: center;
      color: #666;
    }

    .medications-table tr:nth-child(even) {
      background: #f8fafc;
    }

    .section-box {
      margin: 20px 0;
      padding: 16px 20px;
      border-radius: 8px;
    }

    .notes-section {
      background: linear-gradient(135deg, #f5f3ff, #ede9fe);
      border-left: 4px solid #8b5cf6;
    }

    .notes-section h4 {
      color: #6d28d9;
      margin-bottom: 10px;
    }

    .doctor-section {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border-left: 4px solid #16a34a;
      margin-top: 30px;
    }

    .doctor-section h4 {
      color: #166534;
      margin-bottom: 10px;
    }

    .verification-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 14px;
    }

    .signature-area {
      margin-top: 50px;
      padding-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    .signature-box {
      text-align: center;
      min-width: 200px;
    }

    .signature-line {
      border-top: 2px solid #1a1a1a;
      padding-top: 8px;
      margin-top: 40px;
    }

    .signature-box p {
      margin: 3px 0;
      font-size: 13px;
    }

    .signature-box .doctor-name {
      font-weight: bold;
      font-size: 14px;
    }

    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #888;
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
    }

    .footer p {
      margin: 3px 0;
    }

    @media print {
      body {
        padding: 20px;
      }
      .watermark {
        position: fixed;
      }
    }
  </style>
</head>
<body>
  <!-- Watermark -->
  <div class="watermark">${watermarkText}</div>

  <!-- Header -->
  <div class="header">
    <div class="header-title">Medicine Request</div>
    <div class="header-subtitle">
      ${requestType === 'manual_upload' ? 'Patient Uploaded Prescription' : 'Doctor Verification Request'}
    </div>
    <div class="status-badge">${status || 'pending'}</div>
  </div>

  <!-- Request Meta -->
  <div class="meta-row">
    <div class="request-info">
      <h3>Request Information</h3>
      <p><strong>Type:</strong> ${requestType === 'manual_upload' ? 'Manual Upload' : 'Doctor Verification'}</p>
    </div>
    <div class="request-meta">
      <p><span class="request-number">Request No: ${requestNumber || 'N/A'}</span></p>
      <p><strong>Date:</strong> ${formatDate(createdAt)}</p>
    </div>
  </div>

  <!-- Patient Information -->
  <div class="patient-section">
    <p><strong>Patient Name:</strong> ${patientSnapshot?.name || 'N/A'}</p>
    <p><strong>Age / Gender:</strong> ${calculateAge(patientSnapshot?.dateOfBirth)} yrs / ${patientSnapshot?.gender || 'N/A'}</p>
    <p><strong>Blood Group:</strong> ${patientSnapshot?.bloodGroup || 'N/A'}</p>
    <p><strong>Contact:</strong> ${patientSnapshot?.phone || patientSnapshot?.email || 'N/A'}</p>
    ${patientSnapshot?.address ? `<p style="grid-column: span 2;"><strong>Address:</strong> ${patientSnapshot.address}</p>` : ''}
  </div>

  ${medicalConditionsHTML}
  ${allergiesHTML}

  <!-- Medicines Requested -->
  <h3 class="section-title">Medicines Requested</h3>
  <table class="medications-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Medicine Name</th>
        <th>Dosage</th>
        <th>Frequency</th>
        <th>Duration</th>
        <th>Instructions</th>
      </tr>
    </thead>
    <tbody>
      ${medicinesHTML || '<tr><td colspan="6" style="text-align:center;color:#888;">No medicines listed</td></tr>'}
    </tbody>
  </table>

  <!-- Patient Notes -->
  ${
    patientNotes
      ? `
  <div class="section-box notes-section">
    <h4>Patient Notes</h4>
    <p>${patientNotes}</p>
  </div>
  `
      : ''
  }

  <!-- Doctor Verification Section (if approved) -->
  ${
    isApproved && doctorSnapshot
      ? `
  <div class="section-box doctor-section">
    <h4>Doctor Verification</h4>
    <div class="verification-info">
      <p><strong>Verified By:</strong> Dr. ${doctorSnapshot.name || 'N/A'}</p>
      <p><strong>Specialization:</strong> ${doctorSnapshot.specialization || 'N/A'}</p>
      <p><strong>Verified On:</strong> ${doctorVerification?.verifiedAt ? formatDate(doctorVerification.verifiedAt) : 'N/A'}</p>
      <p><strong>Clinic:</strong> ${doctorSnapshot.clinic?.name || 'N/A'}</p>
    </div>
    ${doctorVerification?.notes ? `<p style="margin-top: 10px;"><strong>Doctor's Notes:</strong> ${doctorVerification.notes}</p>` : ''}
  </div>

  <!-- Signature Area -->
  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-line">
        <p class="doctor-name">Dr. ${doctorSnapshot.name || ''}</p>
        <p>${doctorSnapshot.specialization || ''}</p>
        <p style="font-size: 11px; color: #666;">Digitally Verified</p>
      </div>
    </div>
  </div>
  `
      : ''
  }

  <!-- Footer -->
  <div class="footer">
    <p>This is a computer-generated medicine request from MediHelp.</p>
    ${isApproved ? '<p>This request has been verified by a licensed medical professional.</p>' : '<p>This request is pending verification and is NOT a valid prescription.</p>'}
    <p>For any queries, please contact MediHelp support.</p>
  </div>
</body>
</html>
  `;
};

/**
 * Generate PDF buffer from medicine request data
 */
const generateMedicineRequestPDF = async (request) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    const html = generateMedicineRequestHTML(request);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    return pdf;
  } finally {
    await browser.close();
  }
};

module.exports = {
  generatePrescriptionPDF,
  generatePrescriptionHTML,
  generateMedicineRequestPDF,
  generateMedicineRequestHTML,
};
