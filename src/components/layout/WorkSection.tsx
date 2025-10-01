
import React, { useRef } from 'react';
import Section, { SectionTitle } from './Section';
import { WORK_PROJECTS } from '../../constants';
import type { WorkProject } from '../../types';

interface WorkSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const ProjectCard: React.FC<{ project: WorkProject }> = ({ project }) => {
    const cardRef = useRef<HTMLDivElement | null>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;

        const { left, top, width, height } = card.getBoundingClientRect();
        const x = e.clientX - left - width / 2;
        const y = e.clientY - top - height / 2;

        const rotateX = (y / height) * -20;
        const rotateY = (x / width) * 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (card) {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        }
    };

    return (
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="block hover-lift">
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="card-base will-change-transform motion-reduce:transform-none"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div className="aspect-video bg-gray-800 rounded-md overflow-hidden mb-4 transition-all duration-300 group-hover:scale-105">
                     <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-gradient-violet">{project.title}</h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                        <span
                            key={tag}
                            className="bg-brand-violet/20 text-brand-violet text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-violet/30 hover:bg-brand-violet/30 hover:border-brand-violet/50 transition-all duration-200"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </a>
    );
};

const WorkSection: React.FC<WorkSectionProps> = ({ setRef }) => {
    return (
        <Section id="work" setRef={setRef}>
            <div>
                <SectionTitle>Featured Work</SectionTitle>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {WORK_PROJECTS.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default WorkSection;
