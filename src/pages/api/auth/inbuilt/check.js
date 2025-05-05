import { middleWareForAuthorisation } from "@/helpers/api/user";

export default async function checkLoginHandler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req, res))
        {
            return res.status(200).json({ success: true, data: { message: 'LOGIN_OK'} })

        }else{
            return res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }

    }
    return res.status(403).json({ success: 'false' ,data: {message: "INVALID_METHOD." }})

}