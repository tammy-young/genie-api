'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('wishes', 'brand', {
    type: Sequelize.STRING
  });
  await queryInterface.addColumn('wishes', 'currencyType', {
    type: Sequelize.INTEGER
  });
  await queryInterface.addColumn('wishes', 'name', {
    type: Sequelize.STRING
  });
  await queryInterface.addColumn('wishes', 'originalPrice', {
    type: Sequelize.INTEGER
  });
  await queryInterface.addColumn('wishes', 'sellPrice', {
    type: Sequelize.INTEGER
  });
  await queryInterface.addColumn('wishes', 'sellerId', {
    type: Sequelize.INTEGER
  });
  await queryInterface.addColumn('wishes', 'type', {
    type: Sequelize.STRING
  });
  await queryInterface.addColumn('wishes', 'userItemId', {
    type: Sequelize.INTEGER
  });
  await queryInterface.removeColumn('wishes', 'itemSellerId');
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('wishes', 'brand');
  await queryInterface.removeColumn('wishes', 'currencyType');
  await queryInterface.removeColumn('wishes', 'name');
  await queryInterface.removeColumn('wishes', 'originalPrice');
  await queryInterface.removeColumn('wishes', 'sellPrice');
  await queryInterface.removeColumn('wishes', 'sellerId');
  await queryInterface.removeColumn('wishes', 'type');
  await queryInterface.removeColumn('wishes', 'userItemId');
  await queryInterface.addColumn('wishes', 'itemSellerId', {
    type: Sequelize.INTEGER
  });
}
