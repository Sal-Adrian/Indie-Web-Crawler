const jsdom = require('jsdom');
const {JSDOM} = require('jsdom');
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => {});   // Hides jsdom error when CSS stylesheet is in HTML

const blacklist = ["", "www.wired.com", "www.fastcodesign.com", "motherboard.vice.com", "arstechnica.com",
    "web.appstorm.net", "github.com", "bsky.app", "status.neocitiesops.net", "www.mozilla.org", "x.com", 
    "www.facebook.com", "twitter.com", "www.deviantart.com", "www.microsoft.com", "www.pinterest.com",
    "itch.io", "www.instagram.com", "en.wikipedia.org", "www.google.com", "www.linkedin.com", "www.namecheap.com",
    "play.google.com", "itunes.apple.com", "statcounter.com", "web.archive.org", "youtube.com", "www.youtube.com",
    "discord.gg", "soundcloud.com", "www.patreon.com", "www.gofundme.com", "youtu.be", "tv.youtube.com",
    "www.mabsland.com", "www.tumblr.com", "studio.code.org", "www.snapchat.com", "bit.ly", "www.reddit.com",
    "reddit.com", "mozilla.org", "www.archive.org", "archive.org", "discord.com", "pinterest.com", "www.paypal.com"];

async function crawlPage(currentUrl, pages, visited, seeDebug) {
    // Stops crawling if website is really big
    if (Object.keys(pages).length > 100) return;

    const normalizedCurrentUrl = normalizeURL(currentUrl);
    if (typeof pages[normalizedCurrentUrl] !== 'undefined') return;

    pages[normalizedCurrentUrl] = -1;

    const currUrlObj = new URL(currentUrl);
    if (visited.indexOf(currUrlObj.hostname) < 0) visited.push(currUrlObj.hostname);

    if (seeDebug != "n") console.log(`Actively crawling: ${currentUrl}`);

    let promises = [];
    try {
        const resp = await fetch(currentUrl);

        if (resp.status > 399) {
            if (seeDebug != "n") console.log("Error in fetching with status code: ", resp.status, " on page: ", currentUrl);
            return visited;
        }

        const contentType = resp.headers.get("content-type");
        if (!contentType.includes("text/html")) {
            if (seeDebug != "n") console.log("Non HTML response, content type: ", contentType, " on page: ", currentUrl);
            return visited;
        }

        const htmlBody = await resp.text();

        const nextUrls = getURLsFromHTML(htmlBody, currentUrl, seeDebug);

        for (const nextUrl of nextUrls) {
            let nextUrlObj = new URL(nextUrl);
            if (currUrlObj.hostname === nextUrlObj.hostname &&
                currUrlObj.hostname != "neocities.org") {
                promises.push(crawlPage(nextUrl, pages, visited, seeDebug));
            } else if (visited.indexOf(nextUrlObj.hostname) < 0) {
                promises.push(crawlPageAbsolute(nextUrl, pages, seeDebug));
            }
        }
    } catch(err) {
        if (seeDebug != "n") console.log(`Error fetching from: `, currentUrl, err.message);
    }
    await Promise.all(promises).then( function () {}, function (err) {});
    return visited;
}

async function crawlPageAbsolute(currentUrl, pages, seeDebug) {
    const normalizedCurrentUrl = normalizeURL(currentUrl);
    if (typeof pages[normalizedCurrentUrl] !== 'undefined') {
        if (pages[normalizedCurrentUrl] > 0) pages[normalizedCurrentUrl]++;
        return;
    }
    if (!normalizedCurrentUrl) { 
        pages[normalizedCurrentUrl] = -1;
        return;
    }
    pages[normalizedCurrentUrl] = 1;

    if (seeDebug != "n") console.log(`Fetching: ${currentUrl}`);

    try {
        const resp = await fetch(currentUrl);
        
        if (resp.status > 399) {
            if (seeDebug != "n") console.log("Error in fetching with status code: ", resp.status, " on page: ", currentUrl);
            pages[normalizedCurrentUrl] = -1;
            return;
        }

        const contentType = resp.headers.get("content-type");
        if (!contentType.includes("text/html")) {
            if (seeDebug != "n") console.log("Non HTML response, content type: ", contentType, " on page: ", currentUrl);
            pages[normalizedCurrentUrl] = -1;
            return;
        }
    } catch(err) {
        if (seeDebug != "n") console.log(`Error fetching from: `, currentUrl, err.message);
        pages[normalizedCurrentUrl] = -1;
    }
}

function getURLsFromHTML(htmlBody, baseURL, seeDebug) {
    const urls = [];
    const dom = new JSDOM(htmlBody, { virtualConsole });
    const linkElements = dom.window.document.querySelectorAll('a');
    for (linkElement of linkElements) {
        if (linkElement.href.slice(0, 1) === '/' ||
        linkElement.href.slice(-5) === ".html" ) {
            try {
                let urlString = baseURL;
                if (linkElement.href.slice(-5) === ".html") urlString += '/';
                urlString += linkElement.href;
                const urlObj = new URL(urlString);
                urls.push(urlObj.href);
            } catch(err) {
                if (seeDebug != "n") console.log("error with relative URL:", err.message);
            }
        } else {
            try {
                const urlObj = new URL(linkElement.href);
                urls.push(urlObj.href);
            } catch(err) {
                if (seeDebug != "n") console.log("error with absolute URL:", err.message);
            }
        }
    }
    return urls;
}

function normalizeURL(urlString) {
    const urlObj = new URL(urlString);
    const hName = urlObj.hostname;
    if (blacklist.indexOf(hName) > -1 ||
        hName.substring(0, 6) == "google" ||
        hName.substring(hName.indexOf(".")+1, hName.indexOf(".")+7) == "google") return "";

    const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
    if (hostPath.length > 0 && hostPath.slice(-1) === '/') return hostPath.slice(0, -1);
    
    return hostPath;
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage,
}