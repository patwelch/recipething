// src/controllers/recipe.controller.ts
import { Request, Response, NextFunction } from 'express';
//import { validationResult } from 'express-validator'; // Use require if needed
const { validationResult } = require('express-validator');
import prisma from '../db';

// Helper function to handle tag creation/connection
const connectOrCreateTags = async (tagNames: string[] | undefined) => {
    if (!tagNames || tagNames.length === 0) {
        return [];
    }
    // Use Promise.all to handle async operations concurrently
    return Promise.all(
        tagNames.map(async (tagName) => {
            const cleanedTagName = tagName.trim().toLowerCase(); // Normalize tag names
            if (!cleanedTagName) return null; // Skip empty tags

            return prisma.tag.upsert({ // upsert = update or insert
                where: { name: cleanedTagName },
                update: {}, // No update needed if found
                create: { name: cleanedTagName },
            });
        })
    ).then(tags => tags.filter(tag => tag !== null).map(tag => ({ id: tag!.id }))); // Filter out nulls and map to {id: ...} format for connection
};


// --- Create Recipe ---
export const createRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    // Ensure req.user exists (due to 'protect' middleware)
    if (!req.user || !(req.user as any).id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    const { name, description, imageUrl, isPublic, ingredients, steps, tags } = req.body;

    try {
        // Prepare tag data for connection/creation
        const tagConnections = await connectOrCreateTags(tags);

        const recipe = await prisma.recipe.create({
            data: {
                name,
                description,
                imageUrl,
                isPublic: isPublic ?? false, // Default to false if not provided
                userId: (req.user as { id: string }).id, // Associate with the logged-in user
                ingredients: {
                    // Create multiple ingredients linked to this recipe
                    create: ingredients?.map((ing: { name: string, measure: string }) => ({
                        name: ing.name,
                        measure: ing.measure,
                    })) || [], // Handle case where ingredients might be undefined/empty
                },
                steps: {
                    // Create multiple steps linked to this recipe
                    create: steps?.map((step: { order: number, description: string }) => ({
                        order: step.order,
                        description: step.description,
                    })) || [], // Handle case where steps might be undefined/empty
                },
                tags: {
                    // Connect the recipe to existing or newly created tags
                    connect: tagConnections,
                },
            },
            // Include related data in the response
            include: {
                ingredients: true,
                steps: true,
                tags: true,
            }
        });

        res.status(201).json({ data: recipe });

    } catch (error) {
        console.error("Error creating recipe:", error);
        next(error);
    }
};

// --- Get User's Recipes ---
export const getUserRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || !(req.user as any).id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const recipes = await prisma.recipe.findMany({
            where: {
                userId: (req.user as { id: string }).id, // Only fetch recipes belonging to the logged-in user
            },
            orderBy: {
                createdAt: 'desc', // Default sort: newest first
            },
            include: {
                tags: true, // Include tags for card display
                // Optionally include _count for steps/ingredients if needed for cards
                _count: {
                    select: { ingredients: true, steps: true }
                }
            }
            // Add pagination later (using take and skip)
        });
        res.status(200).json({ data: recipes });
    } catch (error) {
        next(error);
    }
};

// --- Get Single Recipe by ID ---
// This needs logic to handle public vs private recipes
export const getRecipeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const recipeId = req.params.id;

    try {
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
                user: { select: { id: true, email: true } }, // Select only non-sensitive user info
                ingredients: { orderBy: { id: 'asc' } }, // Keep consistent order
                steps: { orderBy: { order: 'asc' } }, // Order steps correctly
                tags: true,
            },
        });

        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found' });
            return;
        }

        // Check if recipe is public OR if the requesting user is the owner
        const isOwner = (req.user as { id: string }).id === recipe.userId;
        if (recipe.isPublic || isOwner) {
            res.status(200).json({ data: recipe });
        } else {
            // If private and not owner, deny access
            res.status(403).json({ message: 'Forbidden: You do not have permission to view this recipe' });
        }

    } catch (error) {
        next(error);
    }
};


