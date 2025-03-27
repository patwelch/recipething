// src/types/index.ts (or similar)
export interface Tag {
    id: string;
    name: string;
  }
  
  export interface RecipeSummary { // Define a type for the recipe data shown on dashboard cards
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    isPublic: boolean;
    createdAt: string; // Assuming string from JSON
    updatedAt: string;
    tags: Tag[]; // Include tags for display
    _count?: { // Optional count from backend
      ingredients: number;
      steps: number;
    }
  }