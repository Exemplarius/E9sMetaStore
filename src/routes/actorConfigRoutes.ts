import express from 'express';
import {
  getAllActorConfigs,
  getOneActorConfig,
  createNewActorConfig,
  updateOneActorConfig,
  deleteOneActorConfig,
  getDefaultConfig
} from '@/controllers/actorConfigController';

const router = express.Router();

// Special route for getting default config
router.get('/default/:actorId', getDefaultConfig);

// Standard CRUD routes
router.route('/')
  .get(getAllActorConfigs)
  .post(createNewActorConfig);

router.route('/:id')
  .get(getOneActorConfig)
  .put(updateOneActorConfig)
  .delete(deleteOneActorConfig);

export default router;