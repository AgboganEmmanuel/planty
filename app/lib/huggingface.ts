import Constants from 'expo-constants';

// Helper function to create a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getPlantInformation(plantName: string, species: string): Promise<string | null> {
  // Get token from Expo Constants
  const huggingFaceToken = Constants.expoConfig?.extra?.HUGGING_FACE_TOKEN;

  // Check if token exists
  if (!huggingFaceToken) {
    console.error('Hugging Face Token is not set in app.json');
    return null;
  }

  const MODELS = [
    'google/flan-t5-base',
    'facebook/bart-large-cnn',
    'google/pegasus-xsum'
  ];

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Sanitize inputs to remove any special characters or potential injection risks
        const sanitizedPlantName = plantName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
        const sanitizedSpecies = species.replace(/[^a-zA-Z0-9 ]/g, '').trim();

        const prompt = `Provide a concise botanical description of the plant ${sanitizedPlantName} (scientific name: ${sanitizedSpecies}). 
        Include its origin, key characteristics, habitat, and interesting facts. 
        Keep the description informative yet brief, under 200 words.`;

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${huggingFaceToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 200,
              temperature: 0.7,
              do_sample: true
            }
          })
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.warn(`Error with model ${model}:`, errorBody);
          
          // If model is loading, wait and retry
          if (errorBody.includes('Model is currently loading')) {
            console.warn(`Model ${model} is loading. Attempt ${attempt}. Waiting...`);
            await delay(5000 * attempt);
            continue;
          }
          
          // Skip to next model if this one fails
          break;
        }

        const data = await response.json();
        
        // Handle different possible response formats
        let generatedText = '';
        if (Array.isArray(data)) {
          generatedText = data[0]?.generated_text || 
                          data[0]?.summary_text || 
                          data[0];
        } else if (typeof data === 'string') {
          generatedText = data;
        } else if (data[0]) {
          generatedText = data[0];
        }

        // Ensure we have a meaningful response
        if (generatedText && generatedText.length > 50) {
          return generatedText;
        }
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
      }
    }
  }

  // Fallback description if all models fail
  return `No detailed information available for ${plantName} (${species}). This plant is unique and fascinating!`;
}