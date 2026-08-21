const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../middleware/logger');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const buildPrompt = ({ destination, duration, startDate, travelers, tripType, preferences }) => {
  const { budget, interests, travelStyle, dietaryRestrictions } = preferences || {};

  return `You are an expert travel planner with deep local knowledge. Generate a detailed ${duration}-day itinerary for ${destination}.

Traveler profile:
- Budget: ${budget || 'mid-range'}
- Interests: ${interests?.join(', ') || 'general sightseeing'}
- Travel style: ${travelStyle || 'moderate'}
- Group: ${travelers || 1} traveler(s), ${tripType || 'solo'} trip
- Start date: ${startDate || 'flexible'}
${dietaryRestrictions?.length ? `- Dietary restrictions: ${dietaryRestrictions.join(', ')}` : ''}

Return ONLY a valid JSON array of day objects. No markdown, no code fences, no explanation — just raw JSON.

Each day object must have:
- "day" (number, starting from 1)
- "date" (string, format "Day 1 - YYYY-MM-DD" or just "Day 1")
- "title" (string, a creative title for the day, e.g., "Exploring Old Town")
- "activities" (array of activity objects)
- "dailyCost" (number, estimated total cost for the day in USD)

Each activity object must have:
- "time" (string, e.g., "09:00 AM")
- "name" (string, the activity or place name — use real place names)
- "description" (string, 1-2 sentences about the activity)
- "location" (string, specific address or area name)
- "category" (string, one of: "food", "attraction", "transport", "accommodation", "activity")
- "estimatedCost" (number, in USD)
- "duration" (string, e.g., "2 hours")
- "tips" (string, a helpful local tip)

Include breakfast, lunch, dinner, and 2-3 activities per day. Be specific with real place names, real restaurants, and real attractions. Ensure costs are realistic for the ${budget || 'mid-range'} budget level.`;
};

const parseAIResponse = (text) => {
  // Try to extract JSON from the response
  let cleaned = text.trim();

  // Remove markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  // Parse JSON
  const parsed = JSON.parse(cleaned);

  // Validate it's an array
  if (!Array.isArray(parsed)) {
    throw new Error('Response is not an array of days');
  }

  // Validate basic structure
  parsed.forEach((day, i) => {
    if (typeof day.day !== 'number') {
      day.day = i + 1;
    }
    if (!day.title) {
      day.title = `Day ${day.day}`;
    }
    if (!Array.isArray(day.activities)) {
      day.activities = [];
    }
    if (typeof day.dailyCost !== 'number') {
      day.dailyCost = day.activities.reduce(
        (sum, a) => sum + (Number(a.estimatedCost) || 0),
        0
      );
    }

    // Validate and clean activities
    day.activities = day.activities.map((activity) => ({
      time: activity.time || '12:00 PM',
      name: activity.name || 'Activity',
      description: activity.description || '',
      location: activity.location || '',
      coordinates: activity.coordinates || { lat: 0, lng: 0 },
      category: ['food', 'attraction', 'transport', 'accommodation', 'activity'].includes(activity.category)
        ? activity.category
        : 'activity',
      estimatedCost: Number(activity.estimatedCost) || 0,
      duration: activity.duration || '1 hour',
      tips: activity.tips || '',
    }));
  });

  return parsed;
};

const generateItinerary = async (tripData, maxRetries = 3) => {
  const prompt = buildPrompt(tripData);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Generating itinerary attempt ${attempt}/${maxRetries} for ${tripData.destination}`);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const itinerary = parseAIResponse(text);

      logger.info(`Itinerary generated successfully: ${itinerary.length} days`);
      return itinerary;
    } catch (err) {
      lastError = err;
      logger.warn(`Itinerary generation attempt ${attempt} failed: ${err.message}`);

      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt)); // Exponential backoff
      }
    }
  }

  logger.error('All itinerary generation attempts failed:', lastError);
  throw new Error(`Failed to generate itinerary after ${maxRetries} attempts: ${lastError.message}`);
};

const generateSuggestions = async (destination) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const prompt = `Suggest 5 must-visit attractions and 3 local food recommendations for ${destination}. 
Return ONLY a valid JSON object with this structure:
{
  "attractions": [{"name": "...", "description": "...", "category": "attraction"}],
  "food": [{"name": "...", "description": "...", "category": "food"}]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  let cleaned = text.trim().replace(/^```json\s?/, '').replace(/```$/, '').trim();
  return JSON.parse(cleaned);
};

module.exports = { generateItinerary, generateSuggestions };
