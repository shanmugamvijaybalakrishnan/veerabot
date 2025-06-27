<<<<<<< HEAD
(async () => {
  const fs = require('fs');
  const os = require('os');
  const qrcode = require('qrcode-terminal');
  const { google } = require('googleapis');
  const { Client, LocalAuth } = require('whatsapp-web.js');
  const creds = require('./creds.json');
=======
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { google } = require('googleapis');
const creds = require('./creds.json');
const os = require('os'); // ✅ Only once, right here
>>>>>>> 8d35fc62d1893ed753d4bcdfe3e13b39cb77791b

  // Dynamically import ESM fetch-blob and patch global.Blob
  const { Blob } = await import('fetch-blob');
  global.Blob = Blob;

<<<<<<< HEAD
  // Optional but safe if node-fetch is needed for polyfill
  const fetch = require('node-fetch');
  global.fetch = fetch;
  global.Headers = fetch.Headers;
  global.Request = fetch.Request;
  global.Response = fetch.Response;

const { FormData } = await import('formdata-node');
global.FormData = FormData;
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  const SHEET_ID = '12NovtM8TpVW3vfYNEtRMNd6jXFtnti3gdTqS3q8wg0E';
  const SHEET_NAME = 'Sheet1';
=======
// ✅ OS-based Chrome/Chromium path
let executablePath;
if (os.platform() === 'win32') {
  executablePath = undefined;
} else if (os.platform() === 'linux') {
  executablePath = '/usr/bin/google-chrome';
}
console.log('Launching puppeteer with executablePath:', executablePath);


const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
   headless: 'true',
    executablePath: executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});
let userData = {};
>>>>>>> 8d35fc62d1893ed753d4bcdfe3e13b39cb77791b

  const BASE_PERSISTENT_PATH = process.env.VEERABOT_DATA_PATH || './data_veerabot';
  const SESSION_PATH = `${BASE_PERSISTENT_PATH}/session`;
  const BACKUP_FILE_PATH = `${BASE_PERSISTENT_PATH}/backup.json`;

<<<<<<< HEAD
  if (!fs.existsSync(BASE_PERSISTENT_PATH)) fs.mkdirSync(BASE_PERSISTENT_PATH, { recursive: true });
  if (!fs.existsSync(SESSION_PATH)) fs.mkdirSync(SESSION_PATH, { recursive: true });
=======
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
>>>>>>> 8d35fc62d1893ed753d4bcdfe3e13b39cb77791b

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
      ],
    }
  });

  let userData = {};

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: 'v4', auth });

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
      console.error(error.stack);
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
      fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify([row], null, 2));
      console.log('💾 Created new local backup with current entry:', BACKUP_FILE_PATH);
    }
  }

  client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📲 Scan QR Code to connect WhatsApp.');
  });

<<<<<<< HEAD
  client.on('ready', () => {
    console.log('✅ VeeraBot is ready and online!');
  });
=======
// WhatsApp Event Handlers
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('📲 Scan QR Code to connect WhatsApp.');
});
>>>>>>> 8d35fc62d1893ed753d4bcdfe3e13b39cb77791b

  client.on('auth_failure', msg => {
    console.error('❌ WhatsApp Authentication Failure:', msg);
  });

  client.on('disconnected', reason => {
    console.log('🔌 Client was logged out:', reason);
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
      await msg.reply("🔹 May I know your *full name*, beautiful soul? This will be used to register you into our Sacred Soul Records. 📜");
      u.step++;
    } else if (u.step === 2) {
      u.name = text;
      await msg.reply("🔹 Please confirm your *phone number* to stay aligned with your divine path. 📞✨");
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
<<<<<<< HEAD
      await saveToSheet(u);
      delete userData[id];
    }
  });

  console.log('🚀 Initializing WhatsApp client...');
  await client.initialize();

})(); // ✅ This properly closes your async IIFE
=======
    await saveToSheet(u);
    delete userData[id];
  }
});
client.initialize();



>>>>>>> 8d35fc62d1893ed753d4bcdfe3e13b39cb77791b




