'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'dueDate', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.addColumn('tasks', 'completedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tasks', 'completedAt');
    await queryInterface.removeColumn('tasks', 'dueDate');
  }
};
