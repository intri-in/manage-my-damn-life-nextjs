import { getRegistrationStatus, userRegistrationAllowed } from '@/helpers/api/settings';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        try{

            const response = await userRegistrationAllowed()
            return res.status(200).json({ success: true ,data: {message: response}})
        }catch(e){
            return res.status(500).json({ success: false ,data: {message: false}})
        }

    }else
    {
        return res.status(422).json({ success: false ,data: {message: "INVALID_METHOD"}})

    }
}

