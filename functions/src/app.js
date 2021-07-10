import express from 'express'
import { inboundParser, storeAttachment } from '@feryardiant/sendgrid-inbound-parser'

/**
 * @param {import('firebase-functions').logger} logger
 * @returns {express.ErrorRequestHandler}
 */
export function useLogger (logger) {
  return (err, _, res, __) => {
    logger.error(err)

    res.status(500)
    res.send('Internal server Error')
  }
}

/**
 * @param {import('firebase-admin').app.App} admin
 * @param {import('firebase-functions').logger} logger
 * @returns {express.Application}
 */
export function requestHandler (admin, logger) {
  const app = express()
  const db = admin.firestore()
  const bucket = admin.storage().bucket()

  app.use(useLogger(logger))

  app.get('/mail', (req, res) => {
    console.log(req.path)
    res.status(200).send('OK')
  })

  app.get('/inbound', inboundParser(), inboundHandler(db, bucket, logger))

  app.all('*', (req, res) => {
    console.log(req)
    return res.status(404).send('Not Found')
  })

  return app
}

/**
 * @param {import('firebase-admin').firestore.Firestore} db
 * @param {import('@google-cloud/storage').Bucket} bucket
 * @param {import('firebase-functions').logger} logger
 * @returns {express.RequestHandler<import('.').IncomingMailRequest>}
 */
const inboundHandler = (db, bucket, logger) => async (req, res) => {
  const messageCollection = db.collection('messages')
  const attachmentCollection = db.collection('attachments')

  try {
    const { messageId, attachments, ...envelope } = req.envelope

    await Promise.all(attachments.map(async (attachment) => {
      if (attachment.contentDisposition === 'inline') return

      attachment.uploadedFile = await storeAttachment(attachment, bucket)
    }))

    await db.runTransaction(async (trans) => {
      const messageRef = messageCollection.doc(messageId)
      trans.set(messageRef, envelope)

      for (const { uploadedFile, ...attachment } of attachments) {
        if (attachment.contentDisposition === 'inline') continue

        const attachmentRef = attachmentCollection.doc(attachment.checksum)

        trans.set(attachmentRef, {
          ...attachment,
          publicUrl: uploadedFile.publicUrl()
        })
      }
    })

    logger.info('message recieved', { messageId, envelope })

    res.sendStatus(200)
  } catch (err) {
    logger.error(err)

    res.sendStatus(500)
  }
}
