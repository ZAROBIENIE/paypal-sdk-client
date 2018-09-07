import { Logger } from 'beaver-logger/src';
import { getStorage, noop, stringifyError, stringifyErrorMessage } from 'belter/src';
import { ZalgoPromise } from 'zalgo-promise/src';

import { URLS } from './config';
import { FPTI_KEY, FPTI_FEED, FPTI_DATA_SOURCE } from './constants';
import { getEnv, getClientID, getMerchantID } from './globals';

export var logger = Logger({
    url: URLS.LOGGER
});

var storage = getStorage({ name: 'paypal_payments_sdk' });

export function getSessionID() {
    return storage.getSessionID();
}

export function setupLogger() {
    logger.addPayloadBuilder(function () {
        return {
            referer: window.location.host,
            uid: getSessionID(),
            env: getEnv()
        };
    });

    logger.addTrackingBuilder(function () {
        var _ref;

        var sessionID = getSessionID();

        return _ref = {}, _ref[FPTI_KEY.FEED] = FPTI_FEED.PAYMENTS_SDK, _ref[FPTI_KEY.DATA_SOURCE] = FPTI_DATA_SOURCE.PAYMENTS_SDK, _ref[FPTI_KEY.CLIENT_ID] = getClientID(), _ref[FPTI_KEY.SELLER_ID] = getMerchantID(), _ref[FPTI_KEY.SESSION_UID] = sessionID, _ref[FPTI_KEY.REFERER] = window.location.host, _ref;
    });

    ZalgoPromise.onPossiblyUnhandledException(function (err) {
        var _logger$track;

        logger.track((_logger$track = {}, _logger$track[FPTI_KEY.ERROR_CODE] = 'checkoutjs_error', _logger$track[FPTI_KEY.ERROR_DESC] = stringifyErrorMessage(err), _logger$track));

        logger.error('unhandled_error', {
            stack: stringifyError(err),
            errtype: {}.toString.call(err)
        });

        // eslint-disable-next-line promise/no-promise-in-callback
        logger.flush()['catch'](noop);
    });
}