
const GotCouch = require('got-couch')


module.exports = ({ db_config }) => GotCouch(db_config)
