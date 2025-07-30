const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export async function findMatches(preferences: any) {
  try {
    console.log('Making API call to:', `${API_BASE_URL}/api/match`);
    console.log('With preferences:', preferences);
    
    const response = await fetch(`${API_BASE_URL}/api/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.status}`);
    }

    const result = await response.json();
    console.log('API result:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
} 