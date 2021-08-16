const middleware = require('./middleware');
const util = require('./util');
const pageDao = require('./page.dao');

module.exports = {
  ...middleware,
  ...util,
  ...pageDao
};

