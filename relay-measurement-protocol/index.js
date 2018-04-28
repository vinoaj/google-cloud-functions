/**
 * @fileoverview Google Cloud Function to relay Google Analytics Measurement 
 *  Protocol hits on behalf of the caller
 * @author vinoaj@vinoaj.com (Vinoaj Vijeyakumaar)
 */

// Load packages
const axios = require('axios');
const queryString = require('query-string');
const {
    URL
} = require('url');

// Constants
const MP_ENDPOINT = 'https://www.google-analytics.com/collect';
const MP_VERSION = 1;
const HIT_DS = 'gcf'; // Google Cloud Function
const HIT_TYPE_PAGEVIEW = 'pageview';
const HIT_TYPE_EVENT = 'event';

// Modify these constants for your needs
// Allowed origins for CORS
const ALLOW_ORIGINS = ['https://vinoaj.github.io', 'https://vinoaj.com'];

// Default hostname for MP hits
const MP_DEFAULT_DH = 'https://vinoaj.com';

// Default path for MP pageview hits
const MP_DEFAULT_DP = '/GTM_not_fired';

// CORS Express middleware to enable CORS Requests.
// CORS handling is required if this function is called from a web application
//   via a XmlHttpRequest
const corsOptions = {
    origin: ALLOW_ORIGINS,
    methods: 'POST',
    preflightContinue: true
};
const cors = require('cors')(corsOptions);


/**
 * Handles the POST request
 * @param {object} req Request
 * @param {object} res Response
 */
function processRelay(req, res) {
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

    // Any outputs to console.log will be captured in Stackdriver Logging
    console.log(mpParams);

    sendMeasurementProtocolHit(t, mpParams)
        .then((response) => {
            console.log("MP server response: ", response);
            res.status(response.status).send();
        })
        .catch(error => {
            console.log(error);
            res.status(400).send(error);
        });
}

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
        t: mpParams.t,
        uip: mpParams.uip
    };

    if (type == HIT_TYPE_PAGEVIEW) {
        if (mpParams.dl) {
            // Break dl into dh & dp as dl doesn't work consistently in testing
            //   of MP hits.
            // TODO: error handling
            let url = new URL(mpParams.dl);
            data.dh = encodeURIComponent(url.host);
            data.dp = encodeURIComponent(url.pathname);
        } else {
            data.dh = mpParams.dh || MP_DEFAULT_DH;
            data.dp = mpParams.dp || MP_DEFAULT_DP;
        }
    }

    let payload = queryString.stringify(data);

    return new Promise((resolve, reject) => {
        axios
            .post(MP_ENDPOINT, payload)
            .then(response => {
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
    // Forbid PUT requests
    if (req.method === 'PUT') {
        return res.status(403).send('Forbidden!');
    }

    cors(req, res, () => {
        processRelay(req, res);
    });
};