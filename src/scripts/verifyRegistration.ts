import { Organization } from '../models/organization';
import { User } from '../models/user';
import sequelize from '../config/dbConnection';

const API_URL = 'http://localhost:3000/api/v1/users/register';

const verifyRegistration = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Create a test organization directly in DB to get an ID
    const organization = await Organization.create({
      name: 'Test Org for Registration ' + Date.now(),
    });
    console.log('Created organization:', organization.id);

    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          organizationId: organization.id,
        }),
      });

      console.log('Registration status:', response.status);
      const data = await response.json();
      
      if (response.ok) {
         console.log('User:', data.user.email);
         console.log('Token:', data.token ? 'Received' : 'Missing');

         // Verify in DB
         const user = await User.findOne({ where: { email } });
         if (user && user.organizationId === organization.id) {
           console.log('User verified in database.');
         } else {
           console.error('User not found in database or organization mismatch.');
         }
      } else {
         console.error('Registration failed:', data);
      }

    } catch (error: any) {
      console.error('Fetch failed:', error.message);
    }

  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    // await sequelize.close(); // Keep connection open? No, close it.
    // However, verifyRegistration is async, so closing here might close before query completes if I messed up await.
    // I awaited everything so it should be fine.
  }
};

verifyRegistration().then(() => {
    // Force exit as sequelize might keep connection open
    setTimeout(() => process.exit(0), 1000);
});
