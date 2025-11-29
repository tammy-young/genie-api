'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('wishes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.BIGINT
    },
    userId: {
      type: Sequelize.BIGINT
    },
    itemSellerId: {
      type: Sequelize.INTEGER
    },
    itemId: {
      type: Sequelize.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('wishes');
}
