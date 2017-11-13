/**
 * @fileoverview Google Cloud Function for looking at per square footage
 *   pricing for a given condo / development and returning the lowest listed
 *   psf on the first page
 * @author vinoaj@vinoaj.com (Vinoaj Vijeyakumaar)
 */

// Load packages
const axios = require('axios');
const cheerio = require('cheerio');

const RE_PSF = /.*\$(.*)\ psf/;
const URL = 'https://www.99.co/singapore/s/sale/condos-apartments/'
//bliss-ville';


/**
 * 
 */
function main() {
    return new Promise((resolve,reject) => {
        axios
            .get(url)
            .then(response => {
                //console.log('respose: ', response);
                let psf = getPsf(response.data);
                console.log(psf);
                resolve({ 'psf': psf });
            })
            .catch(error => {
                console.log(error);
                reject(error);
            });
    });
}

function getPsf(htmlContent) {
    let $ = cheerio.load(htmlContent);
    let psfValues = [];

    $('.attribute__3NZEO').each((i, elm) => {
        let elmContents = $(elm).text();
        
        let matches = elmContents.match(RE_PSF);
        if (matches !== null) {
            let psfValue = matches[1];
            psfValue = parseFloat(psfValue.replace(',', ''));
            psfValues.push(psfValue);
        }
    });

    return Math.min(...psfValues);
}


exports.lookupPsf = function lookupPsf(req, res) {
    main().then((psf) => {
        res.status(200).send(psf);
    });
};


/**
 * This function is called for testing from the console.
 */
/*
main().then((val) => {
    console.log('end: ', val);
});
*/