const io = require('socket.io-client')
const shell = require('shelljs')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const s3Client = new S3Client({ region: 'us-east-2' })


async function uploadBase64Screenshot(base64String, bucketName, fileName) {
  // Convert base64 string to a buffer
  const buffer = Buffer.from(base64String, 'base64')

  // Set up the parameters for the S3 upload
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentEncoding: 'base64',
    ContentType: 'image/png' // or the appropriate image mime type
  }

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams))
    console.log('Success', data)
  } catch (err) {
    console.error('Error', err)
  }
}

const PORT = process.env.PORT || 3000
const HOST = process.env.MYHOST || `http://localhost:${PORT}`

console.log(HOST)

const socket = io(HOST)

socket.on('connect', () => {
  console.log('ok')
})

socket.on('take-screenshot', () => {
  const fileName = `screenshot-${new Date().getTime()}.png`
  console.log(`... ${fileName}`)
  shell.exec(`screencapture -x ~/Desktop/${fileName}`, { silent: false }, async () => {
    console.log(`...done`)
    const screenshot = fs.readFileSync(`${process.env.HOME}/Desktop/${fileName}`, 'base64')
    console.log(`length=${screenshot.length} data=${screenshot.substring(0, 50)}`)
    await uploadBase64Screenshot(screenshot, 'polaris-adventures-development-share', 'screenshot.png')
    socket.emit('screenshot-taken')
  })
})
