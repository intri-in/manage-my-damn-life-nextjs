Fixed OAuth problem (#162)
 - It stemmed from "raw" option being true in the Sequelize object.
 - New migrations added to make MMDL work with the latest version (v4) of NextAuth
 - Small bug fixes