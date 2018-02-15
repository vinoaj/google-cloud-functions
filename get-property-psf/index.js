/**
 * @fileoverview Google Cloud Function for looking at per square footage (PSF)
 *   pricing for a given condo / development and returning the lowest listed
 *   PSF on the first page
 * @author vinoaj@vinoaj.com (Vinoaj Vijeyakumaar)
 */

// Load packages
const axios = require('axios');
const cheerio = require('cheerio');

// Declare constants
const RE_PSF = /.*\$(.*)\ psf/;
const TARGET_CLASSNAME = 'attribute__3NZEO';
const URL_BASE = 'https://www.99.co/singapore/s/sale/condos-apartments/';

/**
 * Fetches the HTML content for a condo's sales listing page
 * @param {string} condoId Condo ID on 99.co
 * @returns {promise}
 */
function requestData(condoId) {
    return new Promise((resolve,reject) => {
        axios
            .get(URL_BASE + condoId)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Inspects the given HTML content for PSF values and returns the lowest
 * value found.
 * @param {string} htmlContent HTML that needs to be inspected
 * @returns {number}
 */
function getPsf(htmlContent) {
    // Use cheerio to use jQuery commands on the HTML content
    let $ = cheerio.load(htmlContent);
    let psfValues = [];

    $('.' + TARGET_CLASSNAME).each((i, elm) => {
        let elmContents = $(elm).text();
        let matches = elmContents.match(RE_PSF);
        if (matches !== null) {
            let psfValue = matches[1];
            psfValue = parseFloat(psfValue.replace(',', ''));
            psfValues.push(psfValue);
        }
    });

    let lowestPsf = Math.min(...psfValues);
    return lowestPsf;
}

/**
 * Entry point for this Google Cloud Function
 * @param {object} req Request
 * @param {object} res Response
 */
exports.lookupPsf = function lookupPsf(req, res) {
    // We expect the request to contain a JSON message with a key 'condoId'
    let condoId = req.body.condoId;

    requestData(condoId)
        .then((htmlContent) => {
            let psf = getPsf(htmlContent);
            let json = { 
                'psf': psf
            }
            res.status(200).send(json);
        })
        .catch(error => {
            // Any outputs to console.log will be captured in Stackdriver
            console.log(error);
            res.status(400).send(error);
        });
};


/**
 * This function is called for testing from the console.
 */
/*
requestData('8-mount-sophia').then((htmlContent) => {
    let psf = getPsf(htmlContent);
    let json = { 
        'psf': psf
    }
    console.log(json);    
})
.catch(error => {
    console.log(error);
    res.status(400).send(error);
});
*/