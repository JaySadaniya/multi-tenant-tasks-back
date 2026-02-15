'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const orgId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const password = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('organizations', [{
      id: orgId,
      name: 'Default Organization',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('users', [{
      id: userId,
      email: 'admin@default.com',
      password: password,
      role: 'Admin',
      organizationId: orgId,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@default.com' }, {});
    await queryInterface.bulkDelete('organizations', { name: 'Default Organization' }, {});
  }
};
