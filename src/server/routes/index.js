import express from 'express';

import MyController from '../controllers/myController';
import {validOccupation} from '../db/validation';

const router = express.Router(),
    myController = new MyController();

router.get('/greeting', myController.greet);
router.get('/users', myController.names);
router.get('/users/detail', myController.users);
router.get('/users/occupation', validOccupation, myController.findByOccupation);
router.get('/users/gender', myController.findByGender);
router.get('/users/oldest', myController.oldest);
router.get('/users/youngest', myController.youngest);
router.get('/users/average', myController.average);

export default router;