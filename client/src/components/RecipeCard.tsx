// src/components/RecipeCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { RecipeSummary, Tag } from '../types/index.ts'; // Adjust path
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store.ts';
import { deleteRecipeById } from '../store/slices/recipeSlice.ts'; // Adjust path

interface RecipeCardProps {
    recipe: RecipeSummary;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
    const dispatch: AppDispatch = useDispatch();

    const handleDelete = () => {
        // Simple confirmation dialog
        if (window.confirm(`Are you sure you want to delete "${recipe.name}"?`)) {
            dispatch(deleteRecipeById(recipe.id))
                .unwrap() // unwrap handles the promise outcome (optional)
                .catch(err => {
                     // Optionally show a more specific error notification here
                    console.error('Failed to delete recipe from card:', err);
                    alert(`Failed to delete recipe: ${err}`);
                 });
        }
    };

    return (
        <div className="border rounded-lg shadow-md overflow-hidden bg-white flex flex-col">
            {/* Placeholder for image - Add later */}
            {/* {recipe.imageUrl && (
                 <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-48 object-cover" />
             )} */}
             {/* Basic placeholder if no image */}
            {!recipe.imageUrl && (
                 <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                     <span>No Image</span>
                 </div>
            )}

            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold mb-2">{recipe.name}</h3>

                {/* Description (Optional) */}
                {recipe.description && (
                    <p className="text-gray-600 text-sm mb-3 flex-grow">
                        {/* Truncate long descriptions if needed */}
                        {recipe.description.length > 100
                            ? `${recipe.description.substring(0, 100)}...`
                            : recipe.description}
                    </p>
                )}

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                        {recipe.tags.map((tag: Tag) => (
                            <span
                                key={tag.id}
                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-200">
                    <Link
                        to={`/recipes/${recipe.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        View Details
                    </Link>
                    <div>
                         <Link
                             to={`/recipes/${recipe.id}/edit`}
                             className="text-green-600 hover:text-green-800 text-sm font-medium mr-3"
                         >
                             Edit
                         </Link>
                         <button
                             onClick={handleDelete}
                             className="text-red-600 hover:text-red-800 text-sm font-medium"
                         >
                             Delete
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;