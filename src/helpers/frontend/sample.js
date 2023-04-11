import { getUserDB } from './db';

export async function populateSampleDataIntoDB()
{
    var db = getUserDB()
//user: '++id, username, userhash, ssid, email, mobile'
var username='abc'
var userhash='ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
var ssid = 'aa11de94da6f7b7034053c662d5ec08703b830d63638c1b21177589bf74911b96bb7b79f186008e5d2d72b195888ece8109a2fdc3ea53d0bc4224acc532e68e3'
    var id = await db.user.add({
        username,userhash,ssid,
     });

}