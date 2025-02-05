const {crawlPage} = require('./crawl');
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
    let depth = process.argv.length > 3 ? process.argv[3]-1 : 0;

    let baseUrl = process.argv[2];

    console.log("Starting crawl of ", baseUrl);
    let pages = await crawlPage(baseUrl, baseUrl, {});

    for (; depth > 0; depth--) {
        console.log("Starting crawl of ", baseUrl);
        pages = await crawlPage(baseUrl, baseUrl, {});
        // printReport(pages);
    }

    printReport(pages);
}

main();