
import React from 'react';
import Section, { SectionTitle } from './Section';
import { INSIGHTS_ARTICLES } from '../constants';
import type { InsightArticle } from '../types';
import { BlogIcon, LinkedinIcon } from './Icons';

interface InsightsSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const InsightCard: React.FC<{ article: InsightArticle }> = ({ article }) => {
    const PlatformIcon = article.platform === 'Blog' ? BlogIcon : LinkedinIcon;
    return (
        <a href={article.link} target="_blank" rel="noopener noreferrer" className="group block bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700/50 transition-all duration-300 hover:border-brand-violet hover:scale-[1.02]">
            <div className="aspect-video overflow-hidden">
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-6">
                <div className="flex items-center text-sm text-brand-violet mb-2">
                    <PlatformIcon className="w-4 h-4 mr-2" />
                    <span>{article.platform}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-violet transition-colors">{article.title}</h3>
                <p className="text-gray-400 text-sm">{article.excerpt}</p>
            </div>
        </a>
    );
};

const InsightsSection: React.FC<InsightsSectionProps> = ({ setRef }) => {
    return (
        <Section id="insights" setRef={setRef}>
            <div>
                <SectionTitle>Insights & Articles</SectionTitle>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {INSIGHTS_ARTICLES.map((article, index) => (
                        <InsightCard key={index} article={article} />
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default InsightsSection;
