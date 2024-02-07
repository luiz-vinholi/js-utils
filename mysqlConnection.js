const mysql = require('mysql')

class MySqlConnection {
  constructor () {
    this.connection = null
  }

  static getInstance () {
    if (!MySqlConnection.instance) {
      MySqlConnection.instance = new MySqlConnection()
    }
    return MySqlConnection.instance
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.connection = new Connection(mysql.createConnection({
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBHOSTPASSWORD,
        database: process.env.DBDATABASE
      }))
      const connections = [this.connection]
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

  getConnection (name = 'db') {
    return {
      db: this.connection
    }[name]
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
