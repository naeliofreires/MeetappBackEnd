import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';
import Meetup from '../models/Meetup';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validação dos dados falhou' });

    const user = req.body;

    const registeredUser = await User.findOne({ where: { email: user.email } });

    if (registeredUser)
      return res.status(401).json({ error: 'Usuário já cadastrado' });

    const { name, email } = await User.create(user);

    return res.json({ name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { userId } = req;
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(userId);

    if (user.email !== email) {
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return res
          .status(401)
          .json({ error: 'Usuário com email já cadastrado' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha antiga incorreta' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({ id, name, email });
  }

  async getOne(req, res) {
    const { id } = req.params;

    const user = await User.findOne({
      where: { id },
      attributes: ['name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path'],
        },
        {
          model: Meetup,
          as: 'subscribes',
          through: { attributes: [] },
        },
      ],
    });

    return res.json({ user });
  }
}

export default new UserController();
