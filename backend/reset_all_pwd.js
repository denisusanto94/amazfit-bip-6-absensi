const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function resetAllPasswords() {
    try {
        const defaultPassword = '12345678';
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

        const [result] = await pool.execute(
            'UPDATE users SET password = ?',
            [hashedPassword]
        );

        console.log(`\n===========================================`);
        console.log(`  Password reset berhasil!`);
        console.log(`  Total user yang di-reset: ${result.affectedRows}`);
        console.log(`  Password baru: ${defaultPassword}`);
        console.log(`===========================================\n`);

        process.exit(0);
    } catch (err) {
        console.error('Error resetting passwords:', err);
        process.exit(1);
    }
}

resetAllPasswords();
