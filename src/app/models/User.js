import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcrypt';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize, // conexão
      }
    );

    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 10);
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { as: 'avatar', foreignKey: 'avatar_id' });

    this.belongsToMany(models.Meetup, {
      through: 'users-meetups',
      as: 'subscribes',
      foreignKey: 'user_id',
    });
  }

  async checkPassword(password) {
    const match = await bcrypt.compareSync(password, this.password_hash);

    return match;
  }
}

export default User;
