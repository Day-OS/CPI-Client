export let adblocker: any;
export let cross_fetch: any;

try {
    adblocker = require('@cliqz/adblocker-electron');

    cross_fetch = require('cross-fetch').fetch;
} catch (err) {
    adblocker = null;
    cross_fetch = null;
}