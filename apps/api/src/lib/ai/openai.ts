import OpenAI from 'openai';
import { httpError } from '../errors';

let cachedClient: OpenAI | null = null;

export const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw httpError(500, 'CONFIG_ERROR', 'OPENAI_API_KEY is not configured');
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
};

export const getOpenAIModel = () => process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

export const getOpenAIChatCompletion = async (args: {
  system: string;
  user: string;
}): Promise<string> => {
  const client = getOpenAIClient();
  const model = getOpenAIModel();

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: args.system },
      { role: 'user', content: args.user },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? '';
  if (!content.trim()) {
    throw httpError(502, 'UPSTREAM_ERROR', 'OpenAI returned an empty response');
  }

  return content;
};

