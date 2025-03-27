// src/store/slices/recipeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../services/api.ts'; // Adjust path if needed
import { RecipeSummary } from '../../types/index.ts'; // Adjust path if needed

interface RecipeState {
  recipes: RecipeSummary[];
  isLoading: boolean;
  error: string | null;
  // Add state for pagination later if needed
}

const initialState: RecipeState = {
  recipes: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch user's recipes
export const fetchUserRecipes = createAsyncThunk(
  'recipes/fetchUserRecipes',
  async (_, { rejectWithValue }) => { // Use _ if first arg (payload) is not needed
    try {
      const response = await apiClient.get<{ data: RecipeSummary[] }>('/recipes'); // GET /api/recipes
      return response.data.data; // Expecting backend to wrap response in { data: [...] }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch recipes';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to search user's recipes
 export const searchUserRecipes = createAsyncThunk(
   'recipes/searchUserRecipes',
   async (params: { name?: string; tags?: string }, { rejectWithValue }) => {
     try {
       // Construct query parameters
       const queryParams = new URLSearchParams();
       if (params.name) queryParams.append('name', params.name);
       if (params.tags) queryParams.append('tags', params.tags);

       const response = await apiClient.get<{ data: RecipeSummary[] }>(`/recipes/search?${queryParams.toString()}`);
       return response.data.data;
     } catch (err: any) {
       const message = err.response?.data?.message || err.message || 'Failed to search recipes';
       return rejectWithValue(message);
     }
   }
 );

// Async thunk for deleting a recipe (optional: handle state update here)
export const deleteRecipeById = createAsyncThunk(
    'recipes/deleteRecipeById',
    async (recipeId: string, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/recipes/${recipeId}`);
            return recipeId; // Return the ID of the deleted recipe
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Failed to delete recipe';
            return rejectWithValue(message);
        }
    }
);


const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    // Add synchronous reducers if needed, e.g., clear recipes on logout
     clearRecipes: (state) => {
         state.recipes = [];
         state.isLoading = false;
         state.error = null;
     }
  },
  extraReducers: (builder) => {
    // --- Fetch User Recipes ---
    builder.addCase(fetchUserRecipes.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserRecipes.fulfilled, (state, action: PayloadAction<RecipeSummary[]>) => {
      state.isLoading = false;
      state.recipes = action.payload;
    });
    builder.addCase(fetchUserRecipes.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // --- Search User Recipes ---
     builder.addCase(searchUserRecipes.pending, (state) => {
       state.isLoading = true;
       state.error = null;
     });
     builder.addCase(searchUserRecipes.fulfilled, (state, action: PayloadAction<RecipeSummary[]>) => {
       state.isLoading = false;
       state.recipes = action.payload; // Replace recipes with search results
     });
     builder.addCase(searchUserRecipes.rejected, (state, action) => {
       state.isLoading = false;
       state.error = action.payload as string;
     });

    // --- Delete Recipe ---
     builder.addCase(deleteRecipeById.pending, (state) => {
        // Optionally set a specific loading state for deletion
        // state.isDeleting = true;
     });
     builder.addCase(deleteRecipeById.fulfilled, (state, action: PayloadAction<string>) => {
        // Remove the deleted recipe from the state
        state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload);
        // state.isDeleting = false;
     });
     builder.addCase(deleteRecipeById.rejected, (state, action) => {
         // state.isDeleting = false;
         state.error = action.payload as string; // Or handle delete error specifically
         console.error("Delete failed:", action.payload);
         // Maybe show a temporary notification to the user instead of replacing main error
     });
  },
});

export const { clearRecipes } = recipeSlice.actions; // Export sync actions if any
export default recipeSlice.reducer;