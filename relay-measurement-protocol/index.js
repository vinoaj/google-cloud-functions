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

function sendMeasurementProtocolHit(mpParams) {
    axios.post(MPENDPOINT, {
        v: MPVERSION,
        tid: mpParams.tid,
        cid: mpParams.cid,
        t: mpParams.t
    })
}

function receiveRequest(req, res) {
    try {
        let tid = req.tid
    } catch (e) {
        throw "No tid provided";
    }

    let cid = req.cid || 555;
    let t = req.t || TPAGEVIEW;
}
