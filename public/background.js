/** This is for the chrome extension version */
// eslint-disable-next-line no-unused-vars
/* eslint-disable no-undef */
/**
 * author: M2K Developments
 * github: https://github.com/m2kdevelopments
 */
chrome.action.onClicked.addListener((tab) => {
    console.log(tab);
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

