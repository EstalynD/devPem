'use strict'

const forge = require('node-forge')
const pki = forge.pki


const getSubjectName = certObj => {

    let subjectFields, fields = ['CN', 'OU', 'O', 'L', 'ST', 'C']

    if (certObj.subject) {
        subjectFields = fields.reduce((subjects, fieldName) => {
            let certAttr = certObj.subject.getField(fieldName)

            if (certAttr) {
                subjects.push(fieldName + '=' + certAttr.value)
            }

            return subjects
        }, [])
    }

    return Array.isArray(subjectFields) ? subjectFields.join(',') : ''
}


function KeyInfoProvider(certificatePEM) {

    let certificatePEMValue = certificatePEM

    // Esto asegura de que siempre se devuelva una instancia
    // asi se aya llamado a la funcion sin `new`
    if (!this instanceof KeyInfoProvider) {
        return new KeyInfoProvider()
    }

    if (Buffer.isBuffer(certificatePEMValue)) {
        certificatePEMValue = certificatePEMValue.toString('ascii')
    }

    if (certificatePEMValue == null || typeof certificatePEMValue !== 'string') {
        throw new Error('certificatePEM must be a valid certificate in PEM format')
    }

    this._certificatePEM = certificatePEMValue

    this.getKeyInfo = (key, prefix) => {

        let keyInfoXml,
            certObj,
            certBodyInB64,
            prefixValue

        prefixValue = prefix || ''
        prefixValue = prefixValue ? prefixValue + ':' : prefixValue

        certBodyInB64 = forge.util.encode64(forge.pem.decode(this._certificatePEM)[0].body)
        certObj = pki.certificateFromPem(this._certificatePEM)

        keyInfoXml = '<' + prefixValue + 'X509Data>'

        keyInfoXml += '<' + prefixValue + 'X509SubjectName>'
        keyInfoXml += getSubjectName(certObj)
        keyInfoXml += '</' + prefixValue + 'X509SubjectName>'

        keyInfoXml += '<' + prefixValue + 'X509Certificate>'
        keyInfoXml += certBodyInB64
        keyInfoXml += '</' + prefixValue + 'X509Certificate>'

        keyInfoXml += '</' + prefixValue + 'X509Data>'

        return keyInfoXml
    }

    this.getKey = () => this._certificatePEM
}


module.exports = KeyInfoProvider