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
 },
] as TemplateConfig[];
