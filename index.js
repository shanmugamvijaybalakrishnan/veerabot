const fetch = require('node-fetch');

global.fetch = fetch;
global.Headers = fetch.Headers;
global.Request = fetch.Request;
global.Response = fetch.Response;

// The rest of your existing code...
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { google } = require('googleapis');
const creds = require('./creds.json'); // Ensure creds.json is in the same directory or provide correct path
const os = require('os');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = '12NovtM8TpVW3vfYNEtRMNd6jXFtnti3gdTqS3q8wg0E'; // Ensure this is your correct Sheet ID
const SHEET_NAME = 'Sheet1'; // Ensure this is your correct Sheet Name

// Persistent storage paths - RENDER_DISK_MOUNT_PATH is an example if using Render.
// For EC2, if you have a mounted disk at /mnt/data, you could use that.
// Otherwise, it defaults to the current directory './data_veerabot' for persistence.
const BASE_PERSISTENT_PATH = process.env.VEERABOT_DATA_PATH || './data_veerabot'; 
const SESSION_PATH = `${BASE_PERSISTENT_PATH}/session`;
const BACKUP_FILE_PATH = `${BASE_PERSISTENT_PATH}/backup.json`;
// const CACHE_PATH = `${BASE_PERSISTENT_PATH}/.wwebjs_cache`; // .wwebjs_cache is usually handled internally relative to session/dataPath

// Ensure persistent directories exist
if (!fs.existsSync(BASE_PERSISTENT_PATH)) {
  fs.mkdirSync(BASE_PERSISTENT_PATH, { recursive: true });
}
if (!fs.existsSync(SESSION_PATH)) {
  fs.mkdirSync(SESSION_PATH, { recursive: true });
}
// Note: .wwebjs_cache is typically created by whatsapp-web.js inside the session path or project root.
// If using LocalAuth with dataPath, it should handle its cache within that structure.

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
  puppeteer: {
    headless: true, // Recommended for servers
    // No longer specifying executablePath. whatsapp-web.js will download
    // and use its own compatible version of Chromium.
    // Ensure your EC2 instance has permissions and space for this download (~100-300MB in node_modules).
    args: [ // Common arguments for running headless Chrome on servers
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Crucial for some environments with limited /dev/shm space
      '--disable-gpu', // Often recommended for headless, may not be strictly necessary
      '--no-zygote', // Can help in some environments
      // '--single-process', // Generally not recommended unless specifically needed and tested
      // '--disable-software-rasterizer', // Could be tried if GPU issues persist
      // '--disable-infobars',
      // '--window-size=1280,720', // Can sometimes help if pages expect a certain viewport
    ],
  }
});

let userData = {};

// Google Auth
const auth = new google.auth.GoogleAuth({
  credentials: creds, // Make sure creds.json is correctly loaded
  scopes: SCOPES,
});
const sheets = google.sheets({ version: 'v4', auth });

// Save to Google Sheet + backup.json
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
    console.error(error.stack); // Log more details for the sheet error
  }

  try {
    let backup = [];
    if (fs.existsSync(BACKUP_FILE_PATH)) {
      const fileContent = fs.readFileSync(BACKUP_FILE_PATH, 'utf8');
      if (fileContent) {
        backup = JSON.parse(fileContent);
      }
    }
    backup.push(row);
    fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify(backup, null, 2));
    console.log('💾 Saved to local backup:', BACKUP_FILE_PATH);
  } catch (error) {
    console.error('❌ Backup file error:', error.message);
    // Attempt to write a new file if read failed or it was empty/corrupt
    fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify([row], null, 2));
    console.log('💾 Created new local backup with current entry:', BACKUP_FILE_PATH);
  }
}

// WhatsApp Event Handlers
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('📲 Scan QR Code to connect WhatsApp.');
});

client.on('ready', () => {
  console.log('✅ VeeraBot is ready and online!');
});

client.on('auth_failure', msg => {
  console.error('❌ WhatsApp Authentication Failure:', msg);
});

client.on('disconnected', (reason) => {
  console.log('🔌 Client was logged out:', reason);
});

client.on('message', async msg => {
  const id = msg.from;
  const text = msg.body.trim();
  if (!userData[id]) userData[id] = { step: 0, whatsappId: id };
  const u = userData[id];

  if (u.step === 0) {
    await msg.reply("🌀 Vanakkam, Brave Soul 🌺\nYou have reached the *Veera Soul Gateway* — a sacred portal guiding you to our ✨Retreats, 🌱Conscious Investments, and 🛍️ Divine Store Membership.\n\n💠 Why You’re Here — The Deeper Reason\n🌿 The Retreat is not just an event — it is a sacred return to your true self. Here, you awaken, reconnect, and help build a global soul community.\n\n💚 The Investment uplifts lives and gives you 36% annual returns — by supporting women-led startups and bulk sourcing.\n\n🛍️ The Store gives 30–70% savings on essentials — all sourced consciously for our tribe.\n\n✨ This is not a program. It’s a prophecy.\nYou are not a customer. You are a creator of the New Earth.\n\n🔹 To begin, please choose your *offering type*:\nType: Retreat / Store / Investment / Multiple");
    u.step++;
  } else if (u.step === 1) {
    u.type = text;
    await msg.reply("🔹 May I know your *full name*, beautiful soul? This will be used to register you into our Sacred Soul Records. 📜");
    u.step++;
  } else if (u.step === 2) {
    u.name = text;
    await msg.reply("🔹 Please confirm your *phone number* to stay aligned with your divine path. 📞✨");
    u.step++;
  } else if (u.step === 3) {
    u.phone = text;
    await msg.reply("🌈 Thank you, beloved.\nNow, to enter this sacred circle, please make your contribution 💸 as guided below:\n\n*Retreat:* ₹6666  \n*Store Membership:* ₹369/year  \n*Investment:* Minimum ₹6000 (returns 3% monthly)\n\n🔐 *Contribution Account Details:*  \nAccount Name: **Boysenberry Marketing Private Limited**  \nA/C No: **728405500004**  \nIFSC: **ICIC0007284**  \nUPI: **9443963973@okbizaxis**\n\n💫 You can choose *any one* or *multiple* offerings from above.  \nOnce done, send the *Transaction ID* only. 🧾");
    u.step++;
  } else if (u.step === 4) {
    u.txn = text;
    await msg.reply("💠 Thank you, " + u.name + ". Your offering has been received in the field of light. 🌟\n🧙‍♂️ Our Admin Soul is verifying the divine transaction.\n\nYou will soon receive your sacred link or confirmation for:  \n- 🕉️ Retreat Registration  \n- 🌍 Store Membership Access  \n- 💚 Investment Gateway\n\nMay divine blessings be with you. You are now a radiant node in the ZentiumX Soul Network. 🔮");
    await saveToSheet(u);
    delete userData[id]; // Clear user state after completion
  }
});

console.log('🚀 Initializing WhatsApp client...');
client.initialize().catch(err => {
  console.error('❌ Client initialization error:', err);
});



