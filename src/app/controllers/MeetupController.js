import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';

import File from '../models/File';
import Meetup from '../models/Meetup';

class MeetUp {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .required()
        .min(6),
      description: Yup.string()
        .required()
        .min(6)
        .max(150),
      location: Yup.string()
        .required()
        .min(6)
        .max(50),
      date: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validations  fails' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File not found' });
    }

    const { title, description, location, date } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res.status(401).json({ error: 'Date has passed' });
    }
    const { originalname: name, filename: path } = req.file;
    const { id } = await File.create({
      name,
      path,
    });

    const meetUp = await Meetup.create({
      file_id: id,
      user_id: req.userId,
      title,
      description,
      location,
      date,
    });

    return res.json(meetUp);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().min(6),
      description: Yup.string()
        .min(6)
        .max(150),
      location: Yup.string()
        .min(6)
        .max(50),
      date: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validations  fails' });
    }

    const meetUp = await Meetup.findByPk(req.params.id);

    if (meetUp.user_id !== req.userId) {
      return res.status(401).json({ error: "don't have permission" });
    }

    /** Verifica se tem file para fazer o update */

    let fileId;
    let oldFileId;

    if (req.file) {
      const { originalname: name, filename: path } = req.file;
      const { id } = await File.create({
        name,
        path,
      });

      fileId = id;
      oldFileId = meetUp.file_id;
    }

    /** Pega os dados do Body */

    const { title, description, location, date } = req.body;

    /** se tiver date no body , verifica se e maior que a data atual */

    if (date) {
      if (isBefore(parseISO(date), new Date())) {
        return res.status(401).json({ error: 'Date has passed' });
      }
    }

    const { id } = await meetUp.update({
      file_id: fileId,
      user_id: req.userId,
      title,
      description,
      location,
      date,
    });

    if (oldFileId) {
      const oldFile = await File.findByPk(oldFileId);
      await oldFile.destroy();
    }

    return res.json({ id });
  }

  async delete(req, res) {
    const meetUp = await Meetup.findByPk(req.params.id);

    if (meetUp.user_id !== req.userId) {
      return res.status(401).json({ error: "don't have permission" });
    }

    if (isBefore(parseISO(meetUp.date), new Date())) {
      return res.status(401).json({ error: 'Date has passed' });
    }

    const { file_id } = meetUp;
    const file = await File.findByPk(file_id);

    meetUp.destroy();
    file.destroy();

    return res.json();
  }
}

export default new MeetUp();
