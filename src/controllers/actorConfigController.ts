import { Request, Response, NextFunction } from 'express';
import { getActorConfigs, getActorConfigById, createActorConfig, updateActorConfig, deleteActorConfig, getDefaultConfigForActor } from '@/db/queries/actor_config';
import { ApiError } from '@/middleware/errorHandler';
import { ActorConfigFilters } from '@/types/actor_config';

// @desc    Get all actor configs
// @route   GET /api/actor-configs
// @access  Public
export const getAllActorConfigs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Build filters from query params
    const filters: ActorConfigFilters = {
      actor_id: req.query.actor_id as string,
      is_default: req.query.is_default ? req.query.is_default === 'true' : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };
    
    const { configs, total } = await getActorConfigs(filters);
    
    // Calculate pagination details
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    res.status(200).json({
      success: true,
      count: configs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: configs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single actor config
// @route   GET /api/actor-configs/:id
// @access  Public
export const getOneActorConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await getActorConfigById(req.params.id);

    if (!config) {
      return next(new ApiError('Actor configuration not found', 404));
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new actor config
// @route   POST /api/actor-configs
// @access  Private
export const createNewActorConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await createActorConfig(req.body);

    res.status(201).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update actor config
// @route   PUT /api/actor-configs/:id
// @access  Private
export const updateOneActorConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await updateActorConfig(req.params.id, req.body);

    if (!config) {
      return next(new ApiError('Actor configuration not found', 404));
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete actor config
// @route   DELETE /api/actor-configs/:id
// @access  Private
export const deleteOneActorConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await deleteActorConfig(req.params.id);

    if (!deleted) {
      return next(new ApiError('Actor configuration not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get default config for an actor
// @route   GET /api/actor-configs/default/:actorId
// @access  Public
export const getDefaultConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await getDefaultConfigForActor(req.params.actorId);

    if (!config) {
      return next(new ApiError('No default configuration found for this actor', 404));
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};