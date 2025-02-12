const {crawlPage} = require('./crawl');
const {printReport} = require('./report');

async function main() {
    if (process.argv.length < 3) {
        console.log("No website provided");
        process.exit(1);
    }
    if (process.argv.length > 6) {
        console.log("Too many arguments!");
        process.exit(1);
    }
    // Default depth level set to 1
    let depth = process.argv.length > 3 ? process.argv[3] : 1;
    // Default hides report and debug messages
    let seeReport = process.argv.length > 4 ? process.argv[4] : false;
    let seeDebug = process.argv.length > 5 ? process.argv[5] : false;
    let baseUrl = process.argv[2];

    let thePage = await crawl(baseUrl, [], depth, seeReport, seeDebug);
    console.log("CRAWLER IS AT:", thePage);
}

async function crawl(baseUrl, visited, depth, seeReport, seeDebug) {
    if (depth > 1) console.log(depth, " more pages to go!");
    else if (depth < 1) return baseUrl;
    else console.log("1 more page to go!");

    if (seeReport) {
        console.log("==================================");
        console.log("Starting crawl of ", baseUrl);
    }
    let pages = {};
    visited = await crawlPage(baseUrl, pages, visited, seeDebug);
    let keys = Object.keys(pages);

    if (seeReport) console.log("==================================");
    let newUrl, newUrlObj;
    let i = 0
    do {
        newUrl = "https://" + keys[ Math.floor(Math.random() * keys.length) ];
        i++;
        if (i > 50) return baseUrl;
        try {
            newUrlObj = new URL(newUrl);
        } catch (err) {
            continue;
        }
    } while (visited.indexOf(newUrlObj.hostname) > -1);
    
    if (seeReport) printReport(pages);

    thePage = await crawl(newUrl, visited, --depth, seeReport, seeDebug);
    return thePage;
}

main();