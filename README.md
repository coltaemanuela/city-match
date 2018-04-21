# city-match
Discover the city you want to live in


Run app:
1. Clone the repository
2. Access the folder in terminal and rup `npm i` (this will install all the node packagagies defines in package.json)
3. run `node index.js`
4. open the browser - localhost:3000

Project structure:


index.js is the main file.  All other controllers are imported here.
conrtollers/users.js - all the routes related to user (user profile, registration, auth, etc.) will be implemented here
views - all HTML files will be placed here. These views have the ".ejs" extension because the node package called "ejs" is the one we will use for inserting js variables (exported from the controllers) in the HTML.

Learn more about ejs here: https://scotch.io/tutorials/use-ejs-to-template-your-node-application