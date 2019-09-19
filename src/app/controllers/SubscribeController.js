import { Op } from 'sequelize';
import { startOfDay, endOfDay } from 'date-fns';

import User from '../models/User';
import Meetup from '../models/Meetup';

import Mail from '../../lib/Mail';

class SubscribeController {
  /**
   * lista todos os meetups que o usuario esta inscrito
   * @param {*} req
   * @param {*} res
   */
  async index(req, res) {
    const user = await User.findOne({
      where: { id: req.userId },
      include: [
        {
          model: Meetup,
          as: 'subscribes',
          order: ['date'],
          through: { attributes: [] },
        },
      ],
    });

    return res.json(user.subscribes);
  }

  /**
   * inscrever um usuario em um meetup
   * @param {*} req
   * @param {*} res
   */
  async store(req, res) {
    const { idMeetup } = req.params;

    const meetup = await Meetup.findOne({
      where: {
        id: idMeetup,
        finished_at: null,
        user_id: { [Op.ne]: req.userId }, // verificando se o meetup é do usuario logado
      },
      include: [
        {
          model: User,
          required: false,
          as: 'participants',
          where: { id: { [Op.ne]: req.userId } }, // verificando se o usuario já esta inscrito
          through: { attributes: [] },
        },
      ],
    });

    if (!meetup)
      return res.status(400).json({
        error: 'Você não tem permição para se inscrever nesse Meetup',
      });

    const user = await User.findOne({
      where: { id: req.userId },
      include: [
        {
          model: Meetup,
          as: 'subscribes',
          where: {
            date: {
              [Op.between]: [startOfDay(meetup.date), endOfDay(meetup.date)],
            },
          },
          through: { attributes: [] },
        },
      ],
    });

    if (user)
      return res.status(400).json({
        error: 'Você já tem um Meetup marcado para esse dia',
      });

    await meetup.addParticipants(req.userId);

    const receiver = await User.findByPk(req.userId);

    await Mail.sendMail({
      to: `${receiver.name} <${receiver.email}>`,
      subject: 'Inscrição Meetup',
      text: 'Sua inscrição foi realizada com sucesso!',
    });

    return res.json({ receiver, meetup });
  }
}

export default new SubscribeController();
