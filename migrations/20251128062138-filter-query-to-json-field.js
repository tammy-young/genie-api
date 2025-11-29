'use strict';

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.removeColumn('filters', 'query');
  await queryInterface.addColumn('filters', 'query', {
    type: Sequelize.JSON,
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('filters', 'query');
  await queryInterface.addColumn('filters', 'query', {
    type: Sequelize.STRING,
  });
}
