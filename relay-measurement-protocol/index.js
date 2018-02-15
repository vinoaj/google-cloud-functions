/**
 * @fileoverview Google Cloud Function to relay Google Analytics Measurement 
 *  Protocol hits on behalf of the caller
 * @author vinoaj@vinoaj.com (Vinoaj Vijeyakumaar)
 */

 // Load packages
 const axios = require('axios');
 const queryString = require('query-string');
 const { URL } = require('url');

// Constants
const MP_ENDPOINT = 'https://www.google-analytics.com/collect';
const MP_VERSION = 1;
const HIT_DS = 'gcf'; // Google Cloud Function
const HIT_TYPE_PAGEVIEW = 'pageview';
const HIT_TYPE_EVENT = 'event';
const ALLOW_ORIGIN = 'https://vinoaj.github.io';

/**
 * Posts a Measurement Protocol hit to GA's collection servers
 * @param {string} type Hit type
 * @param {object} mpParams Hit parameter values
 * @returns {promise}
 */
function sendMeasurementProtocolHit(type, mpParams) {
    data = {
        v: MP_VERSION,
        ds: HIT_DS,
        cid: mpParams.cid,
        tid: mpParams.tid,
        t: mpParams.t
    };

    if (type == HIT_TYPE_PAGEVIEW) {
        if (mpParams.dl) {
            let url = new URL(mpParams.dl);
            data.dh = encodeURIComponent(url.host);
            data.dp = encodeURIComponent(url.pathname);
        } else {
            data.dh = mpParams.dh || 'http://xyz.com/';
            data.dp = mpParams.dp || '/please_provide_mp_dp';
        }
    }
    
    let payload = queryString.stringify(data);

    return new Promise((resolve, reject) => {
        axios
            .post(MP_ENDPOINT, payload)
            .then(response => {
                // console.log("Request URL: ", response.request.url);
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
    // Handle preflight CORS checks
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Origin', ALLOW_ORIGIN)
           .set('Access-Control-Allow-Methods', 'GET, POST')
           .status(200);
           return;
    }

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
    mpParams.uip = req.ip;

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
