

const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.resolve(__dirname, 'token.json');

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function encodeImageToBase64(imagePath) {
  try {
    const image = await fs.readFile(imagePath);
    const mimeType = getMimeType(imagePath);
    return `data:${mimeType};base64,${Buffer.from(image).toString('base64')}`;
  } catch (error) {
    console.error('Image Encoding Error:', error.message);
    throw new Error('Failed to encode image to base64');
  }
}
async function loadTemplate(templateName, replacements) {
  try {
    const templatePath = path.resolve(__dirname, 'templates', `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf8');
    Object.keys(replacements).forEach(key => {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);

    });
    // Convert images to base64 and embed directly
    const imagesDir = path.resolve(__dirname, 'templates', 'images');
    const imageFiles = await fs.readdir(imagesDir);

    for (const file of imageFiles) {
    ;
    }
    return template;
  } catch (error) {
    console.error('Error loading template:', error.message);
    throw new Error('Failed to load email template');
  }
}

async function authorize() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (error) {
    console.error('Authorization Error:', error.message);
    throw new Error('Failed to authorize');
  }
}

async function sendEmail(to, subject, templateName, replacements) {
  try {
    const template = await loadTemplate(templateName, replacements);
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });

    const emailBody = [
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      `From: "Your Company" <${process.env.EMAIL}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      template
    ].join('\n');

    const encodedMessage = Buffer.from(emailBody).toString('base64url');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    return 'Email sent successfully!';
  } catch (error) {
    console.error('Email Sending Error:', error.message);
    throw new Error('Failed to send email');
  }
}

module.exports = { sendEmail };