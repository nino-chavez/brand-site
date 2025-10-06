
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Section, { SectionTitle } from './Section';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { FEATURES } from '../../config/features';
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants } from '../../lib/motion-variants';
import { ThesisModal, ThesisModalTrigger } from '../ui/ThesisModal';

interface AboutSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ setRef }) => {
    const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
    const [isThesisModalOpen, setIsThesisModalOpen] = useState(false);

    // Use Framer Motion for main app, CSS for demo page
    const GridContainer = FEATURES.FRAMER_MOTION_ENABLED ? motion.div : 'div';
    const gridProps = FEATURES.FRAMER_MOTION_ENABLED
        ? {
            initial: 'hidden',
            whileInView: 'visible',
            viewport: { once: true, amount: 0.1, margin: '0px 0px -100px 0px' },
            variants: staggerContainerVariants,
          }
        : {
            ref: elementRef as React.RefObject<HTMLDivElement>,
            className: `transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'
            }`,
          };

    return (
        <Section id="focus" setRef={setRef}>
            <GridContainer
                {...gridProps}
                className="grid lg:grid-cols-5 gap-12 items-center"
            >
                {/* Profile Image - Animated */}
                {FEATURES.FRAMER_MOTION_ENABLED ? (
                    <motion.div
                        className="lg:col-span-2"
                        variants={staggerItemVariants}
                    >
                        <motion.div
                            className="aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl"
                            whileHover={{
                                scale: 1.05,
                                transition: { type: 'spring', stiffness: 300, damping: 20 }
                            }}
                        >
                            <img src="https://picsum.photos/seed/profile/800/800" alt="Nino Chavez" className="w-full h-full object-cover"/>
                        </motion.div>
                    </motion.div>
                ) : (
                    <div className="lg:col-span-2">
                        <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105">
                            <img src="https://picsum.photos/seed/profile/800/800" alt="Nino Chavez" className="w-full h-full object-cover"/>
                        </div>
                    </div>
                )}

                {/* Content - Animated */}
                {FEATURES.FRAMER_MOTION_ENABLED ? (
                    <motion.div
                        className="lg:col-span-3"
                        variants={staggerItemVariants}
                    >
                    {/* Value Proposition */}
                    <div className="mb-12 pb-8 border-b border-white/10">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/60 mb-6">
                            <span>Enterprise Architecture</span>
                            <span className="text-white/40">|</span>
                            <span>26 Years</span>
                            <span className="text-white/40">|</span>
                            <span>$50B+ Systems</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[0.95] tracking-tight">
                            Systems Thinking Meets Enterprise Reality
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
                            26 years architecting systems that process $50B+ in annual transactions—from individual contributor to architect responsible for $500M+ digital transformations.
                        </p>
                    </div>

                    {/* Professional Timeline */}
                    <div className="mb-16 p-6 bg-gradient-to-r from-brand-violet/5 to-brand-cyan/5 rounded-lg border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Professional Timeline</h3>
                        <div className="space-y-3 text-sm text-gray-300">
                            <div className="flex justify-between items-start border-l-2 border-brand-violet pl-4">
                                <div>
                                    <div className="font-semibold text-white">Enterprise Architect & Strategic Advisor</div>
                                    <div className="text-gray-400">Accenture Song</div>
                                </div>
                                <div className="text-gray-400 text-xs">2023-Present</div>
                            </div>
                            <div className="flex justify-between items-start border-l-2 border-gray-600 pl-4">
                                <div>
                                    <div className="font-semibold text-white">Managing Delivery Architect</div>
                                    <div className="text-gray-400">Capgemini</div>
                                </div>
                                <div className="text-gray-400 text-xs">2021-2023</div>
                            </div>
                            <div className="flex justify-between items-start border-l-2 border-gray-600 pl-4">
                                <div>
                                    <div className="font-semibold text-white">Domain Architect</div>
                                    <div className="text-gray-400">Peapod Digital Labs</div>
                                </div>
                                <div className="text-gray-400 text-xs">2020-2021</div>
                            </div>
                            <div className="flex justify-between items-start border-l-2 border-gray-600 pl-4">
                                <div>
                                    <div className="font-semibold text-white">Managing Enterprise Architect</div>
                                    <div className="text-gray-400">Accenture Interactive</div>
                                </div>
                                <div className="text-gray-400 text-xs">2018-2020</div>
                            </div>
                            <div className="flex justify-between items-start border-l-2 border-gray-600 pl-4">
                                <div>
                                    <div className="font-semibold text-white">Managing Enterprise Architect</div>
                                    <div className="text-gray-400">Gorilla Group</div>
                                </div>
                                <div className="text-gray-400 text-xs">2015-2018</div>
                            </div>
                            <div className="flex justify-between items-start border-l-2 border-gray-500 pl-4">
                                <div>
                                    <div className="font-semibold text-white">Software Engineer & Engineering Lead</div>
                                    <div className="text-gray-400">Various firms</div>
                                </div>
                                <div className="text-gray-400 text-xs">1999-2015</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10 text-lg text-gray-300 leading-[1.75]">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-2xl font-semibold text-white">What I Build</h3>
                                <ThesisModalTrigger onClick={() => setIsThesisModalOpen(true)} />
                            </div>
                            <ul className="space-y-4 text-gray-300 list-none">
                                <li className="flex items-start">
                                    <span className="inline-block w-1.5 h-1.5 bg-violet-400 rounded-full mr-3 mt-2.5 flex-shrink-0"></span>
                                    <span>Multi-tenant commerce platforms processing $2B+ annual GMV for Fortune 500 retailers—architectures that survived 10x Black Friday traffic spikes without service interruption</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block w-1.5 h-1.5 bg-violet-400 rounded-full mr-3 mt-2.5 flex-shrink-0"></span>
                                    <span>Event-driven order orchestration systems replacing 15-year legacy monoliths—migrated 50M active users with zero downtime</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block w-1.5 h-1.5 bg-violet-400 rounded-full mr-3 mt-2.5 flex-shrink-0"></span>
                                    <span>Real-time inventory systems serving 12 brands across 2,000+ stores—enabled same-day delivery without infrastructure cost increases</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block w-1.5 h-1.5 bg-violet-400 rounded-full mr-3 mt-2.5 flex-shrink-0"></span>
                                    <span>AI governance frameworks for regulated commerce platforms—verification boundaries that enforce model reliability before business logic execution</span>
                                </li>
                            </ul>
                        </div>

                        {/* Pull Quote */}
                        <blockquote className="relative my-12 pl-6 border-l-4 border-brand-violet/40">
                            <p className="text-2xl font-light text-white/90 italic leading-relaxed">
                                "I focus on the stage: the entire system of ownership, scope, and second-order effects where ideas must actually live."
                            </p>
                        </blockquote>

                        <div>
                            <h3 className="text-2xl font-semibold text-white mb-6">Technical Foundation</h3>
                            <p className="mb-10">
                                26 years across the stack—full-stack development through enterprise architecture. I choose platforms based on adaptability under uncertainty: favor composition over monoliths, data ownership over vendor lock-in, and proven patterns over emerging hype.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-2xl font-semibold text-white mb-6">Current Work</h3>
                            <p className="mb-10">
                                Building AI governance frameworks for regulated commerce platforms. The core challenge: most organizations bolt AI onto incompatible architectures, creating compliance risk and technical debt. I design verification boundaries that enforce model reliability before business logic execution—governance patterns that make AI production-ready in regulated environments.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-2xl font-semibold text-white mb-6">Beyond the Code</h3>
                            <p className="mb-10">
                                My action sports photography isn't just a hobby—it's the same discipline applied to a different domain. Capturing a perfect volleyball spike at 1/2000th of a second requires the same precision as designing systems that can't fail under pressure. Both demand knowing exactly where to focus when milliseconds matter.
                            </p>
                        </div>

                        <div className="mt-10 p-6 bg-gray-800 rounded-lg border border-gray-700">
                            <h3 className="text-2xl font-semibold text-white mb-3">Architecture Inquiries</h3>
                            <p className="text-gray-300 mb-4">
                                I work with technical leaders who understand that infrastructure decisions compound over time—either as organizational capability or as technical debt. Response time: 24 hours for scoped architecture questions, 48 hours for advisory engagements.
                            </p>
                            <a
                                href="#contact"
                                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                            >
                                Contact
                            </a>
                        </div>
                    </div>
                    </motion.div>
                ) : (
                    <div className="lg:col-span-3">
                    {/* Value Proposition */}
                    <div className="mb-12 pb-8 border-b border-white/10">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/60 mb-6">
                            <span>Enterprise Architecture</span>
                            <span className="text-white/40">|</span>
                            <span>26 Years</span>
                            <span className="text-white/40">|</span>
                            <span>$50B+ Systems</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[0.95] tracking-tight">
                            Systems Thinking Meets Enterprise Reality
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
                            26 years architecting systems that process $50B+ in annual transactions—from individual contributor to architect responsible for $500M+ digital transformations.
                        </p>
                    </div>

            {/* ThesisModal */}
            <ThesisModal
                isOpen={isThesisModalOpen}
                onClose={() => setIsThesisModalOpen(false)}
            />
        </Section>
    );
};

export default AboutSection;
