'use strict'

const select = require('xml-crypto').xpath
const dom = require('xmldom').DOMParser
const KeyInfoProvider = require('./KeyInfoProvider')
const SignedXml = require('xml-crypto').SignedXml


module.exports = (pem, signedXmlString, XPATH_TO_SIGNATURE_CONTAINER) => {

    let doc = new dom().parseFromString(signedXmlString)
    let signature = select(doc, `${XPATH_TO_SIGNATURE_CONTAINER}/*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']`)[0]

    let sig = new SignedXml()
    sig.keyInfoProvider = new KeyInfoProvider(pem.cert)
    sig.loadSignature(signature)

    let res = sig.checkSignature(signedXmlString)

    if (!res) return sig.validationErrors

    return res
}