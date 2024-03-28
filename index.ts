import { createSelection } from 'bun-promptx';
import { $ } from 'bun';
import { mappings, promptPackageJson } from './config';
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
 // Remove templates that don't have a binding in config.ts, at least specify ref property
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
// Support for script templates
const isScript = ref.endsWith('.zsh') ? 'zsh' : ref.endsWith('.sh') ? 'sh' : null;
const defaultName = isScript ? 'none' : ref.startsWith('.') ? ref : `${ref}-app`;
const name = prompt(`What is your project name? (default: ${defaultName})`) || defaultName;
if (!name || name == 'none') {
 console.log('Provide a project name!');
 process.exit(1);
}
if (isScript) {
 console.log(isScript);
 // Use this variable in scripts
 $`DIR=${name} ${isScript} ${templateDir}/${ref}`.catch(e => console.log(e));
} else {
 if (Number(await $`test -e ${pwd}/${name} && echo 1 || echo 0`.text())) {
  console.log('\nAlready exists!\n');
  process.exit();
 }
 await $`cp ${templateDir}/${ref} ./${name} -r`;
 if (promptPackageJson) {
  // Exists package.json in ./${name}
  $.cwd(name);
  +(await $`test -e ./package.json && echo 1 || echo 0`.text())
   ? // Replace name
     await $`sed -i 's/"name": .*/"name": "${name}"\,/' ./package.json'`
   : // Should create package.json, disable in config.ts
     confirm('No package.json found. Create one?') && (await $`echo '{"name": "${name}"}' > package.json`);
 }
 console.log(`Success! Created ${name} at ${pwd}/${name}\n\r`);
}
