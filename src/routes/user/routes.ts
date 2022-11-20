import { express } from '@adarsh-mishra/node-utils/expressHelpers';

import { userHandlers } from '.';

const router = express.Router();

router.get('/user-details', userHandlers.getUserDetails);
router.get('/all-users', userHandlers.getAllUsers);
router.get('/my-details', userHandlers.getMyDetails);

export { router as userRouter };
