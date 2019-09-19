import jwt from 'jsonwebtoken';
import * as yup from 'yup';
import User from '../models/User';

import configSecret from '../../config/secret';

class SessionController {
  async store(req, res) {
    const schema = yup.object().shape({
      email: yup
        .string()
        .email()
        .required(),
      password: yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação dos dados falhou' });
    }

    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não cadastrado' });
    }

    const match = await user.checkPassword(req.body.password);

    if (!match) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const { id } = user;
    const token = jwt.sign({ id }, configSecret.secret, {
      expiresIn: configSecret.expiresIn,
    });

    return res.json({ token });
  }
}

export default new SessionController();
