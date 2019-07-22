const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    throw result.error;
}
const { parsed: envs } = result;
// export to server.js and catcch the port
module.exports = envs;