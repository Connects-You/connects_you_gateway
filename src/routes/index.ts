import { express } from '@adarsh-mishra/node-utils/expressHelpers';

import { authRouter } from './auth/routes';
import { userRouter } from './user/routes';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);

export { router };
