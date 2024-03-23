import { createSelection } from 'bun-promptx';
import { $ } from 'bun';
import chalk from 'chalk';
import { mappings } from './config';
const templateDir = `${import.meta.dir}/templates`;
const pwd = import.meta.env.PWD;
console.clear();

const options = (await Array.fromAsync($`ls -a ${templateDir}`.lines()))
 .filter(v => v)
 .map(v => {
  const item = mappings.find(temp => temp.ref == v);
  return {
   text: item?.name || v,
   description: item?.description || undefined,
  };
 });

const template = createSelection(options, { headerText: 'Select a template to scaffold', perPage: 5 });

if (template.error) {
 console.log('Provide a valid template!');
 process.exit(1);
}
const { text } = options[template.selectedIndex!];
const { ref } = mappings.find(temp => temp.name == text)!;
const name = prompt(`What is your project name? (default: ${ref.startsWith('.') ? ref : `${ref}-app`})`) || ref;

if (Number(await $`test -e ${pwd}/${name} && echo 1 || echo 0`.text())) {
 console.log('\nAlready exists!\n');
 process.exit();
}
await $`cp ${templateDir}/${ref} ./${name} -r`;
Number(await $`test -e ${templateDir}/${name}/package.json && echo 1 || echo 0`.text()) ? await $`sed -i 's/"name": .*/"name": "${name}"/' ./${name}/package.json'` : !Number(await $`test -e ${templateDir}/${template}/ && echo 1 || echo 0`.text()) ? null : (await confirm({ message: 'No package.json found. Create one?' })) && (await $`echo '{"name": "${name}"}' > package.json`.cwd(name));
console.log(`\n${chalk.green('Success!')} Created ${name} at ${pwd}/${name}\n\r`);
