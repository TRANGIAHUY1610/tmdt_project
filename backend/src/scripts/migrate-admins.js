const mysql = require("mysql2/promise");
require("dotenv").config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "gymstore",
  });

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL UNIQUE,
        name VARCHAR(100),
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        status ENUM('active', 'revoked') NOT NULL DEFAULT 'active',
        admin_code VARCHAR(50) UNIQUE,
        granted_by INT,
        granted_note VARCHAR(255),
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        revoked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_admins_user FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_admins_granted_by FOREIGN KEY (granted_by)
          REFERENCES users(id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);

    const [hasEmailColumnRows] = await connection.execute("SHOW COLUMNS FROM admins LIKE 'email'");
    if (!hasEmailColumnRows.length) {
      await connection.execute("ALTER TABLE admins ADD COLUMN name VARCHAR(100) NULL AFTER user_id");
      await connection.execute("ALTER TABLE admins ADD COLUMN email VARCHAR(100) NULL AFTER name");
      await connection.execute("ALTER TABLE admins ADD COLUMN password VARCHAR(255) NULL AFTER email");
      await connection.execute("ALTER TABLE admins ADD COLUMN phone VARCHAR(20) NULL AFTER password");
      await connection.execute("ALTER TABLE admins ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER phone");
      await connection.execute("ALTER TABLE admins MODIFY user_id INT NULL UNIQUE");
      await connection.execute("ALTER TABLE admins ADD UNIQUE KEY uq_admins_email (email)");
    }

    const [inserted] = await connection.execute(`
      INSERT INTO admins (user_id, name, email, password, phone, is_active, status, granted_note, granted_at)
      SELECT u.id, u.name, u.email, u.password, u.phone, u.is_active, 'active', 'Dong bo tu users.role=admin', NOW()
      FROM users u
      LEFT JOIN admins a ON a.user_id = u.id AND a.status = 'active'
      LEFT JOIN admins ae ON ae.email = u.email
      WHERE u.role = 'admin' AND a.id IS NULL AND ae.id IS NULL
    `);

    const [detached] = await connection.execute(`
      UPDATE admins a
      JOIN users u ON u.id = a.user_id
      SET
        a.name = COALESCE(a.name, u.name),
        a.email = COALESCE(a.email, u.email),
        a.password = COALESCE(a.password, u.password),
        a.phone = COALESCE(a.phone, u.phone),
        a.is_active = COALESCE(a.is_active, u.is_active),
        a.user_id = NULL,
        a.updated_at = NOW()
      WHERE a.status = 'active'
    `);

    const [normalized] = await connection.execute(`
      UPDATE users
      SET role = 'customer', updated_at = NOW()
      WHERE role = 'admin'
    `);

    const [removed] = await connection.execute(`
      DELETE u FROM users u
      JOIN admins a ON a.email = u.email AND a.status = 'active'
      WHERE u.role = 'customer'
    `);

    const [rows] = await connection.execute(`
      SELECT
        (SELECT COUNT(*) FROM admins WHERE status = 'active') AS active_admins,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS users_role_admin,
        (SELECT COUNT(*) FROM users u JOIN admins a ON a.email = u.email AND a.status = 'active') AS overlap_admin_user
    `);

    console.log("MIGRATION_OK", {
      insertedAdmins: inserted.affectedRows,
      detachedAdmins: detached.affectedRows,
      normalizedUsers: normalized.affectedRows,
      removedDuplicateAdminUsers: removed.affectedRows,
      summary: rows[0],
    });
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("MIGRATION_FAIL", error.message);
  process.exit(1);
});
