export type Article = {
  title: string;
  shortTitle: string;
  url: string;
  source: string;
  publishedAt?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export const articles: Article[] = [
  {
    title: 'How Haptic Feedback Affects Sales, Trust, and Product Perception',
    shortTitle: 'How Haptic Feedback Affects Sales, Trust, and Product Perception',
    url: 'https://swmansion.com/blog/how-haptic-feedback-affects-sales-trust-and-product-perception/',
    source: 'Software Mansion Blog',
    publishedAt: 'May 14, 2026',
    imageUrl: 'https://strapi-production-5f3f.up.railway.app/uploads/BLOGPOST_Haptics_In_Business_24a0d6f4b8.png',
    imageAlt: 'Banner for the article How Haptic Feedback Affects Sales, Trust, and Product Perception',
  },
  {
    title: 'Haptic Feedback Explained: What It Is and What It Does for Your App (and Business)',
    shortTitle: 'What Haptics Does for Your App (and Business)',
    url: 'https://swmansion.com/blog/haptic-feedback-explained-what-it-is-and-what-it-does-for-your-app-and-business/',
    source: 'Software Mansion Blog',
    publishedAt: 'Apr 10, 2026',
    imageUrl: 'https://strapi-production-5f3f.up.railway.app/uploads/Pulsar_medium_full_10bdc5a68c.png',
    imageAlt: 'Banner for the article Haptic Feedback Explained',
  },
  {
    title: 'Haptics Is Music: How to Design Haptic Patterns That Feel Right',
    shortTitle: 'Haptics Is Music',
    url: 'https://swmansion.com/blog/haptics-is-music-how-to-design-haptic-patterns-that-feel-right/',
    source: 'Software Mansion Blog',
    publishedAt: 'Apr 24, 2026',
    imageUrl: 'https://strapi-production-5f3f.up.railway.app/uploads/haptics_is_MUSIC_d1998c5372.png',
    imageAlt: 'Banner for the article Haptics Is Music',
  },
];
