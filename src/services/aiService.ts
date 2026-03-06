import { generateJsonContent } from './geminiService';
import { JournalEntry } from '../features/journal/journalService';

export interface AIInsight {
    summary: string;
    detectedPattern: string;
    copingSuggestions: string[];
    journalingPrompt: string;
    actionableStep: string;
}

const insightSchema = {
    type: 'object',
    properties: {
        summary: { type: 'string', description: 'A warm, empathetic 2-3 sentence summary of the user\'s emotional state based on recent entries.' },
        detectedPattern: { type: 'string', description: 'A pattern or trend noticed across the entries (e.g., "Your stress tends to rise during work contexts").' },
        copingSuggestions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Three gentle, actionable coping strategies tailored to the user\'s current emotional state.',
        },
        journalingPrompt: { type: 'string', description: 'A thoughtful journaling prompt for tomorrow based on current emotional patterns.' },
        actionableStep: { type: 'string', description: 'One small, achievable step the user can take right now to feel a little better.' },
    },
    required: ['summary', 'detectedPattern', 'copingSuggestions', 'journalingPrompt', 'actionableStep'],
};

export const generateEnhancedInsight = async (entries: JournalEntry[]): Promise<AIInsight> => {
    const recentEntries = entries.slice(0, 7);

    const entrySummaries = recentEntries.map(e => {
        const parts = [
            `Date: ${e.date}`,
            `Mood: ${e.moodLabel} (${e.moodScore}/10)`,
        ];
        if (e.energyLevel) parts.push(`Energy: ${e.energyLevel}/10`);
        if (e.stressLevel) parts.push(`Stress: ${e.stressLevel}/10`);
        if (e.anxietyLevel) parts.push(`Anxiety: ${e.anxietyLevel}/10`);
        if (e.emotionTags?.length) parts.push(`Emotions: ${e.emotionTags.join(', ')}`);
        if (e.context) parts.push(`Context: ${e.context}`);
        if (e.content) parts.push(`Journal: "${e.content}"`);
        return parts.join(' | ');
    }).join('\n');

    const prompt = `You are a compassionate emotional wellness assistant for Innerlytics, a soft digital diary app.

Analyze the following recent mood journal entries and provide structured insights. Be warm, non-clinical, and emotionally supportive. Speak like a caring friend, not a therapist.

Recent entries:
${entrySummaries}

Provide:
1. A warm summary of how they've been feeling
2. Any emotional pattern you detect
3. Three gentle coping suggestions
4. A thoughtful journaling prompt for tomorrow
5. One small actionable step they can take right now`;

    return await generateJsonContent(prompt, insightSchema);
};
