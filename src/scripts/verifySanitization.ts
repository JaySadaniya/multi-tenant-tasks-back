import { Organization } from '../models/organization';
import sequelize from '../config/dbConnection';

const API_URL = 'http://localhost:3000/api/v1/users/register';

const verifySanitization = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Create a test organization directly in DB to get an ID
        const organization = await Organization.create({
            name: 'Test Org for Transformer ' + Date.now(),
        });
        console.log('Created organization:', organization.id);

        const payload = {
            email: `test-transform-${Date.now()}@example.com`,
            password: 'password123',
            organizationId: organization.id,
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);

        if (response.status === 201) {
            console.log('User created.');
            if (data.user && !data.user.password) {
                console.log('PASS: Password field is missing from response.');
                console.log('User keys:', Object.keys(data.user));
            } else {
                console.error('FAIL: Password field is present in response!', data.user);
            }
        } else {
            console.error('Registration failed:', data);
        }

    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
};

verifySanitization();
