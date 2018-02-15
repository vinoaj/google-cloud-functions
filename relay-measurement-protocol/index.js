/**
 * @fileoverview Google Cloud Function to relay Google Analytics Measurement 
 *  Protocol hits on behalf of the caller
 * @author vinoaj@vinoaj.com (Vinoaj Vijeyakumaar)
 */

 // Load packages
 const axios = require('axios');

// Constants
const MP_ENDPOINT = 'https://www.google-analytics.com/collect';
const MP_VERSION = 1;
const HIT_TYPE_PAGEVIEW = 'pageview';
const HIT_TYPE_EVENT = 'event';

/**
 * Posts a Measurement Protocol hit to GA's collection servers
 * @param {string} type Hit type
 * @param {object} mpParams Hit parameter values
 * @returns {promise}
 */
function sendMeasurementProtocolHit(type, mpParams) {
    data = {
        v: MP_VERSION,
        cid: mpParams.cid,
        tid: mpParams.tid,
        t: mpParams.t
    };

    if (type == HIT_TYPE_PAGEVIEW) {
        data.dl = mpParams.dl;
    }
    
    axios
        .post(MP_ENDPOINT, data)
        .then(response => {
            resolve(response.status);
        })
        .catch(error => {
            reject(error);
        });
}

/**
 * Entry point for this Google Cloud Function
 * @param {object} req Request
 * @param {object} res Response
 */
exports.relayRequest = function relayRequest(req, res) {
    let mpParams = req.body;
    
    try {
        let tid = mpParams.tid
    } catch (e) {
        throw "No tid provided";
    }

    let cid = mpParams.cid || 555;
    let t = mpParams.t || HIT_TYPE_PAGEVIEW;

    mpParams.cid = cid;
    mpParams.t = t;

    console.log(mpParams);
    sendMeasurementProtocolHit(t, mpParams);
    res.status(200).send()
};
