interface TemplateConfig {
 ref: string;
 name?: string;
 description?: string;
 script?: string;
}
export default [
 {
  ref: '.vscode',
  name: 'VSCode Basic Settings',
 },
] as TemplateConfig[];
