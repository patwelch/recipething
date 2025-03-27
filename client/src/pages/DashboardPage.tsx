// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store.ts';
import { fetchUserRecipes, searchUserRecipes } from '../store/slices/recipeSlice.ts';
import RecipeCard from '../components/RecipeCard.tsx'; // Adjust path if needed

const DashboardPage: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { recipes, isLoading, error } = useSelector((state: RootState) => state.recipes);

    // State for search inputs
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTags, setSearchTags] = useState('');

    // Fetch recipes when the component mounts
    useEffect(() => {
        dispatch(fetchUserRecipes());
    }, [dispatch]); // Dependency array includes dispatch

    const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault(); // Prevent form submission page reload
        // Dispatch search action with current terms
        // Backend expects tags as comma-separated string
        dispatch(searchUserRecipes({ name: searchTerm, tags: searchTags }));
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchTags('');
        // Refetch all recipes
        dispatch(fetchUserRecipes());
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Recipes</h1>
                <Link
                    to="/recipes/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    + Create New Recipe
                </Link>
            </div>

             {/* Search Form */}
             <form onSubmit={handleSearch} className="mb-6 p-4 border rounded bg-gray-50 flex flex-col sm:flex-row gap-4 items-center">
                 <div className="flex-grow w-full sm:w-auto">
                     <label htmlFor="searchTerm" className="sr-only">Search by name</label>
                     <input
                         type="text"
                         id="searchTerm"
                         placeholder="Search by name..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     />
                 </div>
                  <div className="flex-grow w-full sm:w-auto">
                     <label htmlFor="searchTags" className="sr-only">Search by tags</label>
                     <input
                         type="text"
                         id="searchTags"
                         placeholder="Search by tags (comma-separated)..."
                         value={searchTags}
                         onChange={(e) => setSearchTags(e.target.value)}
                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     />
                 </div>
                 <div className="flex gap-2 w-full sm:w-auto">
                     <button
                         type="submit"
                         disabled={isLoading}
                         className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                     >
                         Search
                     </button>
                     <button
                         type="button"
                         onClick={handleClearSearch}
                         disabled={isLoading}
                         className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
                     >
                         Clear
                     </button>
                 </div>
             </form>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-10">
                    <p>Loading recipes...</p>
                    {/* Add a spinner animation here later */}
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="text-center py-10 text-red-600 bg-red-100 p-4 rounded border border-red-400">
                    <p>Error loading recipes: {error}</p>
                    <button
                         onClick={() => dispatch(fetchUserRecipes())} // Allow retry
                         className="mt-2 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                     >
                         Retry
                     </button>
                </div>
            )}

            {/* Recipe List */}
            {!isLoading && !error && recipes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}

            {/* No Recipes State */}
            {!isLoading && !error && recipes.length === 0 && (
                 <div className="text-center py-10 text-gray-500">
                     <p>You haven't created any recipes yet.</p>
                     <Link
                         to="/recipes/new"
                         className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-medium"
                     >
                         Create your first recipe!
                     </Link>
                 </div>
            )}
        </div>
    );
};

export default DashboardPage;