import { AES } from "crypto-js"
import CryptoJS from "crypto-js"
export default async function handler(req, res) {
    if (req.method === 'GET') {
        var string = "test"
        var encoded = AES.encrypt(string, process.env.AES_PASSWORD).toString()
        console.log("encoded",encoded)
        console.log("decoded", CryptoJS.AES.decrypt(encoded, process.env.AES_PASSWORD).toString(CryptoJS.enc.Utf8))

        res.status(200).json({ success: true, data: {string: req.query.string, encoded: encoded, decoded: "" } })

    }
}