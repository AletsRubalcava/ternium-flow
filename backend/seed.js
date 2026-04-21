import dotenv from 'dotenv';
import { sequelize } from './src/config/database.js';
import Usuario from './src/modules/usuarios/usuarios.model.js';
import bcrypt from 'bcrypt';

dotenv.config();

async function seedUsers() {
  try {
    // Sync database
    await sequelize.sync();
    console.log('Database synchronized');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const clientPassword = await bcrypt.hash('cliente123', 10);

    // Create or update users
    const [adminUser, adminCreated] = await Usuario.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: {
        nombre: 'Admin User',
        email: 'admin@test.com',
        password: adminPassword,
        role: 'Administrador',
        id_cliente: null
      }
    });

    const [clientUser, clientCreated] = await Usuario.findOrCreate({
      where: { email: 'cliente@test.com' },
      defaults: {
        nombre: 'Test Cliente',
        email: 'cliente@test.com',
        password: clientPassword,
        role: 'Cliente',
        id_cliente: '550e8400-e29b-41d4-a716-446655440000'
      }
    });

    console.log('Users seeded successfully!');
    console.log('');
    console.log('Test Credentials:');
    console.log('─────────────────────────────────');
    console.log('Admin:');
    console.log('  Email: admin@test.com');
    console.log('  Password: admin123');
    console.log('  Role: Administrador');
    console.log('');
    console.log('Cliente:');
    console.log('  Email: cliente@test.com');
    console.log('  Password: cliente123');
    console.log('  Role: Cliente');
    console.log('─────────────────────────────────');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
