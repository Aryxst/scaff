interface TemplateConfig {
 ref: string;
 name?: string;
 description?: string;
}
export const mappings = [
 {
  ref: '.vscode',
  name: 'VSCode Basic Settings', // Example
  description: 'some basic vsc config',
 },
 {
  ref: 'example.zsh',
 },
] as TemplateConfig[];
