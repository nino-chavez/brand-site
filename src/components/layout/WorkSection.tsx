
import React, { useRef, useState } from 'react';
import Section, { SectionTitle } from './Section';
import { WORK_PROJECTS } from '../../constants';
import type { WorkProject } from '../../types';
import { useStaggeredChildren } from '../../hooks/useScrollAnimation';
import ProgressiveImage from '../ui/ProgressiveImage';
import ProjectDetailPanel from '../work/ProjectDetailPanel';

interface WorkSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const ProjectCard: React.FC<{
    project: WorkProject;
    onClick: (project: WorkProject, element: HTMLDivElement) => void;
}> = ({ project, onClick }) => {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

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

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (cardRef.current) {
            // Reset any hover transforms
            cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        }
        // Pass the container element (not the transformed card) for positioning
        if (containerRef.current) {
            onClick(project, containerRef.current);
        }
    };

    return (
        <div ref={containerRef} className="block group cursor-pointer" onClick={handleClick}>
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="card-base card-glow will-change-transform motion-reduce:transform-none relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

                <div className="aspect-video bg-gray-800 rounded-md overflow-hidden mb-4">
                     <ProgressiveImage
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        placeholderBlur={10}
                    />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-gradient-violet">{project.title}</h3>

                {/* Brief description - detail in panel */}
                <p className="text-gray-300 mb-4 text-sm leading-relaxed line-clamp-2">{project.description}</p>

                {/* Tech stack preview - full list in panel */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map(tag => (
                        <span
                            key={tag}
                            className="bg-brand-violet/20 text-brand-violet text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-violet/30 hover:bg-brand-violet/30 hover:border-brand-violet/50 transition-all duration-200"
                        >
                            {tag}
                        </span>
                    ))}
                    {project.tags.length > 3 && (
                        <span className="text-xs text-gray-400 px-2.5 py-1">
                            +{project.tags.length - 3} more
                        </span>
                    )}
                </div>

                {/* View Details button */}
                <div className="mt-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="inline-flex items-center text-violet-400 text-sm font-semibold">
                        View Details
                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
};

const WorkSection: React.FC<WorkSectionProps> = ({ setRef }) => {
    const { containerRef, visibleIndices } = useStaggeredChildren(WORK_PROJECTS.length, 80);
    const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);
    const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

    const handleProjectClick = (project: WorkProject, element: HTMLDivElement) => {
        setSelectedProject(project);
        setTriggerElement(element);
    };

    const handleClosePanel = () => {
        setSelectedProject(null);
        setTriggerElement(null);
    };

    return (
        <Section id="frame" setRef={setRef}>
            <div>
                <SectionTitle>Featured Work</SectionTitle>
                <div
                    ref={containerRef as React.RefObject<HTMLDivElement>}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {WORK_PROJECTS.map((project, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-500 ease-out ${
                                visibleIndices.has(index)
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-8'
                            }`}
                            style={{
                                transitionDelay: `${index * 80}ms`
                            }}
                        >
                            <ProjectCard project={project} onClick={handleProjectClick} />
                        </div>
                    ))}
                </div>

                {/* Detail Panel */}
                <ProjectDetailPanel
                    project={selectedProject}
                    isOpen={!!selectedProject}
                    onClose={handleClosePanel}
                    triggerElement={triggerElement}
                />
            </div>
        </Section>
    );
};

export default WorkSection;
