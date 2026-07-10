import Anthropic from '@anthropic-ai/sdk';
import type { PortfolioCopy, PortfolioProject } from '@/lib/types';

const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

let client: Anthropic | null = null;

function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Claude did not return a JSON object');
  return JSON.parse(match[0]) as T;
}

export interface PortfolioGenerationInput {
  name: string;
  stack: string[];
  experienceYears: number;
  targetClients: string;
  personality: string;
  projects: PortfolioProject[];
  bioRaw: string;
}

export async function generatePortfolioCopy(input: PortfolioGenerationInput): Promise<PortfolioCopy> {
  const prompt = `You are an expert copywriter specialising in positioning freelance developers.
Based on the developer's answers below, write compelling portfolio copy that SELLS them as a professional — not just lists their skills.

Developer data:
- Name: ${input.name}
- Stack: ${input.stack.join(', ')}
- Years of experience: ${input.experienceYears}
- Target clients: ${input.targetClients}
- Personality: ${input.personality}
- Projects: ${JSON.stringify(input.projects)}
- Raw bio: ${input.bioRaw}

Generate a JSON with:
{
  "headline": "one powerful line that captures who they are and who they help",
  "tagline": "one sentence value proposition",
  "bio": "3-4 sentences, persuasive, first person, specific",
  "projects": [{"title": "", "description": "2-3 sentences that highlight impact, not just features"}]
}

Rules:
- Never use generic phrases like "passionate developer" or "hard worker"
- Focus on outcomes and results, not technologies
- Be specific and confident
- Write as if a top copywriter is selling this developer to their ideal client

Respond with ONLY the JSON object, no other text.`;

  const message = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content.find((b) => b.type === 'text')?.text ?? '';
  return extractJson<PortfolioCopy>(text);
}

export interface MatchScoreInput {
  portfolioCopy: PortfolioCopy;
  stack: string[];
  jobTitle: string;
  jobDescription: string;
}

export async function calculateMatchScore(input: MatchScoreInput): Promise<number> {
  const prompt = `You are scoring how well a freelance developer matches a job posting.

Developer profile:
Headline: ${input.portfolioCopy.headline}
Bio: ${input.portfolioCopy.bio}
Stack: ${input.stack.join(', ')}

Job posting:
Title: ${input.jobTitle}
Description: ${input.jobDescription}

Score the match from 0 to 100 based on stack overlap, seniority fit, and domain relevance.
Respond with ONLY a JSON object: {"score": <integer 0-100>}`;

  const message = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content.find((b) => b.type === 'text')?.text ?? '';
  const { score } = extractJson<{ score: number }>(text);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export interface ProposalInput {
  developerName: string;
  portfolioCopy: PortfolioCopy;
  jobTitle: string;
  jobDescription: string;
}

export async function generateProposal(input: ProposalInput): Promise<string> {
  const prompt = `You are writing a freelance proposal on behalf of ${input.developerName}.

Developer profile:
${JSON.stringify(input.portfolioCopy)}

Job posting:
Title: ${input.jobTitle}
Description: ${input.jobDescription}

Write a personalised proposal that:
1. Opens with something specific about THEIR project (not generic)
2. Connects the developer's specific experience to their exact needs
3. Is confident but not arrogant
4. Is 150-200 words maximum
5. Ends with a clear, low-friction call to action

Do NOT use: "I am passionate", "I would love to", "please consider me"

Respond with ONLY the proposal text, no preamble.`;

  const message = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content.find((b) => b.type === 'text')?.text.trim() ?? '';
}

export interface TestimonialFormatInput {
  clientName: string;
  clientCompany?: string;
  rating: number;
  contentRaw: string;
}

export async function formatTestimonial(input: TestimonialFormatInput): Promise<string> {
  const prompt = `Turn this raw client feedback into a polished, concise testimonial (2-3 sentences, first person, keep the client's voice and meaning — do not invent claims).

Client: ${input.clientName}${input.clientCompany ? ` (${input.clientCompany})` : ''}
Rating: ${input.rating}/5
Raw feedback: ${input.contentRaw}

Respond with ONLY the polished testimonial text.`;

  const message = await getClient().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content.find((b) => b.type === 'text')?.text.trim() ?? '';
}
