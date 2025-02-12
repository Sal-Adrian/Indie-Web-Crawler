# Web Crawler

## Work in progress...

This a web crawler specifically designed for Neocities. The crawler will go to a random page by traversing the web of users, and the user will try to find that webpage.

## How to use

Traverse into this folder in the terminal and enter the following command:

node index.js [URL] [depth] [seeReport] [seeDebug]

URL - The URL you want to start the crawler at. Required.

depth (default: 1) - An integer that tells the crawler the farthest it can go. Optional.

seeReport (default: n) - Report displays the amount of times the hyperlinks were found in each page. "n" hides the report. Optional.

seeDebug (default: n) - Debug messages displays what pages are being visited and whether there was an error. "n" hides the debug messages. Optional.