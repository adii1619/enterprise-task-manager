import { Request, Response } from 'express';
import { ColumnModel } from '../models/Column.js';

// Get all columns ordered by rank
export const getColumns = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const columns = await ColumnModel.find({ userId: req.user._id }).sort({ order: 1 });
    res.status(200).json(columns);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Create a new column
export const createColumn = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { title, order, boardId } = req.body;
    const column = await ColumnModel.create({
      userId: req.user._id,
      title,
      order,
      boardId,
    });
    res.status(201).json(column);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Update a column title
export const updateColumn = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { title } = req.body;
    const updatedColumn = await ColumnModel.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title },
      { new: true, runValidators: true }
    );

    if (!updatedColumn) {
      return res.status(404).json({ message: 'Column not found' });
    }

    res.status(200).json(updatedColumn);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Delete a column
export const deleteColumn = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const deletedColumn = await ColumnModel.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deletedColumn) {
      return res.status(404).json({ message: 'Column not found' });
    }

    res.status(200).json({ message: 'Column deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};