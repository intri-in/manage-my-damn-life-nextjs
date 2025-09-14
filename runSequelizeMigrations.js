const {exec} = require('child_process');
import { shouldLogforAPI } from '@/helpers/logs';
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
    const dialect = process.env.DB_DIALECT ?? "mysql"
    let command_Others = `npx sequelize-cli db:migrate --env=local --url '${dialect}://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}'`
    const command = (dialect=="sqlite") ? "NODE_ENV=sqlite npm exec sequelize-cli db:migrate --env=sqlite":command_Others
    // console.log(process.cwd())
    if(shouldLogforAPI()) console.log("full Command ->", command)
    //temp
    // command="ls -l"
    const node_path= process.cwd()+"/node_modules"
    const env_variable = (dialect=="sqlite") ? {...process.env, NODE_PATH:node_path} : process.env
    const migrate = exec(command,
      {env: env_variable},
      err => (err ? reject(err): resolve(true))
    );
  
    // Forward stdout+stderr to this process
    migrate.stdout.pipe(process.stdout);
    migrate.stderr.pipe(process.stderr);
  });
}

export default runManualMigrations