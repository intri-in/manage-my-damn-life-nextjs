import {templates} from "models/templates";
import { getSequelizeObj } from "./db";

const template_Model = templates.initModel(getSequelizeObj())

export async function insertNewTemplatetoDB(name, data, type, userid)
{
    await template_Model.create({ name:name, data:data, type: type, userid:userid });
    return

}


export async function getTemplatesFromDB(userid){
    return await template_Model.findAll({
        where: {
            userid: userid.toString(),
        },
    })

}

export async function deleteTemplatefromDB(id, userid){
return await template_Model.destroy({
    where: {
      id: parseInt(id),
      userid:userid.toString()
    },
  });
}