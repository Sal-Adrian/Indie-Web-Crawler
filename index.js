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
    const depth = process.argv.length > 3 ? process.argv[3] : 1;
    // Default hides report and debug messages
    const seeReport = process.argv.length > 4 ? process.argv[4] : "n";
    const seeDebug = process.argv.length > 5 ? process.argv[5] : "n";
    let baseUrl = process.argv[2];

    let thePage = await crawl(baseUrl, [], depth, seeReport, seeDebug);
    console.log("CRAWLER IS AT:", thePage);
}

async function crawl(baseUrl, visited, depth, seeReport, seeDebug) {
    if (depth > 1) console.log(depth, " more pages to go!");
    else if (depth < 1) return baseUrl;
    else console.log("1 more page to go!");

    if (seeReport != "n") {
        console.log("==================================");
        console.log("Starting crawl of ", baseUrl);
    }
    let pages = {};
    visited = await crawlPage(baseUrl, pages, visited, seeDebug);
    let keys = Object.keys(pages);

    for (let key of keys) {
        if(pages[key] < 0) delete pages[key];
    }
    
    if (seeReport != "n") console.log("==================================");
    let newUrl, newUrlObj, i = 0;
    while (i < 50) {
        i++;
        newUrl = "https://" + keys[ Math.floor(Math.random() * keys.length) ];
        try {
            newUrlObj = new URL(newUrl);
        } catch (err) {
            continue;
        }

        if (visited.indexOf(newUrlObj.hostname) < 0)
            break;
    }
    if (i > 49) return baseUrl;
    
    if (seeReport != "n") printReport(pages);

    thePage = await crawl(newUrl, visited, --depth, seeReport, seeDebug);
    return thePage;
}

main();