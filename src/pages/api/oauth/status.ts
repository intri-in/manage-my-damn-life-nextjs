export default async function handler(req, res) {
    if (req.method !== 'GET') {        
        return res.status(403).json({ success: 'false' ,data: {message: 'INVALID_METHOD'}})
    }   
    let nextAuthStatus = false 
    if(process.env.USE_NEXT_AUTH=="true"){
        nextAuthStatus = true
    }
    // console.log("process.env nextAuthStatus", process.env.USE_NEXT_AUTH, nextAuthStatus)
    return res.status(200).json({ success: true ,data: {message: nextAuthStatus}})
}