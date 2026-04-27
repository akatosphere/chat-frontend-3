export type {
	RequestUID,
	WSRequest,
	WSResponse,
	ChangeStatusReadResponse
} from './WS/types/wsTypes';

export { WS_ACTIONS } from './WS/types/wsTypes';

export {
	initWSHandlers,
	setWSCurrentUserId,
	setupSocket,
	disconnectWS,
	subscribeWS,
	sendWS,
	registerWSHandler
} from './WS/services/socketClient/socketClient';
