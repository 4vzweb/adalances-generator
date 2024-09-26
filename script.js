import fetch from 'node-fetch';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import FormData from 'form-data';
// Made by 4vz (green) with love.

// Captcha Details, don't change PAGE_URL & SiteKey
const API_KEY = 'your2captchakey';
const SITE_KEY = '6Lc8__EpAAAAAM7gXX7olu7x4BKGuPXLzqXRuq7L';
const PAGE_URL = 'https://api.adalances.com/v1/auth/register';

function getRandomNumber(length) {
  return Math.random().toString().substr(2, length);
}

function generateAccountDetails() {
  const randomNumber = getRandomNumber(6);
  const email = `greenstuffsiker_${randomNumber}@gmail.com`; // Eposta
  const username = `greenstuff${randomNumber}`; // İsim
  const password = 'GreenCan31_'; // hesapların şifre

  return { email, username, password };
}

async function solveCaptcha() {
  const formData = new FormData();
  formData.append('key', API_KEY);
  formData.append('method', 'userrecaptcha');
  formData.append('googlekey', SITE_KEY);
  formData.append('pageurl', PAGE_URL);

  const res = await fetch('http://2captcha.com/in.php', {
    method: 'POST',
    body: formData,
  });

  const captchaID = await res.text();
  const requestId = captchaID.split('|')[1];

  console.log('Captcha isteği yollandı, çözüm bekleniyor.');

  while (true) {
    const checkURL = `http://2captcha.com/res.php?key=${API_KEY}&action=get&id=${requestId}`;
    const captchaRes = await fetch(checkURL);
    const captchaText = await captchaRes.text();

    if (captchaText === 'CAPCHA_NOT_READY') {
      console.log('Captcha hazır değil.');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      return captchaText.split('|')[1];
    }
  }
}

async function registerAccount(details, recaptchaToken) {
  const bodyData = JSON.stringify({
    email: details.email,
    username: details.username,
    password: details.password,
    recaptcha: recaptchaToken,
  });

  const res = await fetch(PAGE_URL, {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'content-type': 'application/json',
      'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },
    body: bodyData,
  });

  if (res.ok) {
    console.log('Hesap kayıt oldu!');
  } else {
    console.error('Hata oldu', await res.text());
  }
}

function saveAccountToFile(details) {
  const fileName = 'accounts.json';

  let accounts = [];
  if (fs.existsSync(fileName)) {
    accounts = JSON.parse(fs.readFileSync(fileName));
  }

  accounts.push(details);

  fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2));
}

(async () => {
  while (true) {
    try {
      const accountDetails = generateAccountDetails();
      console.log('Rasgele Info:', accountDetails);

      const recaptchaToken = await solveCaptcha();
      console.log('Captcha tamamlandı, kayıt olunuyor..');

      await registerAccount(accountDetails, recaptchaToken);

      saveAccountToFile(accountDetails);
      console.log('accounts.json dosyasına kaydettim hesabı aga.');

      await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
      console.error('Error:', error);
    }
  }
})();
