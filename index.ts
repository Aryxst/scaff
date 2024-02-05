import { select, input, confirm } from '@inquirer/prompts';
import { $ } from 'bun';
import chalk from 'chalk';
import config from './config';

const templateDir = `${import.meta.dir}/templates`;
// Prompt the user to select a template to scaffold
const template = await select({
 message: `Select a template to scaffold:`,
 choices: (
  await Array.fromAsync($`ls -a ${templateDir}`.lines())
 ).map(v => {
  const item = config.find(temp => temp.ref == v);
  return {
   name: item?.name || v,
   // The actual template name in fs
   value: v,
   description: item?.description || undefined,
  };
 }),
});
// Prompt the user to provide a name for the project
const name = await input({
 message: `What is your project name?`,
 default: template.startsWith('.') ? template : `${template}-app`,
});
if (Number(await $`test -e ${import.meta.env.PWD}/${name} && echo 1 || echo 0`.text())) {
 console.log('\nAlready exists!\n');
 process.exit();
}
await $`cp ${templateDir}/${template} ./${name} -r`;
// Check if the package already exists
Number(await $`test -e ${templateDir}/${template}/package.json && echo 1 || echo 0`.text())
 ? // If the package exists, use sed to replace the "name" field in package.json
   await $`sed -i 's/"name": .*/"name": "${name}"/' ./${name}/package.json'`
 : // If the package doesn't exist, ask the user if they want to create a new package.json
   (await confirm({ message: 'No package.json found. Create one?' })) &&
   // If the user confirms, create a new package.json with the specified "name"
   (await $`echo '{"name": "${name}"}' > package.json`.cwd(name));

console.log(`\n${chalk.green('Success!')} Created ${name} at ${import.meta.env.PWD}/${name}\n\r`);
