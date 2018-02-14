/**
 * @fileoverview Google Cloud Function to relay Google Analytics Measurement 
 *  Protocol hits on behalf of the caller
 * @author vinoaj@vinoaj.com (Vinoaj Vijeyakumaar)
 */

 // Load packages
const axios = require('axios');

// Constants
const MPENDPOINT = 'https://www.google-analytics.com/collect';
const MPVERSION = 1;
const TPAGEVIEW = 'pageview';
const TEVENT = 'event';

function sendMeasurementProtocolHit(type, mpParams) {
    data = {
        v: MPVERSION,
        tid: mpParams.tid,
        cid: mpParams.cid,
        t: mpParams.t
    };

    if (type == TPAGEVIEW) {
        data.dl = mpParams.dl;
    }
    
    axios.post(MPENDPOINT, data);
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
    let t = mpParams.t || TPAGEVIEW;

    mpParams.cid = cid;
    mpParams.t = t;

    sendMeasurementProtocolHit(mpParams);
};
