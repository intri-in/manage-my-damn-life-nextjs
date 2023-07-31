import { middleWareForAuthorisation } from "@/helpers/api/user";

export default async function checkLoginHandler(req, res) {
    if (req.method === 'GET') {
        if(await middleWareForAuthorisation(req, res))
        {
            res.status(200).json({ success: true, data: { message: 'LOGIN_OK'} })

        }else{
            res.status(401).json({ success: false, data: { message: 'PLEASE_LOGIN'} })

        }

    }
}