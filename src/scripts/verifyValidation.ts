import { Organization } from '../models/organization';
import sequelize from '../config/dbConnection';

const API_URL = 'http://localhost:3000/api/v1/users/register';

const verifyValidation = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Create a test organization directly in DB to get an ID
    const organization = await Organization.create({
      name: 'Test Org for Validation ' + Date.now(),
    });
    console.log('Created organization:', organization.id);

    const validPayload = {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      organizationId: organization.id,
    };

    // Test 1: Valid Payload
    console.log('\nTest 1: Valid Payload');
    const res1 = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload)
    });
    console.log('Status:', res1.status);
    if (res1.status === 201) console.log('PASS'); else console.log('FAIL', await res1.json());

    // Test 2: Invalid Email
    console.log('\nTest 2: Invalid Email');
    const res2 = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validPayload, email: 'not-an-email' })
    });
    console.log('Status:', res2.status);
    const data2 = await res2.json();
    console.log('Error:', data2.message);
    if (res2.status === 400 && data2.message.includes('email')) console.log('PASS'); else console.log('FAIL');

    // Test 3: Short Password
    console.log('\nTest 3: Short Password');
    const res3 = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validPayload, password: '123' })
    });
    console.log('Status:', res3.status);
    const data3 = await res3.json();
    console.log('Error:', data3.message);
    if (res3.status === 400 && data3.message.includes('password')) console.log('PASS'); else console.log('FAIL');

     // Test 4: Missing OrganizationId
     console.log('\nTest 4: Missing OrganizationId');
     const res4 = await fetch(API_URL, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ ...validPayload, organizationId: undefined })
     });
     console.log('Status:', res4.status);
     const data4 = await res4.json();
     console.log('Error:', data4.message);
     if (res4.status === 400 && data4.message.includes('organizationId')) console.log('PASS'); else console.log('FAIL');

  } catch (error) {
    console.error('Script failed:', error);
  } finally {
      // Force exit as sequelize might keep connection open
     setTimeout(() => process.exit(0), 1000);
  }
};

verifyValidation();
