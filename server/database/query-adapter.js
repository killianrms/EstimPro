// Adaptateur pour gérer les différences entre SQLite et PostgreSQL
const { db } = require('./db');

const isPostgres = process.env.DATABASE_URL ? true : false;

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      // PostgreSQL utilise $1, $2, etc.
      let pgSql = sql;
      let paramIndex = 1;
      
      // Remplacer les ? par $1, $2, etc.
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
      
      db.query(pgSql, params)
        .then(result => {
          // Adapter la réponse pour ressembler à SQLite
          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            resolve({ 
              rows: result.rows,
              get: (callback) => callback(null, result.rows[0]),
              all: (callback) => callback(null, result.rows)
            });
          } else {
            resolve({ 
              lastID: result.rows[0]?.id,
              changes: result.rowCount
            });
          }
        })
        .catch(reject);
    } else {
      // SQLite
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve({ 
            rows: row ? [row] : [],
            get: (callback) => callback(err, row),
            all: (callback) => db.all(sql, params, callback)
          });
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ 
            lastID: this.lastID,
            changes: this.changes
          });
        });
      }
    }
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let pgSql = sql;
      let paramIndex = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
      
      db.query(pgSql, params)
        .then(result => resolve(result.rows[0] || null))
        .catch(reject);
    } else {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    }
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let pgSql = sql;
      let paramIndex = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
      
      db.query(pgSql, params)
        .then(result => resolve(result.rows))
        .catch(reject);
    } else {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let pgSql = sql;
      let paramIndex = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
      
      db.query(pgSql, params)
        .then(result => resolve({ 
          lastID: result.rows[0]?.id,
          changes: result.rowCount
        }))
        .catch(reject);
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ 
          lastID: this.lastID,
          changes: this.changes
        });
      });
    }
  });
};

module.exports = { query, get, all, run, isPostgres };