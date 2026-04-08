import {Router} from 'express';
import { createContactHandler, getAllContactsHandler, getContactByIdHandler, updateContactHandler, deleteContactHandler } from './contacts.controller.js';

const router = Router();

router.post('/', createContactHandler);
router.get('/', getAllContactsHandler);
router.get('/:id', getContactByIdHandler);
router.put('/:id', updateContactHandler);
router.delete('/:id', deleteContactHandler);

export default router;