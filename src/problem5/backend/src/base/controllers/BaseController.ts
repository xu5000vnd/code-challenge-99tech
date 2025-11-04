import { Request, Response } from 'express';
import { IBaseService } from '../services/IBaseService';

export abstract class BaseController<T, CreateDTO, UpdateDTO> {
  constructor(protected service: IBaseService<T, CreateDTO, UpdateDTO>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      console.error('Error creating resource:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(400).json({ error: message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.service.findById(id);

      if (!data) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      res.json(data);
    } catch (error) {
      console.error('Error finding resource:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { data, total } = await this.service.findAll(req.query);
      res.json({ data, total });
    } catch (error) {
      console.error('Error finding resources:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.service.update(id, req.body);

      if (!data) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      res.json(data);
    } catch (error) {
      console.error('Error updating resource:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(400).json({ error: message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.service.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
