import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'user_id',
    });

    this.belongsTo(models.File, {
      as: 'avatar',
      foreignKey: 'avatar_id',
    });

    this.belongsToMany(models.User, {
      through: 'users-meetups',
      as: 'participants',
      foreignKey: 'meetup_id',
    });
  }
}

export default Meetup;
