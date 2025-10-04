
import React from 'react';
import Section, { SectionTitle } from './Section';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface AboutSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ setRef }) => {
    const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

    return (
        <Section id="focus" setRef={setRef}>
            <div
                ref={elementRef as React.RefObject<HTMLDivElement>}
                className={`grid lg:grid-cols-5 gap-12 items-center transition-all duration-700 ease-out ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'
                }`}
            >
                <div className="lg:col-span-2">
                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105">
                         <img src="https://picsum.photos/seed/profile/800/800" alt="Nino Chavez" className="w-full h-full object-cover"/>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <SectionTitle>Enterprise Architecture & Technical Leadership</SectionTitle>
                    <p className="text-xl text-gray-400 mb-8">
                        26 years translating business strategy into scalable technical reality—from full-stack development to Fortune 500 enterprise architecture.
                    </p>

                    {/* Professional Timeline */}
                    <div className="mb-10 p-6 bg-gradient-to-r from-brand-violet/10 to-brand-cyan/10 rounded-lg border border-brand-violet/20">
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

                    <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                        <div className="mt-8 mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">What I Do</h3>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-start">
                                    <span className="text-brand-violet mr-3 mt-1">▸</span>
                                    <span>Architect commerce platforms for Fortune 500 clients—SAP Commerce, Salesforce, Adobe, and custom solutions</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-brand-violet mr-3 mt-1">▸</span>
                                    <span>Lead engineering teams (50-100+) through multi-million dollar implementations</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-brand-violet mr-3 mt-1">▸</span>
                                    <span>Translate executive strategy into technical execution</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-brand-violet mr-3 mt-1">▸</span>
                                    <span>Design platforms that adapt as business models evolve</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8 mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">Technical Foundation</h3>
                            <p className="mb-4">
                                26 years across the stack—full-stack development through enterprise architecture. I choose platforms based on adaptability under uncertainty: favor composition over monoliths, data ownership over vendor lock-in, and proven patterns over emerging hype.
                            </p>
                        </div>

                        <div className="mt-8 mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">Current Work</h3>
                            <p>
                                Advising enterprises on AI platform architecture—specifically, how to structure commerce systems so AI capabilities integrate cleanly rather than bolt on awkwardly.
                            </p>
                        </div>

                        <div className="mt-8 mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">Beyond the Code</h3>
                            <p>
                                My action sports photography isn't just a hobby—it's the same discipline applied to a different domain. Capturing a perfect volleyball spike at 1/2000th of a second requires the same precision as designing systems that can't fail under pressure. Both demand knowing exactly where to focus when milliseconds matter.
                            </p>
                        </div>

                        <div className="mt-10 p-6 bg-gray-800 rounded-lg border border-gray-700">
                            <h3 className="text-2xl font-semibold text-white mb-3">Let's Talk</h3>
                            <p className="text-gray-300 mb-4">
                                If you're facing a complex technical transformation, need strategic architecture guidance, or want to discuss how AI can actually deliver value in your organization—let's have a conversation. I respond to all serious inquiries within 48 hours.
                            </p>
                            <a
                                href="#contact"
                                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                            >
                                Schedule a Conversation
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default AboutSection;
