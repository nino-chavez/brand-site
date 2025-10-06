/**
 * Cross-Site Content Crawler
 *
 * Crawls blog.nino.photos and gallery.nino.photos to create searchable embeddings.
 * Enables "find more like this" functionality across all Nino properties.
 *
 * NO CUSTOM MODEL TRAINING NEEDED - uses pre-trained Gemini embeddings.
 *
 * Output: src/data/crossSiteContent.json
 * Runtime cost: $0 (similarity search is client-side)
 *
 * @fileoverview Build-time cross-site content indexer
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';

interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  site: 'blog' | 'gallery';
  embedding: number[];
  tags: string[];
  publishedAt: string;
}

/**
 * Mock crawling for development
 * In production, replace with actual RSS fetching or API calls
 */
function generateMockContent(): Omit<ContentItem, 'embedding'>[] {
  return [
    // Blog posts
    {
      id: 'blog-1',
      title: 'Event-Driven Architecture in Healthcare: Lessons from Production',
      excerpt: 'Building a HIPAA-compliant event-driven system processing 500K+ records per hour. Key lessons on event sourcing, CQRS, and maintaining data consistency in healthcare applications.',
      url: 'https://blog.nino.photos/event-driven-healthcare',
      site: 'blog',
      tags: ['architecture', 'healthcare', 'event-driven', 'cqrs', 'hipaa'],
      publishedAt: '2024-08-15'
    },
    {
      id: 'blog-2',
      title: 'React 19 Performance Optimization: From 8s to 1.2s',
      excerpt: 'Deep dive into optimizing a large React application. Code splitting, lazy loading, memoization strategies, and bundle analysis that reduced load time by 85%.',
      url: 'https://blog.nino.photos/react-performance-optimization',
      site: 'blog',
      tags: ['react', 'performance', 'optimization', 'frontend'],
      publishedAt: '2024-09-22'
    },
    {
      id: 'blog-3',
      title: 'Kubernetes in Production: 5 Lessons After 2 Years',
      excerpt: 'Practical insights from running production Kubernetes clusters. Resource management, deployment strategies, monitoring, and cost optimization for real-world applications.',
      url: 'https://blog.nino.photos/kubernetes-production-lessons',
      site: 'blog',
      tags: ['kubernetes', 'devops', 'production', 'cloud'],
      publishedAt: '2024-07-10'
    },
    {
      id: 'blog-4',
      title: 'Domain-Driven Design: Practical Implementation Guide',
      excerpt: 'Implementing DDD in a microservices architecture. Bounded contexts, aggregates, domain events, and tactical patterns with real code examples.',
      url: 'https://blog.nino.photos/ddd-practical-guide',
      site: 'blog',
      tags: ['ddd', 'architecture', 'microservices', 'design-patterns'],
      publishedAt: '2024-06-05'
    },
    {
      id: 'blog-5',
      title: 'Action Sports Photography: Capturing the Perfect Moment',
      excerpt: 'Techniques for freezing action in extreme sports. Shutter speed decisions, anticipation, composition, and post-processing workflow for professional results.',
      url: 'https://blog.nino.photos/action-sports-photography-guide',
      site: 'blog',
      tags: ['photography', 'action-sports', 'technique', 'tutorial'],
      publishedAt: '2024-10-01'
    },

    // Gallery photos
    {
      id: 'gallery-1',
      title: 'Skydiver Exit - Mountain View DZ',
      excerpt: 'Capturing the decisive moment of a skydiver exiting the aircraft at 14,000 feet. Fast shutter speed (1/2000s) freezes the motion while maintaining sharp focus on the subject.',
      url: 'https://gallery.nino.photos/skydiver-exit-mountain-view',
      site: 'gallery',
      tags: ['skydiving', 'action-sports', 'aerial', 'extreme-sports'],
      publishedAt: '2024-08-20'
    },
    {
      id: 'gallery-2',
      title: 'Mountain Bike Whip - Whistler Bike Park',
      excerpt: 'Professional mountain biker executing a massive whip on Whistler\'s A-Line trail. Shot at 1/1600s to freeze the bike mid-air while showing the rider\'s style and control.',
      url: 'https://gallery.nino.photos/mtb-whip-whistler',
      site: 'gallery',
      tags: ['mountain-biking', 'action-sports', 'whistler', 'trail'],
      publishedAt: '2024-09-10'
    },
    {
      id: 'gallery-3',
      title: 'Canopy Formation - Sunset Jump',
      excerpt: 'Four-way canopy formation at sunset, showcasing the precision and teamwork required in canopy relative work. Golden hour lighting creates dramatic silhouettes.',
      url: 'https://gallery.nino.photos/canopy-formation-sunset',
      site: 'gallery',
      tags: ['skydiving', 'canopy', 'formation', 'sunset'],
      publishedAt: '2024-07-15'
    },
    {
      id: 'gallery-4',
      title: 'Downhill Racing - Crankworx Competition',
      excerpt: 'Elite downhill racer navigating technical rock garden at full speed. Panning technique keeps rider sharp while blurring background, emphasizing speed and intensity.',
      url: 'https://gallery.nino.photos/downhill-racing-crankworx',
      site: 'gallery',
      tags: ['mountain-biking', 'downhill', 'racing', 'crankworx'],
      publishedAt: '2024-08-28'
    },
    {
      id: 'gallery-5',
      title: 'Tandem Freefall - First Jump',
      excerpt: 'Capturing the pure joy of a first-time tandem skydiver in freefall. Wide-angle lens (16mm) shows the scale of the experience and the vastness of the sky.',
      url: 'https://gallery.nino.photos/tandem-freefall-first-jump',
      site: 'gallery',
      tags: ['skydiving', 'tandem', 'freefall', 'first-time'],
      publishedAt: '2024-09-18'
    },
  ];
}

