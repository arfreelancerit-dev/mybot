const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const nextCheck = 5;
async function checkCaptchaCheckbox() {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true,
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
            await page.goto('https://api.teamcyber71.online/SV-MAIN/captchax.php', {
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

        const allElements = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const result = {
                checkboxes: [],
                iframes: [],
                captchaRelated: []
            };

            elements.forEach(el => {
                if (el.getAttribute('role') === 'checkbox' ||
                    el.id === 'checkbox' ||
                    el.classList.contains('checkbox')) {
                    result.checkboxes.push({
                        tag: el.tagName,
                        id: el.id,
                        class: el.className,
                        attributes: {
                            role: el.getAttribute('role'),
                            'aria-checked': el.getAttribute('aria-checked'),
                            'aria-haspopup': el.getAttribute('aria-haspopup'),
                            tabindex: el.getAttribute('tabindex')
                        }
                    });
                }

                if (el.tagName === 'IFRAME') {
                    result.iframes.push({
                        id: el.id,
                        src: el.src,
                        class: el.className
                    });
                }

                const textContent = el.textContent?.toLowerCase() || '';
                const className = el.className?.toLowerCase() || '';
                const id = el.id?.toLowerCase() || '';

                if (textContent.includes('captcha') ||
                    textContent.includes('verify') ||
                    textContent.includes('robot') ||
                    className.includes('captcha') ||
                    id.includes('captcha')) {
                    result.captchaRelated.push({
                        tag: el.tagName,
                        id: el.id,
                        class: el.className,
                        text: textContent.substring(0, 100)
                    });
                }
            });

            return result;
        });

        if (allElements.checkboxes.length > 0) {
        }

        if (allElements.iframes.length > 0) {
        }

        if (allElements.captchaRelated.length > 0) {
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

        const updatedElements = await page.evaluate(() => {
            return {
                checkboxes: Array.from(document.querySelectorAll('[role="checkbox"], #checkbox')).length,
                iframes: Array.from(document.querySelectorAll('iframe')).length
            };
        });

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

                            const frameElementInfo = await frame.evaluate(() => {
                                const element = document.querySelector('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');

                                if (element) {
                                    const computedStyle = window.getComputedStyle(element);
                                    return {
                                        tagName: element.tagName,
                                        id: element.id,
                                        attributes: {
                                            'aria-haspopup': element.getAttribute('aria-haspopup'),
                                            'aria-checked': element.getAttribute('aria-checked'),
                                            'role': element.getAttribute('role'),
                                            'tabindex': element.getAttribute('tabindex'),
                                            'aria-live': element.getAttribute('aria-live'),
                                            'aria-labelledby': element.getAttribute('aria-labelledby')
                                        },
                                        styles: {
                                            position: computedStyle.position,
                                            width: computedStyle.width,
                                            height: computedStyle.height,
                                            borderWidth: computedStyle.borderWidth,
                                            borderStyle: computedStyle.borderStyle,
                                            borderColor: computedStyle.borderColor,
                                            borderRadius: computedStyle.borderRadius,
                                            backgroundColor: computedStyle.backgroundColor,
                                            outlineColor: computedStyle.outlineColor,
                                            top: computedStyle.top,
                                            left: computedStyle.left
                                        }
                                    };
                                }
                                return null;
                            });
                            const expectedStyles = {
                                position: 'absolute',
                                width: '28px',
                                height: '28px',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: 'rgb(85, 85, 85)',
                                borderRadius: '4px',
                                backgroundColor: 'rgb(250, 250, 250)',
                                outlineColor: 'rgb(0, 131, 143)',
                                top: '0px',
                                left: '0px'
                            };
                            let stylesMatch = true;
                            for (const [property, expectedValue] of Object.entries(expectedStyles)) {
                                const actualValue = frameElementInfo.styles[property];
                                if (actualValue !== expectedValue) {
                                    stylesMatch = false;
                                }
                            }

                            if (stylesMatch) {
                            }

                            try {
                                await frame.click('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');
                            } catch (clickError) {
                            }

                            try {
                                await frame.focus('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');
                                await frame.click('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');
                            } catch (focusError) {
                            }

                            try {
                                await frame.evaluate(() => {
                                    const checkbox = document.querySelector('div[id="checkbox"][aria-haspopup="true"][aria-checked="false"][role="checkbox"][tabindex="0"]');
                                    if (checkbox) {
                                        checkbox.click();
                                        return true;
                                    }
                                    return false;
                                });
                            } catch (jsError) {
                            }
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            const checkboxAfterClick = await frame.evaluate(() => {
                                const element = document.querySelector('div[id="checkbox"][role="checkbox"]');
                                if (element) {
                                    const ariaChecked = element.getAttribute('aria-checked');
                                    const allAttributes = {};
                                    for (let attr of element.attributes) {
                                        allAttributes[attr.name] = attr.value;
                                    }

                                    const computedStyle = window.getComputedStyle(element);
                                    const hasClickListeners = element.onclick !== null || element.hasAttribute('onclick');


                                    return {
                                        'aria-checked': ariaChecked,
                                        checked: ariaChecked === 'true',
                                        elementFound: true,
                                        allAttributes: allAttributes,
                                        hasClickListeners: hasClickListeners,
                                        style: {
                                            backgroundColor: computedStyle.backgroundColor,
                                            borderColor: computedStyle.borderColor
                                        }
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
                                } catch (verifyError) {
                                }

                                await new Promise(resolve => setTimeout(resolve, 10000));

                            }

                            break;
                        }
                    } catch (frameError) {
                    }
                }
            }
        }

        if (checkboxExists) {
        } else {
            console.error('❌ hCaptcha checkbox not found!');

            const debugInfo = await page.evaluate(() => {
                return {
                    checkboxes: Array.from(document.querySelectorAll('[role="checkbox"]')).map(el => ({
                        id: el.id,
                        attributes: {
                            'aria-checked': el.getAttribute('aria-checked'),
                            'aria-haspopup': el.getAttribute('aria-haspopup'),
                            'tabindex': el.getAttribute('tabindex')
                        }
                    })),
                    divsWithId: Array.from(document.querySelectorAll('div[id]')).map(el => el.id)
                };
            });

        }

    } catch (error) {
        console.error('❌ Error during captcha checking:', error.message);

        if (browser) {
            try {
                const pages = await browser.pages();
                if (pages.length > 0) {
                    const page = pages[0];
                    const url = page.url();
                }
            } catch (debugError) {
                console.error('Could not get debug information:', debugError.message);
            }
        }
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
        } catch (error) {
        }
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

runRepeatedCaptchaCheck().catch(error => {
});
