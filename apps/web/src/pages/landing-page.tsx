import {
    Calendar,
    ChefHat,
    Clock,
    ShoppingCart,
    Star,
    Users,
} from 'lucide-react';

export type Feature = {
    Icon: (props: { className: string }) => React.ReactElement;
    title: string;
    description: string;
    info: string[];
};

export type Stage = {
    title: string;
    description: string;
};

export const SectionHash = {
    Features: 'features',
    HowItWorks: 'how-it-works',
} as const;

export const features: Feature[] = [
    {
        title: 'Smart Ingredient Tracking',
        description:
            'Keep track of what you have at home with expiry dates, quantities, and smart notifications.',
        Icon: ({ className }) => <ShoppingCart className={className} />,
        info: [
            'Visual ingredient library',
            'Expiry date alerts',
            'Quantity management',
        ],
    },
    {
        title: 'Personalized Recipes',
        description:
            'Create recipes from your available ingredients with AI-powered suggestions and variants.',
        Icon: ({ className }) => <ChefHat className={className} />,
        info: [
            'Recipe creation in under 1 minute',
            'Ingredient substitutions',
            'Step-by-step guidance',
        ],
    },
    {
        title: 'Household Management',
        description:
            'Share ingredients and recipes with family members in organized households.',
        Icon: ({ className }) => <Users className={className} />,
        info: [
            'Multi-user households',
            'Shared ingredient pantry',
            'Family recipe collection',
        ],
    },
    {
        title: 'Meal Planning',
        description:
            'Plan your meals for the week with automatic shopping list generation.',
        Icon: ({ className }) => <Calendar className={className} />,
        info: [
            'Weekly meal plans',
            'Flexible scheduling',
            'Auto shopping lists',
        ],
    },
    {
        title: 'Time-Saving Features',
        description:
            'Streamline your cooking process with smart automation and quick actions.',
        Icon: ({ className }) => <Clock className={className} />,
        info: [
            'Auto ingredient deduction',
            'Quick recipe recreation',
            'Smart notifications',
        ],
    },
    {
        title: 'Recipe Intelligence',
        description:
            'Get cooking insights, difficulty ratings, and dietary information for every recipe.',
        Icon: ({ className }) => <Star className={className} />,
        info: ['Difficulty ratings', 'Cooking time estimates', 'Dietary tags'],
    },
];

export const stages: Stage[] = [
    {
        title: 'Add Your Ingredients',
        description:
            'Quickly catalog what you have at home with photos, quantities, and expiry dates.',
    },
    {
        title: 'Discover Recipes',
        description:
            'Get personalized recipe suggestions based on your available ingredients.',
    },
    {
        title: 'Cook & Enjoy',
        description:
            'Follow step-by-step instructions and let us handle the ingredient tracking.',
    },
];
