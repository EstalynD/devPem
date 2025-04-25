'use strict'

const fs = require('fs')
const path = require('path')
const certPath = path.join(__dirname, './10472888281_Mnlmmn08.p12')
const dev_signature = fs.readFileSync(certPath)

const fetch = require('isomorphic-unfetch')
const SignedXml = require('xml-crypto').SignedXml
const KeyInfoProvider = require('./KeyInfoProvider')
const signValidation = require('./signValidation')

const pem = require('pem')
if (process.env.NODE_ENV !== 'production') pem.config({ pathOpenSSL: './bin/openssl' }) // en windows fallará



const UBL_EXTENSION_NAMESPACE = (
    'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2'
)

const XPATH_TO_SIGNATURE_CONTAINER = (
    '//*[local-name(.)="UBLExtensions" and ' +
    'namespace-uri(.)="' + UBL_EXTENSION_NAMESPACE + '"]' +
    '/*[local-name(.)="UBLExtension" and ' +
    'namespace-uri(.)="' + UBL_EXTENSION_NAMESPACE + '"][last()]' +
    '/*[local-name(.)="ExtensionContent" and ' +
    'namespace-uri(.)="' + UBL_EXTENSION_NAMESPACE + '"][last()]'
)




const xmlFileString = fs.readFileSync(path.join(__dirname, './xmlString.xml'), 'utf8')
console.log('xmlFileString', xmlFileString)

const signature = dev_signature
const pass = 'Mnlmmn08'

pem.readPkcs12(signature, { p12Password: pass }, (error, pem) => {
    if (error) {
        console.log('signature', signature)
        console.log('pass', pass)
        console.log('error', error)
        return reject({ ...error, message: 'error del certificado o la contraseña de este' })
    }

    let sig = new SignedXml()

    sig.addReference(
        '/*', // referencia al nodo a firmar (en este caso el nodo principal, se firma todo el documento)
        [
            'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
            'http://www.w3.org/2001/10/xml-exc-c14n#' // este transform hace <NodoVacio></NodoVacio>
        ],
        'http://www.w3.org/2000/09/xmldsig#sha1', // digestAlgorithm
        '',
        '',
        '',
        true // Deja vacio el atributo URI del nodo firmado
    )
    sig.signingKey = pem.key
    sig.keyInfoProvider = new KeyInfoProvider(pem.cert)
    sig.computeSignature(xmlFileString.replace(/\r/g, ''), {
        prefix: 'ds',
        attrs: { Id: 'APISUNAT' },
        location: { reference: XPATH_TO_SIGNATURE_CONTAINER, action: "append" }
    })

    let signedXmlString = sig.getSignedXml()

    // validar firma / buscar TRUE
    let isValid = signValidation(pem, signedXmlString, XPATH_TO_SIGNATURE_CONTAINER)
    if (isValid !== true) return reject(isValid)

    // devolver xml firmado
    resolve(signedXmlString)
})