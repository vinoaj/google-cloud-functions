/**
 * @fileoverview Google Cloud Function to relay Google Analytics Measurement 
 *  Protocol hits on behalf of the caller
 * @author vinoaj@vinoaj.com (Vinoaj Vijeyakumaar)
 */

 // Load packages
 const axios = require('axios');
 const queryString = require('query-string');

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
        data.dl = encodeURIComponent(mpParams.dl);
    }
    
    let payload = queryString.stringify(data);

    return new Promise((resolve, reject) => {
        axios
            .post(MP_ENDPOINT, payload)
            .then(response => {
                console.log("Request URL: ", response.request.url);
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Entry point for this Google Cloud Function
 * @param {object} req Request
 * @param {object} res Response
 */
exports.relayMPHit = function relayMPHit(req, res) {
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

    // Any outputs to console.log will be captured in Stackdriver
    console.log(mpParams);
    sendMeasurementProtocolHit(t, mpParams)
        .then((response) => {
            console.log(response);
            res.status(response.status).send();
        })
        .catch(error => {
            console.log(error);
            res.status(400).send(error);
        });
};
