const {crawlPage} = require('./crawl');
const {hasVisitedNew} = require('./crawl');
const {printReport} = require('./report');

async function main() {
    if (process.argv.length < 3) {
        console.log("No website provided");
        process.exit(1);
    }
    if (process.argv.length > 4) {
        console.log("Too many arguments!");
        process.exit(1);
    }
    // Default depth level set to 1
    let depth = process.argv.length > 3 ? process.argv[3] : 1;
    let baseUrl = process.argv[2];

    let thePage = await crawl(baseUrl, [], depth);
    console.log("CRAWLER IS AT:", thePage);
}

async function crawl(baseUrl, visited, depth) {
    if (depth < 1) {
        return baseUrl;
    }

    console.log("==================================");
    console.log("Starting crawl of ", baseUrl);
    let pages = {};
    visited = await crawlPage(baseUrl, pages, visited);
    let keys = Object.keys(pages);

    console.log("==================================");
    let newUrl = "https://" + keys[ Math.floor(Math.random() * keys.length) ]
    let newUrlObj = new URL(newUrl);
        
    // hasVisitedNew(visited, newUrl)
    for (let i = 0; visited.indexOf(newUrlObj.hostname) > -1; i++) {
        if (i == 50) {
            return baseUrl;
        }
        newUrl = "https://" + keys[ Math.floor(Math.random() * keys.length) ];
        newUrlObj = new URL(newUrl);
    }
    
    printReport(pages);

    console.log(newUrl)
    thePage = await crawl(newUrl, visited, --depth);
    return thePage;
}

main();