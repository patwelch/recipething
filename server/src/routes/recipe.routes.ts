// src/routes/recipe.routes.ts
import { Router } from 'express';
// Use require if needed for express-validator based on previous experience
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { body, param, query } = require('express-validator');

import { protect } from '../config/passport'; // JWT protection middleware
import {
    createRecipe,
    getUserRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    searchRecipes
} from '../controllers/recipe.controller';

const router = Router();

// --- Validation Middleware ---

// Validation for creating/updating recipes
const recipeValidationRules = [
    body('name').trim().notEmpty().withMessage('Recipe name is required.'),
    body('description').optional().isString(),
    body('imageUrl').optional({ checkFalsy: true }).isURL().withMessage('Image URL must be a valid URL.'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be true or false.'),
    // Validate ingredients array and its objects
    body('ingredients').optional().isArray().withMessage('Ingredients must be an array.'),
    body('ingredients.*.name').notEmpty().withMessage('Ingredient name is required.'),
    body('ingredients.*.measure').notEmpty().withMessage('Ingredient measure is required.'),
    // Validate steps array and its objects
    body('steps').optional().isArray().withMessage('Steps must be an array.'),
    body('steps.*.order').isInt({ min: 1 }).withMessage('Step order must be a positive integer.'),
    body('steps.*.description').notEmpty().withMessage('Step description is required.'),
    // Validate tags array
    body('tags').optional().isArray().withMessage('Tags must be an array.'),
    body('tags.*').isString().notEmpty().withMessage('Tags must be non-empty strings.')
];

// Validation for ID parameter
const idParamValidationRule = [
    param('id').isString().notEmpty().withMessage('Recipe ID is required in URL parameter.')
    // You might add .isUUID() or .isCuid() if using those for IDs
];

// Validation for search query parameters
const searchQueryValidationRules = [
    query('name').optional().isString().trim(),
    query('tags').optional().isString().trim(), // Comma-separated tags
];


// --- Recipe Routes ---

// POST /api/recipes - Create a new recipe
router.post('/',
    protect, // Requires authentication
    recipeValidationRules,
    createRecipe
);

// GET /api/recipes - Get all recipes for the logged-in user
router.get('/',
    protect, // Requires authentication
    getUserRecipes
);

// GET /api/recipes/search - Search recipes for the logged-in user
router.get('/search',
    protect, // Requires authentication
    searchQueryValidationRules,
    searchRecipes
);

// GET /api/recipes/:id - Get a single recipe by ID (handles public/private check)
router.get('/:id',
    protect, // Requires authentication (controller checks ownership/public status)
    idParamValidationRule,
    getRecipeById
);

// PUT /api/recipes/:id - Update a recipe by ID
router.put('/:id',
    protect, // Requires authentication
    idParamValidationRule,
    recipeValidationRules, // Apply same validation as create
    updateRecipe
);

// DELETE /api/recipes/:id - Delete a recipe by ID
router.delete('/:id',
    protect, // Requires authentication
    idParamValidationRule,
    deleteRecipe
);

export default router;