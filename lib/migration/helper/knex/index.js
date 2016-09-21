
const DEFAULTS = {
  DELETED_TIMESTAMP : 0
, CODE_LEN          : 16
, DISPLAY_LEN       : 140
}

const timestamps = (table) => {
  table.specificType('created', 'timestamp DEFAULT CURRENT_TIMESTAMP')

  table.specificType('updated'
  , 'timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')

  table.specificType('deleted', 'tinyint(1) DEFAULT \'0\'')

  table.integer('deleted_timestamp')
    .unsigned().notNullable().defaultTo(DEFAULTS.DELETED_TIMESTAMP)

  return table
}


const standard = (table) => {
  table.bigIncrements()
  return timestamps(table)
}


const type = (table) => {
  table.integer('id').unsigned().primary()
  table.string('code', DEFAULTS.CODE_LEN).unique().notNullable()
  table.string('display', DEFAULTS.DISPLAY_LEN).notNullable()
  timestamps(table)
}


const typeFactory = (name) => ({
  up: (knex) => knex.schema.createTableIfNotExists((name), (t) => type(t))
, down: (knex) => knex.schema.dropTable(name)
})


module.exports = {
  standard
, type
, timestamps
, typeFactory
}
