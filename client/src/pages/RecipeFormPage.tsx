// src/pages/RecipeFormPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/api.ts';
import { RecipeSummary } from '../types/index.ts'; // Import Tag type if needed separately

// Define interfaces for form sub-items
interface IngredientInput {
    id?: string; // Keep track for potential future updates, not strictly needed for create/replace
    name: string;
    measure: string;
}

interface StepInput {
    id?: string;
    order: number;
    description: string;
}

interface RecipeFormData {
    name: string;
    description: string;
    imageUrl: string; // We'll leave this empty for now
    isPublic: boolean;
    ingredients: IngredientInput[];
    steps: StepInput[];
    tags: string[]; // Store tags as an array of strings in the form state
}

interface RecipeFormPageProps {
    mode: 'create' | 'edit';
}

const RecipeFormPage: React.FC<RecipeFormPageProps> = ({ mode }) => {
    const { id: recipeId } = useParams<{ id: string }>(); // Get recipe ID from URL if in edit mode
    const navigate = useNavigate();

    const [formData, setFormData] = useState<RecipeFormData>({
        name: '',
        description: '',
        imageUrl: '', // Will be handled later
        isPublic: false,
        ingredients: [{ name: '', measure: '' }], // Start with one empty ingredient
        steps: [{ order: 1, description: '' }], // Start with one empty step
        tags: [],
    });
    const [tagInput, setTagInput] = useState(''); // For the tag input field
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(mode === 'edit'); // Only fetch if in edit mode

    // Fetch recipe data if in edit mode
    const fetchRecipeData = useCallback(async () => {
        if (mode !== 'edit' || !recipeId) {
            setIsFetching(false);
            return;
        }
        setIsFetching(true);
        setError(null);
        try {
            const response = await apiClient.get<{ data: RecipeSummary }>(`/recipes/${recipeId}`); // Assuming RecipeSummary includes ingredients/steps
            const recipe = response.data.data;
            setFormData({
                name: recipe.name,
                description: recipe.description || '',
                imageUrl: recipe.imageUrl || '',
                isPublic: recipe.isPublic,
                // Ensure ingredients and steps exist before mapping
                ingredients: recipe.ingredients?.map(ing => ({ name: ing.name, measure: ing.measure })) || [{ name: '', measure: '' }],
                steps: recipe.steps?.map(step => ({ order: step.order, description: step.description })).sort((a,b) => a.order - b.order) || [{ order: 1, description: '' }], // Sort steps by order
                tags: recipe.tags?.map(tag => tag.name) || [],
            });
        } catch (err: any) {
            console.error('Failed to fetch recipe:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load recipe data.');
            // Optionally navigate back or show a persistent error
        } finally {
            setIsFetching(false);
        }
    }, [mode, recipeId]);

    useEffect(() => {
        fetchRecipeData();
    }, [fetchRecipeData]); // Fetch data on mount/mode change

    // --- Form Input Handlers ---

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = event.target;
        // Handle checkbox specifically
        const checked = (event.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // --- Ingredient Handlers ---
    const handleIngredientChange = (index: number, field: keyof IngredientInput, value: string) => {
        setFormData(prev => {
            const newIngredients = [...prev.ingredients];
            newIngredients[index] = { ...newIngredients[index], [field]: value };
            return { ...prev, ingredients: newIngredients };
        });
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { name: '', measure: '' }],
        }));
    };

    const removeIngredient = (index: number) => {
        // Prevent removing the last ingredient row
        if (formData.ingredients.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index),
        }));
    };

    // --- Step Handlers ---
     const handleStepChange = (index: number, value: string) => {
         setFormData(prev => {
             const newSteps = [...prev.steps];
             // Ensure order is maintained correctly, even if UI reorders visually
             newSteps[index] = { ...newSteps[index], description: value, order: index + 1 };
             return { ...prev, steps: newSteps };
         });
     };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, { order: prev.steps.length + 1, description: '' }],
        }));
    };

    const removeStep = (index: number) => {
         // Prevent removing the last step row
         if (formData.steps.length <= 1) return;
         setFormData(prev => ({
             ...prev,
             // Renumber subsequent steps after removal
             steps: prev.steps
                    .filter((_, i) => i !== index)
                    .map((step, newIndex) => ({ ...step, order: newIndex + 1 })),
         }));
     };

    // --- Tag Handlers ---
    const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(event.target.value);
    };

    const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Add tag on comma or enter, prevent duplicates, trim whitespace
        if (event.key === ',' || event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission on Enter
            const newTag = tagInput.trim().toLowerCase();
            if (newTag && !formData.tags.includes(newTag)) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag]
                }));
            }
            setTagInput(''); // Clear input
        }
    };

     const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // --- Form Submission ---
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        // Basic validation before sending
        if (!formData.name.trim()) {
            setError("Recipe name is required.");
            setIsLoading(false);
            return;
        }
        // Add more validation if needed...

        // Prepare payload (ensure steps have correct order from state)
         const payload = {
             ...formData,
             // Filter out empty ingredients/steps before sending? Optional.
             // ingredients: formData.ingredients.filter(ing => ing.name.trim() && ing.measure.trim()),
             // steps: formData.steps.filter(step => step.description.trim()),
         };


        try {
            let response;
            if (mode === 'create') {
                response = await apiClient.post('/recipes', payload);
            } else {
                // Ensure recipeId exists for editing
                if (!recipeId) throw new Error("Recipe ID is missing for update.");
                response = await apiClient.put(`/recipes/${recipeId}`, payload);
            }

            // Navigate to the recipe detail page on success
            const newRecipeId = response.data?.data?.id || recipeId; // Get ID from response or use existing
            if (newRecipeId) {
                 navigate(`/recipes/${newRecipeId}`);
            } else {
                 navigate('/'); // Fallback to dashboard
            }

        } catch (err: any) {
            console.error(`Failed to ${mode} recipe:`, err);
            const message = err.response?.data?.message || err.message || `Failed to ${mode} recipe.`;
             if (err.response?.data?.errors) {
                 const formattedErrors = err.response.data.errors.map((e: any) => e.msg).join(' ');
                 setError(formattedErrors || message);
             } else {
                setError(message);
             }
        } finally {
            setIsLoading(false);
        }
    };

    // Render loading state while fetching for edit mode
    if (isFetching) {
         return <div className="text-center py-10">Loading recipe details...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
                {mode === 'create' ? 'Create New Recipe' : 'Edit Recipe'}
            </h1>

            {error && (
                <div className="mb-4 p-3 text-red-800 bg-red-100 border border-red-400 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Recipe Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                 {/* Image URL - Placeholder for now */}
                 {/* <input type="hidden" name="imageUrl" value={formData.imageUrl} /> */}
                 {/* Later: Add file input and logic to call upload endpoint */}

                 {/* Public Toggle */}
                <div className="flex items-center">
                     <input
                         id="isPublic"
                         name="isPublic"
                         type="checkbox"
                         checked={formData.isPublic}
                         onChange={handleInputChange}
                         className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                     />
                     <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                         Make recipe public (shareable)
                     </label>
                 </div>


                {/* Ingredients */}
                <fieldset className="border p-4 rounded">
                    <legend className="text-lg font-medium text-gray-900 px-2">Ingredients</legend>
                    <div className="space-y-3 mt-2">
                        {formData.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2 items-start">
                                <div className="flex-1 w-full sm:w-auto">
                                    <label htmlFor={`ingredient-name-${index}`} className="sr-only">Ingredient Name</label>
                                    <input
                                        type="text"
                                        id={`ingredient-name-${index}`}
                                        placeholder="Ingredient Name"
                                        required
                                        value={ingredient.name}
                                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div className="flex-1 w-full sm:w-auto">
                                     <label htmlFor={`ingredient-measure-${index}`} className="sr-only">Measure</label>
                                     <input
                                        type="text"
                                        id={`ingredient-measure-${index}`}
                                        placeholder="Measure (e.g., 2 cups, 100g)"
                                        required
                                        value={ingredient.measure}
                                        onChange={(e) => handleIngredientChange(index, 'measure', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(index)}
                                    disabled={formData.ingredients.length <= 1}
                                    className="mt-1 sm:mt-0 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addIngredient}
                        className="mt-3 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                    >
                        + Add Ingredient
                    </button>
                </fieldset>

                {/* Steps */}
                 <fieldset className="border p-4 rounded">
                     <legend className="text-lg font-medium text-gray-900 px-2">Steps</legend>
                     <div className="space-y-3 mt-2">
                         {formData.steps.map((step, index) => (
                             <div key={index} className="flex items-start gap-2">
                                 <span className="pt-2 font-medium text-gray-700">{index + 1}.</span>
                                 <div className="flex-grow">
                                     <label htmlFor={`step-desc-${index}`} className="sr-only">Step Description</label>
                                     <textarea
                                         id={`step-desc-${index}`}
                                         rows={2}
                                         placeholder="Step description"
                                         required
                                         value={step.description}
                                         onChange={(e) => handleStepChange(index, e.target.value)}
                                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                     />
                                 </div>
                                 <button
                                     type="button"
                                     onClick={() => removeStep(index)}
                                     disabled={formData.steps.length <= 1}
                                     className="mt-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                     Remove
                                 </button>
                             </div>
                         ))}
                     </div>
                     <button
                         type="button"
                         onClick={addStep}
                         className="mt-3 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                     >
                         + Add Step
                     </button>
                 </fieldset>

                 {/* Tags */}
                 <fieldset className="border p-4 rounded">
                    <legend className="text-lg font-medium text-gray-900 px-2">Tags</legend>
                     <div>
                         <label htmlFor="tag-input" className="block text-sm font-medium text-gray-700 mb-1">Add tags (separated by comma or Enter)</label>
                         <input
                             type="text"
                             id="tag-input"
                             value={tagInput}
                             onChange={handleTagInputChange}
                             onKeyDown={handleTagInputKeyDown}
                             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
                             placeholder="e.g., quick, vegan, dessert"
                         />
                         <div className="flex flex-wrap gap-2">
                             {formData.tags.map((tag, index) => (
                                 <span key={index} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                     {tag}
                                     <button
                                         type="button"
                                         onClick={() => removeTag(tag)}
                                         className="ml-1.5 text-blue-600 hover:text-blue-800 font-bold"
                                         aria-label={`Remove ${tag} tag`}
                                     >
                                         × {/* Multiplication sign as 'x' */}
                                     </button>
                                 </span>
                             ))}
                         </div>
                     </div>
                 </fieldset>


                {/* Submit Button */}
                <div className="pt-5">
                    <div className="flex justify-end gap-3">
                         <button
                             type="button"
                             onClick={() => navigate(-1)} // Go back to previous page
                             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                         >
                             Cancel
                         </button>
                        <button
                            type="submit"
                            disabled={isLoading || isFetching}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : (mode === 'create' ? 'Create Recipe' : 'Save Changes')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RecipeFormPage;