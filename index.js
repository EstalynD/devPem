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




const xml = `
<?xml version="1.0" encoding="utf-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
    <ext:UBLExtensions>
        <ext:UBLExtension>
            <ext:ExtensionContent></ext:ExtensionContent>
        </ext:UBLExtension>
    </ext:UBLExtensions>
    <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
    <cbc:CustomizationID>2.0</cbc:CustomizationID>
    <cbc:ID>B001-00000350</cbc:ID>
    <cbc:IssueDate>2025-04-25</cbc:IssueDate>
    <cbc:IssueTime>16:53:01</cbc:IssueTime>
    <cbc:InvoiceTypeCode listID="0101">03</cbc:InvoiceTypeCode>
    <cbc:Note languageLocaleID="1000">DOSCIENTOS SETENTA Y TRES CON 76/100 SOLES</cbc:Note>
    <cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode>
    <cac:Signature>
        <cbc:ID>APISUNAT</cbc:ID>
        <cac:SignatoryParty>
            <cac:PartyIdentification>
                <cbc:ID>20000000000</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>NOMBRE LEGAL DE LA EMPRESA SAC</cbc:Name>
            </cac:PartyName>
        </cac:SignatoryParty>
        <cac:DigitalSignatureAttachment>
            <cac:ExternalReference>
                <cbc:URI>https://apisunat.com/</cbc:URI>
            </cac:ExternalReference>
        </cac:DigitalSignatureAttachment>
    </cac:Signature>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="6">20000000000</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>EMPRESA DE PRUEBAS</cbc:Name>
            </cac:PartyName>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>NOMBRE LEGAL DE LA EMPRESA SAC</cbc:RegistrationName>
                <cac:RegistrationAddress>
                    <cbc:AddressTypeCode>0000</cbc:AddressTypeCode>
                    <cac:AddressLine>
                        <cbc:Line>Dirección fiscal de la empresa - Distrito - Provincia</cbc:Line>
                    </cac:AddressLine>
                </cac:RegistrationAddress>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="1">00000000</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>---</cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingCustomerParty>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="PEN">41.76</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="PEN">232</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="PEN">41.76</cbc:TaxAmount>
            <cac:TaxCategory>
                <cac:TaxScheme>
                    <cbc:ID>1000</cbc:ID>
                    <cbc:Name>IGV</cbc:Name>
                    <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="PEN">232</cbc:LineExtensionAmount>
        <cbc:TaxInclusiveAmount currencyID="PEN">273.76</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="PEN">273.76</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    <cac:InvoiceLine>
        <cbc:ID>1</cbc:ID>
        <cbc:InvoicedQuantity unitCode="ZZ">1</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="PEN">232</cbc:LineExtensionAmount>
        <cac:PricingReference>
            <cac:AlternativeConditionPrice>
                <cbc:PriceAmount currencyID="PEN">273.76</cbc:PriceAmount>
                <cbc:PriceTypeCode>01</cbc:PriceTypeCode>
            </cac:AlternativeConditionPrice>
        </cac:PricingReference>
        <cac:TaxTotal>
            <cbc:TaxAmount currencyID="PEN">41.76</cbc:TaxAmount>
            <cac:TaxSubtotal>
                <cbc:TaxableAmount currencyID="PEN">232</cbc:TaxableAmount>
                <cbc:TaxAmount currencyID="PEN">41.76</cbc:TaxAmount>
                <cac:TaxCategory>
                    <cbc:Percent>18</cbc:Percent>
                    <cbc:TaxExemptionReasonCode>10</cbc:TaxExemptionReasonCode>
                    <cac:TaxScheme>
                        <cbc:ID>1000</cbc:ID>
                        <cbc:Name>IGV</cbc:Name>
                        <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
                    </cac:TaxScheme>
                </cac:TaxCategory>
            </cac:TaxSubtotal>
        </cac:TaxTotal>
        <cac:Item>
            <cbc:Description>awawd</cbc:Description>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="PEN">232</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
</Invoice>
`

const xmlFileString = xml
// console.log('xmlFileString', xmlFileString)

const signature = dev_signature
const pass = 'Mnlmmn08'

pem.readPkcs12(signature, { p12Password: pass }, (error, pem) => {
    if (error) {
        console.log('signature', signature)
        console.log('pass', pass)
        console.log('error', error)
        return console.log('reject', { ...error, message: 'error del certificado o la contraseña de este' })
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
    if (isValid !== true) return console.log('reject', isValid)

    // devolver xml firmado
    console.log('resolve', signedXmlString)
})