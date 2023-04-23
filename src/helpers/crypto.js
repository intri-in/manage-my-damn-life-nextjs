import crypto from "crypto"

export function getRandomString(len)
{
  var hexLength = len/2
  var id = crypto.randomBytes(hexLength).toString('hex');
  return id
}