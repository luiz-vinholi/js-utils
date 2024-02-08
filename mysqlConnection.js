const mysql = require('mysql')

class MySqlConnection {
  constructor () {
    this.databaseNames = []
  }

  static getInstance () {
    if (!MySqlConnection.instance) {
      MySqlConnection.instance = new MySqlConnection()
    }
    return MySqlConnection.instance
  }

  connect (configs = [{
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBHOSTPASSWORD,
    database: process.env.DBDATABASE
  }]) {
    return new Promise((resolve, reject) => {
      const connections = configs.map((config) => {
        const database = config.database
        this.databaseNames.push(database)
        this[database] = new Connection(mysql.createConnection({
          host: process.env.DBHOST,
          user: process.env.DBUSER,
          password: process.env.DBHOSTPASSWORD,
          database
        }))
        return this[database]
      })
      return Promise.all(connections.map(async (c) => {
        return new Promise((resolve, reject) => {
          c.connection.connect((err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      }))
        .then(resolve)
        .catch(reject)
    })
  }

  getConnection (name = process.env.DBDATABASE) {
    if (this.databaseNames.includes(name)) {
      return this[name]
    } else {
      throw new Error('Database not found')
    }
  }
}

class Connection {
  constructor (connection) {
    this.connection = connection
  }

  query (sql, params) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  disconnect () {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}

module.exports = MySqlConnection.getInstance()
