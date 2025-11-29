// Schema'yı veritabanına yükleyen basit script
import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const client = new pg.Client({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

try {
  console.log('🔌 Veritabanına bağlanılıyor...');
  await client.connect();

  console.log('📄 Schema dosyası okunuyor...');
  const schemaSQL = readFileSync(join(import.meta.dir, 'db/schema.sql'), 'utf-8');

  console.log('🚀 Schema uygulanıyor...');
  await client.query(schemaSQL);

  console.log('✅ Schema başarıyla uygulandı!');
  console.log('\n📊 Oluşturulan tablolar:');
  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  result.rows.forEach(row => {
    console.log(`  ✓ ${row.table_name}`);
  });

} catch (error) {
  console.error('❌ Hata:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
