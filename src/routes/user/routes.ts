import { express } from '@adarsh-mishra/node-utils/expressHelpers';

import { userHandlers } from '.';

const router = express.Router();

router.get('/get-user-details', userHandlers.getUserDetails);
router.get('/get-all-users', userHandlers.getAllUsers);

export { router as userRouter };
