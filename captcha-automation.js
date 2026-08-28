const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const nextCheck = 5;

async function checkCaptchaCheckbox() {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        const page = await browser.newPage();

        try {
            await page.goto('https://epassport.apinext.shop/captcha.php', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            const currentUrl = page.url();
            if (currentUrl === 'about:blank') {
                throw new Error('Page failed to load - URL shows about:blank');
            }

        } catch (navError) {
            console.error('❌ Navigation failed:', navError.message);
            throw new Error(`Could not load hCaptcha page. Please check the URL and the page exists`);
        }

        const hasBody = await page.evaluate(() => {
            return document.body && document.body.innerHTML.trim().length > 0;
        });

        if (!hasBody) {
            throw new Error('Page loaded but appears to be empty.');
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

        let checkboxExists = await page.$('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');

        if (!checkboxExists) {
            const frames = page.frames();

            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                const frameUrl = frame.url();

                if (frameUrl.includes('hcaptcha.com') && frameUrl.includes('frame=checkbox')) {

                    try {
                        await frame.waitForSelector('body', { timeout: 5000 });

                        const frameCheckbox = await frame.$('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');

                        if (frameCheckbox) {
                            checkboxExists = frameCheckbox;

                            try {
                                await frame.click('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');
                            } catch (clickError) {}

                            try {
                                await frame.focus('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');
                                await frame.click('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');
                            } catch (focusError) {}

                            try {
                                await frame.evaluate(() => {
                                    const checkbox = document.querySelector('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');
                                    if (checkbox) {
                                        checkbox.click();
                                        return true;
                                    }
                                    return false;
                                });
                            } catch (jsError) {}

                            await new Promise(resolve => setTimeout(resolve, 3000));

                            const checkboxAfterClick = await frame.evaluate(() => {
                                const element = document.querySelector('div[id="checkbox"][role="checkbox"]');
                                if (element) {
                                    const ariaChecked = element.getAttribute('aria-checked');
                                    return {
                                        'aria-checked': ariaChecked,
                                        checked: ariaChecked === 'true',
                                        elementFound: true
                                    };
                                }
                                return { elementFound: false };
                            });

                            if (checkboxAfterClick.elementFound) {
                                if (checkboxAfterClick.checked) {
                                    console.log('✅ Checkbox successfully checked!');
                                }

                                try {
                                    const verifyButton = await frame.$('button[type="submit"], button.verify, button.submit, input[type="submit"], .verify-button, #verify, #submit');
                                    if (verifyButton) {
                                        await frame.click('button[type="submit"], button.verify, button.submit, input[type="submit"], .verify-button, #verify, #submit');
                                    }
                                } catch (verifyError) {}

                                await new Promise(resolve => setTimeout(resolve, 10000));
                            }
                            break;
                        }
                    } catch (frameError) {}
                }
            }
        }

        if (!checkboxExists) {
            console.error('❌ hCaptcha checkbox not found!');
        }

    } catch (error) {
        console.error('❌ Error during captcha checking:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function runRepeatedCaptchaCheck() {
    const checkInterval = setInterval(async () => {
        try {
            await checkCaptchaCheckbox();
        } catch (error) {}
    }, nextCheck * 60 * 1000);

    process.on('SIGINT', () => {
        clearInterval(checkInterval);
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        clearInterval(checkInterval);
        process.exit(0);
    });

    console.log(`🚀 Running first captcha check at ${new Date().toLocaleTimeString()}...`);
    try {
        await checkCaptchaCheckbox();
        console.log(`⏳ Next check in ${nextCheck} minutes...`);
    } catch (error) {
        console.log(`⏳ Continuing with scheduled checks in ${nextCheck} minutes...`);
    }
}

runRepeatedCaptchaCheck().catch(error => {});
