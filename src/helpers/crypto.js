import crypto from "crypto"

export function getRandomString(len)
{
  var id = crypto.randomBytes(len).toString('hex');
  return id
}