export type DeepseekRole = 'user' | 'assistant';
export interface DeepseekMessage {
  role: DeepseekRole;
  content: string;
}

export interface DeepseekRequestDto {
  model: string;
  messages: DeepseekMessage[];
}
