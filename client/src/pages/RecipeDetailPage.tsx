// src/pages/RecipeDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api.ts';
// Assuming RecipeSummary includes necessary fields for detail view, or create a new RecipeDetail type
import { RecipeSummary as RecipeDetail, Tag } from '../types/index.ts'; // Use RecipeSummary for now

const RecipeDetailPage: React.FC = () => {
    const { id: recipeId } = useParams<{ id: string }>(); // Get recipe ID from URL
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSteps, setShowSteps] = useState(false); // State to toggle step visibility

    // Function to fetch recipe data
    const fetchRecipe = useCallback(async () => {
        if (!recipeId) {
            setError("No recipe ID provided.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<{ data: RecipeDetail }>(`/recipes/${recipeId}`);
            setRecipe(response.data.data);
        } catch (err: any) {
            console.error("Failed to fetch recipe details:", err);
            if (err.response?.status === 404) {
                setError("Recipe not found.");
            } else if (err.response?.status === 403) {
                 setError("You do not have permission to view this recipe.");
            }
            else {
                setError(err.response?.data?.message || err.message || 'Failed to load recipe details.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [recipeId]); // Dependency: fetch again if recipeId changes

    // Fetch data when component mounts or recipeId changes
    useEffect(() => {
        fetchRecipe();
    }, [fetchRecipe]);

    // --- Event Handlers ---
    const toggleSteps = () => {
        setShowSteps(prev => !prev);
    };

    const handleShare = () => {
        // Simple copy URL to clipboard
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => {
                alert('Recipe link copied to clipboard!'); // Simple feedback
            })
            .catch(err => {
                console.error('Failed to copy URL:', err);
                alert('Failed to copy link.');
            });
    };

    // --- Render Logic ---

    if (isLoading) {
        return <div className="text-center py-10">Loading recipe...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-600 bg-red-100 p-4 rounded border border-red-400">
                <p>{error}</p>
                <Link to="/" className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-medium">
                    Go to Dashboard
                </Link>
            </div>
        );
    }

    if (!recipe) {
        // Should ideally be caught by error state, but as a fallback
        return <div className="text-center py-10 text-gray-500">Recipe data not available.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
            {/* Header Section */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                 {/* Image Placeholder */}
                 {!recipe.imageUrl && (
                    <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500 mb-4">
                        <span>No Image Available</span>
                    </div>
                 )}
                 {/* Later: <img src={recipe.imageUrl} ... /> */}

                <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
                {recipe.description && (
                    <p className="text-gray-700 mb-3">{recipe.description}</p>
                )}
                 {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {recipe.tags.map((tag: Tag) => (
                            <span
                                key={tag.id}
                                className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
                 {/* Action Buttons */}
                 <div className="flex gap-4 items-center mt-3">
                    <Link
                         to={`/recipes/${recipe.id}/edit`}
                         className="inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                     >
                         Edit Recipe
                     </Link>
                     <button
                        onClick={handleShare}
                        className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                        title="Copy link to share"
                     >
                         Share
                     </button>
                 </div>
            </div>

            {/* Ingredient/Steps Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Ingredients Column */}
                <div className="md:col-span-1 border-r-0 md:border-r border-gray-200 pr-0 md:pr-6">
                    <h2 className="text-2xl font-semibold mb-3">Ingredients</h2>
                    {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-gray-800">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index}>
                                    <span className="font-medium">{ingredient.measure}</span> {ingredient.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No ingredients listed.</p>
                    )}
                </div>

                {/* Steps Column */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-2xl font-semibold">Steps</h2>
                        <button
                            onClick={toggleSteps}
                            className="px-3 py-1 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-800"
                        >
                            {showSteps ? 'Hide Steps' : 'Show Steps'}
                        </button>
                    </div>

                    {/* Conditional Rendering of Steps */}
                    {showSteps ? (
                        recipe.steps && recipe.steps.length > 0 ? (
                            <ol className="list-decimal list-outside space-y-3 pl-5 text-gray-800">
                                {recipe.steps.sort((a,b) => a.order - b.order).map((step) => ( // Ensure sorting
                                    <li key={step.order} className="pl-2">
                                        {step.description}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-gray-500">No steps listed.</p>
                        )
                    ) : (
                         <p className="text-gray-500 italic">Steps are hidden. Click "Show Steps" to view.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailPage;