import { select, input, confirm } from '@inquirer/prompts';
import { $ } from 'bun';
import chalk from 'chalk';
import { mappings } from './config';
const templateDir = `${import.meta.dir}/templates`;
const pwd = import.meta.env.PWD;
// Prompt the user to select a template to scaffold
const template = await select({
 message: `Select a template to scaffold:`,
 choices: (
  await Array.fromAsync($`ls -a ${templateDir}`.lines())
 ).map(v => {
  const item = mappings.find(temp => temp.ref == v);
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
if (Number(await $`test -e ${pwd}/${name} && echo 1 || echo 0`.text())) {
 console.log('\nAlready exists!\n');
 process.exit();
}
await $`cp ${templateDir}/${template} ./${name} -r`;

Number(await $`test -e ${templateDir}/${template}/package.json && echo 1 || echo 0`.text()) ? await $`sed -i 's/"name": .*/"name": "${name}"/' ./${name}/package.json'` : !Number(await $`test -e ${templateDir}/${template}/ && echo 1 || echo 0`.text()) ? null : (await confirm({ message: 'No package.json found. Create one?' })) && (await $`echo '{"name": "${name}"}' > package.json`.cwd(name));
console.log(`\n${chalk.green('Success!')} Created ${name} at ${pwd}/${name}\n\r`);
