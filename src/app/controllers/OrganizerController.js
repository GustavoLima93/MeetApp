import Meetup from '../models/Meetup';

class OrganizeController {
  async index(req, res) {
    const meetUps = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
    });
    return res.json(meetUps);
  }
}

export default new OrganizeController();
