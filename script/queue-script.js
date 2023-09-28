/*
  Bizzy Queue Script
  Version 1.0
  Michael Aggerholm
  28/09-23
*/

const puppeteer = require('puppeteer');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

uname = process.env.USERNAME
upass = process.env.PASSWORD
queue = process.env.QUEUE

async function main() {
  if (!uname || !upass) {
    console.log('Check login credentials, dummy');
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.goto('https://app.bizzy.dk/Login', { waitUntil: 'networkidle0' });

  page.waitForNavigation({ waitUntil: 'networkidle0' }),
  await page.type('#Username', process.env.USERNAME);
  await page.type('#Password', process.env.PASSWORD);
  await Promise.all([
    page.click('input.btn-primary'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  const cookies = await page.cookies();
  const authCookie = cookies.find(c => c.name === ".ASPXAUTH")

  if (queue == 'IN') {
    await fetch("https://app.bizzy.dk/Home/EnterQueue", {
      method: 'post',
      body: "queueId=65980&telephoneIds=65924",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': ".ASPXAUTH="+authCookie.value
      }
    });
  } else if(queue == 'OUT') {
    await fetch("https://app.bizzy.dk/Home/LeaveQueue", {
      method: 'post',
      body: "queueId=65980",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': ".ASPXAUTH="+authCookie.value
      }
    });
  } else {
    console.log('Wrong .env queue input');
  }

  await browser.close();
}

main();

/*
TODO: 
  1) Get queue id's and maybe map them to easy names. 
  2) Get telephoneIds from payload instead of hardcoded.
  3) Guard with try-catch and more error handling in case of bad response. 
*/