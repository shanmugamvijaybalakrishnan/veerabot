const puppeteer = require('puppeteer'); // add this at the top
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { google } = require('googleapis');
const creds = require('./creds.json');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = '12NovtM8TpVW3vfYNEtRMNd6jXFtnti3gdTqS3q8wg0E';
const SHEET_NAME = 'Sheet1';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: puppeteer.executablePath(), // ✅ THIS LINE FIXES THE ERROR
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
    ],
  },
});

let userData = {};

// Google Auth
const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: SCOPES,
});
const sheets = google.sheets({ version: 'v4', auth });

// Save to Google Sheet + Local JSON
async function saveToSheet(data) {
  const row = [
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    data.type,
    data.name,
    data.phone,
    data.txn,
    data.whatsappId,
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });
    console.log('✅ Saved to Google Sheet.');
  } catch (error) {
    console.error('❌ Sheet error:', error.message);
  }

  try {
    const backup = JSON.parse(fs.readFileSync('backup.json', 'utf8'));
    backup.push(row);
    fs.writeFileSync('backup.json', JSON.stringify(backup, null, 2));
  } catch {
    fs.writeFileSync('backup.json', JSON.stringify([row], null, 2));
  }
}

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('📲 Scan QR Code to connect WhatsApp.');
});

client.on('ready', () => {
  console.log('✅ VeeraBot is ready and online!');
});

client.on('message', async msg => {
  const id = msg.from;
  const text = msg.body.trim();
  if (!userData[id]) userData[id] = { step: 0, whatsappId: id };
  const u = userData[id];

  if (u.step === 0) {
    await msg.reply(`🌀 Vanakkam, Brave Soul 🌺
You have reached the *Veera Soul Gateway* — a sacred portal guiding you to our ✨Retreats, 🌱Conscious Investments, and 🛍️ Divine Store Membership.

💠 Why You’re Here — The Deeper Reason
🌿 The Retreat is not just an event — it is a sacred return to your true self. Here, you awaken, reconnect, and help build a global soul community.

💚 The Investment uplifts lives and gives you 36% annual returns — by supporting women-led startups and bulk sourcing.

🛍️ The Store gives 30–70% savings on essentials — all sourced consciously for our tribe.

✨ This is not a program. It’s a prophecy.
You are not a customer. You are a creator of the New Earth.

🔹 To begin, please choose your *offering type*:
Type: Retreat / Store / Investment / Multiple`);
    u.step++;
  } else if (u.step === 1) {
    u.type = text;
    await msg.reply(`🔹 May I know your *full name*, beautiful soul? This will be used to register you into our Sacred Soul Records. 📜`);
    u.step++;
  } else if (u.step === 2) {
    u.name = text;
    await msg.reply(`🔹 Please confirm your *phone number* to stay aligned with your divine path. 📞✨`);
    u.step++;
  } else if (u.step === 3) {
    u.phone = text;
    await msg.reply(`🌈 Thank you, beloved.
Now, to enter this sacred circle, please make your contribution 💸 as guided below:

*Retreat:* ₹6666  
*Store Membership:* ₹369/year  
*Investment:* Minimum ₹6000 (returns 3% monthly)

🔐 *Contribution Account Details:*  
Account Name: **Boysenberry Marketing Private Limited**  
A/C No: **728405500004**  
IFSC: **ICIC0007284**  
UPI: **9443963973@okbizaxis**

💫 You can choose *any one* or *multiple* offerings from above.  
Once done, send the *Transaction ID* only. 🧾`);
    u.step++;
  } else if (u.step === 4) {
    u.txn = text;
    await msg.reply(`💠 Thank you, ${u.name}. Your offering has been received in the field of light. 🌟
🧙‍♂️ Our Admin Soul is verifying the divine transaction.

You will soon receive your sacred link or confirmation for:  
- 🕉️ Retreat Registration  
- 🌍 Store Membership Access  
- 💚 Investment Gateway

May divine blessings be with you. You are now a radiant node in the ZentiumX Soul Network. 🔮`);
    await saveToSheet(u);
    delete userData[id];
  }
});

client.initialize();
