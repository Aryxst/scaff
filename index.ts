import { createSelection } from 'bun-promptx';
import { $ } from 'bun';
import { mappings } from './config';
const templateDir = `${import.meta.dir}/templates`;

const pwd = import.meta.env.PWD;
const refs = mappings.map(temp => temp['ref']);
const names = mappings.map(temp => temp['name']);

console.clear();

const options = (await Array.fromAsync($`ls -a ${templateDir}`.lines()))
 .filter(v => v)
 .map(v => {
  const item = mappings.find(temp => temp.ref == v);
  return {
   text: item?.name || v,
   description: item?.description || undefined,
  };
 })
 .filter(v => refs.includes(v.text) || names.includes(v.text))
 .filter(v => v.text);
const template = createSelection(options, { headerText: 'Select a template to scaffold', perPage: 5 });

if (template.error) {
 console.log('Provide a valid template!');
 process.exit(1);
}

const { text } = options[template.selectedIndex!];
const temp = mappings.find(item => item.name === text) || mappings.find(item => item.ref === text);
const ref = temp ? temp.ref : undefined;

if (!ref) {
 console.log('Provide a valid template!');
 process.exit(1);
}

const isScript = ref.endsWith('.zsh') ? 'zsh' : ref.endsWith('.sh') ? 'sh' : null;
const defaultName = isScript ? null : ref.startsWith('.') ? ref : `${ref}-app`;
const name = prompt(`What is your project name? (default: ${defaultName})`) || defaultName;
if (!name || name == null) {
 console.log('Provide a project name!');
 process.exit(1);
}
if (isScript) {
 console.log(isScript);
 $`DIR=${name} ${isScript} ${templateDir}/${ref}`.catch(e => console.log(e));
} else {
 if (Number(await $`test -e ${pwd}/${name} && echo 1 || echo 0`.text())) {
  console.log('\nAlready exists!\n');
  process.exit();
 }
 await $`cp ${templateDir}/${ref} ./${name} -r`;
 Number(await $`test -e ${templateDir}/${name}/package.json && echo 1 || echo 0`.text()) ? await $`sed -i 's/"name": .*/"name": "${name}"/' ./${name}/package.json'` : !Number(await $`test -e ${templateDir}/${template}/ && echo 1 || echo 0`.text()) ? null : (await confirm({ message: 'No package.json found. Create one?' })) && (await $`echo '{"name": "${name}"}' > package.json`.cwd(name));
 console.log(`Success! Created ${name} at ${pwd}/${name}\n\r`);
}
