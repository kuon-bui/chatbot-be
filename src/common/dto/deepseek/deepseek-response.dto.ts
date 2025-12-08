export class PromptTokensDetails {
  cached_tokens: number;
}

export class Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: PromptTokensDetails;
  prompt_cache_hit_tokens: number;
  prompt_cache_miss_tokens: number;
}

export class Message {
  role: string;
  content: string;
}

export class DeepseekChoice {
  index: number;
  message: Message;
  logprobs: any | null;
  finish_reason: string;
}

export class DeepSeekResponseDto {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepseekChoice[];
  usage: Usage;
  system_fingerprint: string;
}
