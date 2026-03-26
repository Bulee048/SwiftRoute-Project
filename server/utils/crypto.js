import crypto from 'crypto'

export function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export function randomTokenHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

