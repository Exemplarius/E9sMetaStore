import express from 'express';
import {
  getAllActors,
  getOneActor,
  createNewActor,
  updateOneActor,
  deleteOneActor
} from '@/controllers/actorController';

const router = express.Router();

router.route('/')
  .get(getAllActors)
  .post(createNewActor);

router.route('/:id')
  .get(getOneActor)
  .put(updateOneActor)
  .delete(deleteOneActor);

export default router;