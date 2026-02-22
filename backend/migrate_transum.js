require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrateTransum() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'absensi',
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        const sql = `
            CREATE TABLE IF NOT EXISTS attendances_transum (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,

                check_in DATETIME NULL,
                check_in_lat DECIMAL(10,8),
                check_in_long DECIMAL(11,8),
                check_in_photo VARCHAR(255),

                check_out DATETIME NULL,
                check_out_lat DECIMAL(10,8),
                check_out_long DECIMAL(11,8),
                check_out_photo VARCHAR(255),

                type_transum ENUM(
                    'LRT',
                    'LRT Jakarta',
                    'MRT',
                    'Transjakarta',
                    'Jaklingko'
                ) NOT NULL,

                city ENUM(
                    'Jakarta Pusat',
                    'Jakarta Timur',
                    'Jakarta Utara',
                    'Jakarta Barat',
                    'Jakarta Selatan',
                    'Bekasi',
                    'Tangerang Selatan',
                    'Tangerang',
                    'Depok',
                    'Bogor'
                ) NOT NULL,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id) REFERENCES users(id)
                    ON DELETE CASCADE ON UPDATE CASCADE
            );
        `;

        console.log('Creating attendances_transum table...');
        await connection.query(sql);

        console.log('✅ Migration completed: attendances_transum table created.');

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrateTransum();
