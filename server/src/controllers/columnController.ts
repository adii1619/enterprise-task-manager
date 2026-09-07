import { Request, Response } from 'express';
import { ColumnModel } from '../models/Column.js';

// Get all columns ordered by rank
export const getColumns = async (req: Request, res: Response) => {
  try {
    const columns = await ColumnModel.find().sort({ order: 1 });
    res.status(200).json(columns);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Create a new column
export const createColumn = async (req: Request, res: Response) => {
  try {
    const column = await ColumnModel.create(req.body);
    res.status(201).json(column);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Delete a column
export const deleteColumn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedColumn = await ColumnModel.findByIdAndDelete(id);

    if (!deletedColumn) {
      return res.status(404).json({ message: 'Column not found' });
    }

    res.status(200).json({ message: 'Column deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};