export interface AISuggestion {
  description: string;
  suggestedComponents: {
    name: string;
    category: 'power' | 'movement' | 'sensors' | 'computing' | 'mechanical' | 'custom';
    stats: Record<string, string>;
    shape: 'box' | 'cylinder' | 'sphere' | 'torus' | 'pipe';
    color: string;
    scale: number;
    icon: string;
  }[];
}

export async function getBuildSuggestion(prompt: string): Promise<AISuggestion> {
  try {
    const response = await fetch("/api/gemini/suggestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    return await response.json() as AISuggestion;
  } catch (error) {
    console.error("AI Client Request Error:", error);
    return {
      description: error instanceof Error ? error.message : "Failed to generate design suggestion securely.",
      suggestedComponents: []
    };
  }
}
