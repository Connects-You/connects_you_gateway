import { express } from '@adarsh-mishra/node-utils/expressHelpers';

import { roomHandlers } from '.';

const router = express.Router();

router.get('/all-rooms', roomHandlers.getUserRooms);

export { router as roomRouter };
