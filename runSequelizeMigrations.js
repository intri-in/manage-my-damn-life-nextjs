const {exec} = require('child_process');
import { readdir } from 'fs/promises'


// npx sequelize-cli db:migrate --url 'mysql://root:password@mysql_host.com/database_name'
 async function runManualMigrations() {

  // const getDirectories = async source =>
  //   (await readdir(source, { withFileTypes: true }))
  //     .filter(dirent => dirent.isDirectory())
  //     .map(dirent => dirent.name)
  //     console.log(await getDirectories('/app/'))

  //   console.log(await getDirectories('/app/.next/'))
  //   console.log(await getDirectories('/'))


  return new Promise((resolve, reject) => {
    const migrate = exec(
      "npx sequelize-cli db:migrate --env=local --url 'mysql://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+"/"+process.env.DB_NAME+"'",
      {env: process.env},
      err => (err ? reject(err): resolve(true))
    );
  
    // Forward stdout+stderr to this process
    migrate.stdout.pipe(process.stdout);
    migrate.stderr.pipe(process.stderr);
  });
}

export default runManualMigrations