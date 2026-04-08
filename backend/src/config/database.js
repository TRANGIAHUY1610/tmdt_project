const mysql = require("mysql2/promise");

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gymstore",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

const normalizeNamedQuery = (sqlQuery, params = {}) => {
  const values = [];
  const normalized = sqlQuery.replace(/@(\w+)/g, (_, key) => {
    if (!Object.prototype.hasOwnProperty.call(params, key)) {
      throw new Error(`Missing SQL parameter: @${key}`);
    }
    values.push(params[key]);
    return "?";
  });

  return { normalized, values };
};

const connectDB = async () => {
  try {
    if (!pool) {
      pool = mysql.createPool(config);
    }
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ MySQL Connected Successfully!");
  } catch (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
    process.exit(1);
  }
};

const dbHelpers = {
  getPool: () => pool,
  query: async (sqlQuery, params = {}) => {
    const { normalized, values } = normalizeNamedQuery(sqlQuery, params);
    const [rows] = await pool.query(normalized, values);
    return rows;
  },
  execute: async (sqlQuery, params = {}) => {
    const { normalized, values } = normalizeNamedQuery(sqlQuery, params);
    const [result] = await pool.execute(normalized, values);
    return result;
  },
  getOne: async (sqlQuery, params = {}) => {
    const result = await dbHelpers.query(sqlQuery, params);
    return result[0] || null;
  },
};

module.exports = { connectDB, dbHelpers };
