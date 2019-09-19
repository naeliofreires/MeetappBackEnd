import jwt from 'jsonwebtoken';
import configSecret from '../../config/secret';

module.exports = async (req, res, next) => {
  const {
    headers: { authorization },
  } = req;

  if (!authorization) {
    return res.status(401).json({ error: 'Token não enviado' });
  }

  const [, token] = authorization.split(' ');

  try {
    const { id } = jwt.verify(token, configSecret.secret);

    req.userId = id;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido' });
  }
};
