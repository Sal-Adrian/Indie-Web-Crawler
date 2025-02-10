const {JSDOM} = require('jsdom');

async function crawlPage(currentUrl, pages, visited) {
    const currUrlObj = new URL(currentUrl);
    if (visited.indexOf(currUrlObj.hostname) < 0) {
        visited.push(currUrlObj.hostname);
    }

    const normalizedCurrentUrl = normalizeURL(currentUrl);
    if (pages[normalizedCurrentUrl] > 0 || pages[normalizedCurrentUrl] < 0) {
        return visited;
    }

    pages[normalizedCurrentUrl] = -1;

    console.log(`Actively crawling: ${currentUrl}`);

    try {
        const resp = await fetch(currentUrl);
        
        if (resp.status > 399) {
            console.log("Error in fetching with status code: ", resp.status, " on page: ", currentUrl);
            return visited;
        }

        const contentType = resp.headers.get("content-type");
        if (!contentType.includes("text/html")) {
            console.log("Non HTML response, content type: ", contentType, " on page: ", currentUrl);
            return visited;
        }

        const htmlBody = await resp.text();

        const nextUrls = getURLsFromHTML(htmlBody, currentUrl);

        // let nextUrlObj;
        for (const nextUrl of nextUrls) {
            let nextUrlObj = new URL(nextUrl);
            if (currUrlObj.hostname !== nextUrlObj.hostname &&
              visited.indexOf(nextUrlObj.hostname) < 0) {
                crawlPageAbsolute(nextUrl, pages);
            }
            // pages = await crawlPage(baseUrl, nextUrl, pages);
        }
    } catch(err) {
        console.log(`Error fetching from: `, currentUrl, err.message);
    }

    return visited;
}

async function crawlPageAbsolute(currentUrl, pages) {
    const normalizedCurrentUrl = normalizeURL(currentUrl);
    if (!normalizedCurrentUrl) {
        pages[normalizedCurrentUrl] = -1;
        return;//pages;
    }
    if (pages[normalizedCurrentUrl] > 0) {
        pages[normalizedCurrentUrl]++;
        return;// pages;
    }

    pages[normalizedCurrentUrl] = 1;

    console.log(`Actively crawlinig: ${currentUrl}`);

    try {
        const resp = await fetch(currentUrl);
        
        if (resp.status > 399) {
            console.log("Error in fetching with status code: ", resp.status, " on page: ", currentUrl);
            return;// pages;
        }

        const contentType = resp.headers.get("content-type");
        if (!contentType.includes("text/html")) {
            console.log("Non HTML response, content type: ", contentType, " on page: ", currentUrl);
            return;// pages;
        }
    } catch(err) {
        console.log(`Error fetching from: `, currentUrl, err.message);
    }

    return;// pages;
}

function getURLsFromHTML(htmlBody, baseURL) {
    const urls = [];
    const dom = new JSDOM(htmlBody);
    const linkElements = dom.window.document.querySelectorAll('a');
    for (linkElement of linkElements) {
        if (linkElement.href.slice(0, 1) === '/') {
            try {
                const urlObj = new URL(`${baseURL}${linkElement.href}`);
                urls.push(urlObj.href);
            } catch(err) {
                console.log("error with relative URL:", err.message);
            }
        } else {
            try {
                const urlObj = new URL(linkElement.href);
                urls.push(urlObj.href);
            } catch(err) {
                console.log("error with absolute URL:", err.message);
            }
        }
    }
    return urls;
}

function normalizeURL(urlString) {
    const blacklist = ["", "www.wired.com", "www.fastcodesign.com", "motherboard.vice.com", "arstechnica.com",
        "web.appstorm.net", "github.com", "bsky.app", "status.neocitiesops.net"];
    
    const urlObj = new URL(urlString);
    if (blacklist.indexOf(urlObj.hostname) > -1) {
        return "";
    }

    const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
    if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
        return hostPath.slice(0, -1);
    }
    return hostPath;
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
}