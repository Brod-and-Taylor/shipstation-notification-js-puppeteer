const puppeteer = require("puppeteer");
require('dotenv').config();

const username = process.env.USERNAME
const password = process.env.PASSWORD

let page = null;
let browser = null;

var element = null;
var count = null;

var checkboxID = null;
var ordernumberID = null;
var ordernumber = null;
var notificationID = null;
var notification = null;

browser = puppeteer.launch({ headless: false })

.then( async (browser) => {
    page = await browser.newPage();
    page.setViewport({
        width: 1600,
        height: 800,
        isMobile: false,
      });
    
    page.goto("https://ship11.shipstation.com", {
        waitUntil: "networkidle2",
    });

    //login
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', username, {
        delay: 5,
      });
    await page.type('input[type="password"]', password, {
        delay: 5,
      });
    await page.click('#login-form-wrapper > div > div.login-form-Bx-y6d0 > div.remember-me-and-login-2AVdzzF > button');

    //navigate to fulfillments page in new tab
    await page.waitForNavigation({waitUntil: 'networkidle2'})
    page.goto("https://ship11.shipstation.com/shipments/fulfillments?page=1&pageSize=500", {
        waitUntil: "networkidle2",
    });

    while (true) {
        //filter to marketplace notiifaction failed
        //"Marketplace Notification"
        await page.waitForSelector('#app-root > div > div > div.main-content-29r3x8m > div.edit-grid-wrap-PcFvJiX > div > div > div > div.dropdowns-wrapper-4wMCKxf > div:nth-child(4) > div > button');
        await page.click('#app-root > div > div > div.main-content-29r3x8m > div.edit-grid-wrap-PcFvJiX > div > div > div > div.dropdowns-wrapper-4wMCKxf > div:nth-child(4) > div > button');
        await page.waitForTimeout(500);
        //"Failed"
        await page.waitForSelector('#dropdown-wrapper-container > div > div > div > form > div > div > div.form-NMkWlYE > div > div > div:nth-child(3)');
        await page.click('#dropdown-wrapper-container > div > div > div > form > div > div > div.form-NMkWlYE > div > div > div:nth-child(3)');
        await page.waitForTimeout(500);
        //"Apply"
        await page.waitForSelector('#filter-form-apply');
        await page.click('#filter-form-apply');
        await page.waitForTimeout(5000);

        //click up to 10 checkboxes
        for (let i = 1; i <= 10; i++) {
            count = 0;
            try {
                //find order number
                ordernumberID = '#app-root > div > div > div.main-content-29r3x8m > div.grid-content-24RrEJI > div > div.grid-3F4ZAVB > div > div > div > div:nth-child(2) > div.non-pinned-columns-2EjEvkq > div > div:nth-child('
                + i 
                + ') > div:nth-child(4) > button';
                await page.waitForSelector(ordernumberID);
                element = await page.$(ordernumberID)
                ordernumber = await element.evaluate(el => el.textContent)  

                //find notification status
                notificationID = '#app-root > div > div > div.main-content-29r3x8m > div.grid-content-24RrEJI > div > div.grid-3F4ZAVB > div > div > div > div:nth-child(2) > div.non-pinned-columns-2EjEvkq > div > div:nth-child('
                        + i 
                        + ') > div:nth-child(14) > div > div.message-1rzC2PB';
                element = await page.$(notificationID)
                notification = await element.evaluate(el => el.textContent)

                if (notification == 'Failed' && ordernumber.length > 16) {
                    checkboxID = '#app-root > div > div > div.main-content-29r3x8m > div.grid-content-24RrEJI > div > div.grid-3F4ZAVB > div > div > div > div:nth-child(2) > div.pinned-columns-GW47HWR > div > div:nth-child('
                        + i 
                        + ') > div > div';
                    await page.waitForSelector(checkboxID);
                    await page.click(checkboxID);
                    count += 1
                    console.log(ordernumber)
                }
            } catch {
                console.log("No more Failed Notifications")
                break;
            }
        }
        // if any checkboxes, press send notifications
        if (count > 0) {
            await page.click('#app-root > div > div > div.main-content-29r3x8m > div.grid-header-3bzN6Ud > div > div.actions-container-1AfN-Mj > div > div.invisibleChildrenContainer-3d2O9cf > button:nth-child(3)');
            console.log("Notifications Sent")
            await page.waitForTimeout(8000);
            await page.reload({ waitUntil: ["networkidle2"] });
        } else {
            break;
        }
    }
    
    console.log('Program Ended')

    // wait 1 second
    await page.waitForTimeout(1000);
    // close the browser
    await browser.close();

})
.catch((error) => {
    console.log(error)
})