/**
 * Generate mock embedding (deterministic for development)
 */
function generateMockEmbedding(text: string): number[] {
  const embedding: number[] = [];
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }

  const seed = Math.abs(hash);
  let currentSeed = seed;

  for (let i = 0; i < 768; i++) {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    embedding.push((currentSeed / 0x7fffffff) * 2 - 1);
  }

  return embedding;
}

/**
 * Generate cross-site content index
 */
async function generateCrossSiteContent() {
  console.log('🔍 Crawling cross-site content...');

  const mockContent = generateMockContent();

  console.log(`📝 Processing ${mockContent.length} content items`);
  console.log(`   Blog posts: ${mockContent.filter(c => c.site === 'blog').length}`);
  console.log(`   Gallery photos: ${mockContent.filter(c => c.site === 'gallery').length}`);

  // Generate embeddings
  const contentWithEmbeddings: ContentItem[] = mockContent.map((item, index) => {
    const combinedText = `${item.title} ${item.excerpt} ${item.tags.join(' ')}`;
    const embedding = generateMockEmbedding(combinedText);

    if (index % 3 === 0) {
      console.log(`   Progress: ${index + 1}/${mockContent.length}`);
    }

    return {
      ...item,
      embedding
    };
  });

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write to file
  const outputPath = path.join(dataDir, 'crossSiteContent.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(contentWithEmbeddings, null, 2)
  );

  console.log(`✅ Generated cross-site content index`);
  console.log(`📄 Saved to: ${outputPath}`);
  console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

  console.log('\n💡 Note: Using mock data for development');
  console.log('   To crawl real sites:');
  console.log('   1. Implement RSS feed fetching for blog.nino.photos');
  console.log('   2. Create metadata API for gallery.nino.photos');
  console.log('   3. Use Gemini embeddings API for real embeddings');
  console.log('   4. Run: GEMINI_API_KEY=your_key npm run build:cross-site');
}

// Run generator
generateCrossSiteContent();

/*
 * PRODUCTION IMPLEMENTATION (for real crawling):
 *
 * import Parser from 'rss-parser';
 * import { GoogleGenerativeAI } from '@google/generative-ai';
 *
 * const parser = new Parser();
 * const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
 *
 * async function crawlBlog(): Promise<Omit<ContentItem, 'embedding'>[]> {
 *   const feed = await parser.parseURL('https://blog.nino.photos/rss.xml');
 *   return feed.items.map(item => ({
 *     id: item.guid || item.link!,
 *     title: item.title!,
 *     excerpt: item.contentSnippet!,
 *     url: item.link!,
 *     site: 'blog',
 *     tags: item.categories || [],
 *     publishedAt: item.pubDate || new Date().toISOString()
 *   }));
 * }
 *
 * async function crawlGallery(): Promise<Omit<ContentItem, 'embedding'>[]> {
 *   const response = await fetch('https://gallery.nino.photos/api/metadata.json');
 *   const photos = await response.json();
 *   return photos.map((photo: any) => ({
 *     id: photo.id,
 *     title: photo.title,
 *     excerpt: photo.description,
 *     url: `https://gallery.nino.photos/${photo.slug}`,
 *     site: 'gallery',
 *     tags: photo.tags,
 *     publishedAt: photo.publishedAt
 *   }));
 * }
 *
 * async function generateRealEmbedding(text: string): Promise<number[]> {
 *   const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
 *   const result = await model.embedContent(text);
 *   return result.embedding.values;
 * }
 */
