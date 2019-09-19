module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users', // qual tabela quero add a nova coluna
      'avatar_id', // nome da coluna, esse nome é o mesmo referenciado no model em associate()
      {
        type: Sequelize.INTEGER,
        references: { model: 'files', key: 'id' }, // a que tabela irá referenciar
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      }
    );
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