// --- Update Recipe ---
// Note: Updating nested relations like ingredients/steps can be complex.
// This version replaces all ingredients/steps/tags for simplicity.
export const updateRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const recipeId = req.params.id;
    if (!req.user || !(req.user as any).id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    const userId = (req.user as { id: string }).id;

    const { name, description, imageUrl, isPublic, ingredients, steps, tags } = req.body;

    try {
        // 1. Find the existing recipe first to check ownership
        const existingRecipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!existingRecipe) {
            res.status(404).json({ message: 'Recipe not found' });
            return;
        }

        // 2. Verify ownership
        if (existingRecipe.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You can only update your own recipes' });
            return;
        }

        // 3. Prepare tag data
        const tagConnections = await connectOrCreateTags(tags);

        // 4. Perform the update
        // For simplicity, we delete related items and recreate them.
        // More complex logic could update items in place if needed.
        const updatedRecipe = await prisma.recipe.update({
            where: { id: recipeId },
            data: {
                name,
                description,
                imageUrl,
                isPublic: isPublic ?? existingRecipe.isPublic, // Keep existing value if not provided
                // Disconnect all existing tags, then connect new/updated list
                tags: {
                    set: [], // Disconnect all first
                    connect: tagConnections, // Connect the new set
                },
                // Delete existing ingredients/steps and create new ones based on request body
                ingredients: {
                    deleteMany: {}, // Delete all existing ingredients for this recipe
                    create: ingredients?.map((ing: { name: string, measure: string }) => ({
                        name: ing.name,
                        measure: ing.measure,
                    })) || [],
                },
                steps: {
                    deleteMany: {}, // Delete all existing steps for this recipe
                    create: steps?.map((step: { order: number, description: string }) => ({
                        order: step.order,
                        description: step.description,
                    })) || [],
                },
            },
            include: {
                ingredients: true,
                steps: true,
                tags: true,
            },
        });

        res.status(200).json({ data: updatedRecipe });

    } catch (error) {
        console.error("Error updating recipe:", error);
        next(error);
    }
};


// --- Delete Recipe ---
export const deleteRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const recipeId = req.params.id;
    if (!req.user || !(req.user as any).id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    const userId = (req.user as { id: string }).id;

    try {
         // 1. Find the existing recipe first to check ownership
         const existingRecipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
        });

        if (!existingRecipe) {
            res.status(404).json({ message: 'Recipe not found' });
            return;
        }

        // 2. Verify ownership
        if (existingRecipe.userId !== userId) {
            res.status(403).json({ message: 'Forbidden: You can only delete your own recipes' });
            return;
        }

        // 3. Delete the recipe (relations like ingredients/steps/tags will cascade delete if schema is set up correctly)
        await prisma.recipe.delete({
            where: { id: recipeId },
        });

        res.status(204).send(); // 204 No Content is typical for successful deletion

    } catch (error) {
        next(error);
    }
};


// --- Search Recipes ---
export const searchRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    // Search criteria from query parameters (e.g., /api/recipes/search?name=chicken&tags=quick,dinner)
    const nameQuery = req.query.name as string | undefined;
    const tagsQuery = req.query.tags as string | undefined; // Comma-separated list of tag names

    // Only allow searching user's own recipes for now
    if (!req.user || !(req.user as any).id) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    const userId = (req.user as { id: string }).id;

    // Build the Prisma where clause dynamically
    const whereClause: any = {
        userId: userId, // Filter by logged-in user
    };

    if (nameQuery) {
        whereClause.name = {
            contains: nameQuery,
            mode: 'insensitive', // Case-insensitive search
        };
    }

    if (tagsQuery) {
        const tagNames = tagsQuery.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
        if (tagNames.length > 0) {
            // Find recipes where ALL specified tags are present
            whereClause.tags = {
                every: { // Use 'some' if you want recipes matching ANY of the tags
                    name: {
                        in: tagNames,
                        mode: 'insensitive',
                    }
                }
            };
        }
    }

    try {
        const recipes = await prisma.recipe.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                tags: true,
                 _count: {
                    select: { ingredients: true, steps: true }
                }
            }
        });

        res.status(200).json({ data: recipes });

    } catch (error) {
        next(error);
    }
};