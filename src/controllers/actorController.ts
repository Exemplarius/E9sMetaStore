import { Request, Response, NextFunction } from 'express';
import { getActors, getActorById, createActor, updateActor, deleteActor } from '@/db/queries/actor';
import { ApiError } from '@/middleware/errorHandler';
import { ActorFilters } from '@/types/actor';

// @desc    Get all actors
// @route   GET /api/actors
// @access  Public
export const getAllActors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Build filters from query params
    const filters: ActorFilters = {
      status: req.query.status as any,
      tag: req.query.tag as string,
      author: req.query.author as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };
    
    const { actors, total } = await getActors(filters);
    
    // Calculate pagination details
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    res.status(200).json({
      success: true,
      count: actors.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: actors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single actor
// @route   GET /api/actors/:id
// @access  Public
export const getOneActor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const actor = await getActorById(req.params.id);

    if (!actor) {
      return next(new ApiError('Actor not found', 404));
    }

    res.status(200).json({
      success: true,
      data: actor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new actor
// @route   POST /api/actors
// @access  Private
export const createNewActor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const actor = await createActor(req.body);

    res.status(201).json({
      success: true,
      data: actor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update actor
// @route   PUT /api/actors/:id
// @access  Private
export const updateOneActor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const actor = await updateActor(req.params.id, req.body);

    if (!actor) {
      return next(new ApiError('Actor not found', 404));
    }

    res.status(200).json({
      success: true,
      data: actor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete actor
// @route   DELETE /api/actors/:id
// @access  Private
export const deleteOneActor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await deleteActor(req.params.id);

    if (!deleted) {
      return next(new ApiError('Actor not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
}