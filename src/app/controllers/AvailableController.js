import { Op } from 'sequelize';
import { format } from 'date-fns';
import Meetup from '../models/Meetup';

class AvailableController {
  /**
   * lista todos os Meetups que ainda não passaram
   * caso tenha date: filtra os Meetups se não pega do dia atual
   * @param {*} req
   * @param {*} res
   */
  async index(req, res) {
    const { page = 1 } = req.query;

    const meetups = await Meetup.findAll({
      where: {
        date: { [Op.gte]: new Date() },
      },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    /**
     * formatando os dados
     */
    const meetupsFormat = meetups.map(
      ({ title, date, description, location }) => {
        return {
          title,
          location,
          description,
          date: format(date, 'dd/MM/yyyy'),
        };
      }
    );

    return res.json(meetupsFormat);
  }
}

export default new AvailableController();
