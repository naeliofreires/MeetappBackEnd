import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  addDays,
  parseISO,
  isAfter,
  format,
  startOfDay,
  endOfDay,
} from 'date-fns';

import User from '../models/User';
import Meetup from '../models/Meetup';

class MeetupController {
  /**
   * retorna todos os meetups do usuario logado
   * @param {*} req
   * @param {*} res
   */
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
    });

    return res.json(meetups);
  }

  /**
   * retorna os meetups de acordo com a data passada
   * @param {*} req
   * @param {*} res
   */
  async filter(req, res) {
    const { page, date } = req.query;

    const parseDate = parseISO(date);

    const meetups = await Meetup.findAll({
      attributes: ['id', 'title', 'description', 'location', 'date'],
      where: {
        date: {
          [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
        },
      },
      limit: 10,
      offset: (page - 1) * 10,
      order: ['date'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validação dos dados falhou' });

    const { date } = req.body;

    const validDate = isAfter(parseISO(date), addDays(new Date(), 1));

    if (!validDate)
      return res.status(400).json({
        error: 'Você deve cadastrar eventos com mais de um dia de validade',
      });

    const alreadyExists = await Meetup.findOne({
      where: { date: parseISO(date), user_id: req.userId },
    });

    if (alreadyExists)
      return res.status(400).json({
        error: `Você já tem um Meetup: ${
          alreadyExists.title
        }, cadastrado nessa data: ${format(alreadyExists.date, 'dd/MM/yyyy')}`,
      });

    const meetup = await Meetup.create({
      ...req.body,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validação dos dados falhou' });

    const validDate = isAfter(parseISO(req.body.date), addDays(new Date(), 1));

    if (!validDate)
      return res.status(400).json({
        error: 'A data do evento deve ser com mais de um dia de validade',
      });

    const { id } = req.params;

    const meetup = await Meetup.findOne({ where: { id, finished_at: null } });

    if (!meetup || req.userId !== meetup.user_id)
      return res.status(400).json({ error: 'Você não tem permissão' });

    const { title, description, location, date } = await meetup.update(
      req.body
    );

    return res.json({ title, description, location, date });
  }

  async delete(req, res) {
    const { id } = req.params;

    const meetup = await Meetup.findOne({ where: { id, finished_at: null } });

    if (req.userId !== meetup.user_id)
      return res.status(400).json({ error: 'Você não tem permissão' });

    meetup.delete();

    return res.json({ message: 'Meetup cancelado com sucesso' });
  }
}

export default new MeetupController();
