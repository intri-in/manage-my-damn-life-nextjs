import { getRegistrationStatus, userRegistrationAllowed } from '@/helpers/api/settings';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        const response = await userRegistrationAllowed()
        res.status(200).json({ success: true ,data: {message: response}})

    }else
    {
        res.status(422).json({ success: false ,data: {message: "INVALID_METHOD"}})

    }
}

