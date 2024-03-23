interface TemplateConfig {
 ref: string;
 name?: string;
 description?: string;
 script?: string;
}
export const mappings = [
 {
  ref: '.vscode',
  name: 'VSCode Basic Settings', // Example
  description: 'some basic vsc config',
 },
] as TemplateConfig[];
