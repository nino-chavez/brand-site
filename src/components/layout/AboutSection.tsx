
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
                    <SectionTitle>Finding the Signal in the Noise</SectionTitle>
                    <p className="text-xl text-gray-400 mb-8">
                        I've architected enterprise systems serving 50M+ users and led 100+ person engineering teams through critical transformations. Excellence comes from knowing where to focus when complexity threatens to overwhelm.
                    </p>

                    <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                        <p>
                            I'm Nino Chavez, an Enterprise Architect and Technical Leader who transforms complex business challenges into elegant, scalable solutions that serve millions of users daily.
                        </p>

                        <p>
                            My approach is simple: I don't delegate the thinking. While others chase the spotlight—the shiny new framework, the trending architecture pattern—I focus on the stage: the entire system of ownership, scope, and second-order effects where ideas must actually live.
                        </p>

                        <div className="mt-8 mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">What I Do</h3>
                            <p className="mb-4">
                                I architect resilient systems that enable people and businesses to thrive. From leading 100+ person engineering teams to migrating Fortune 500 legacy infrastructure to multi-cloud platforms, my value lies in providing clarity when the stakes are high and the path forward isn't obvious.
                            </p>
                            <p className="mb-4">
                                Recent engagements include: Reducing cloud infrastructure costs 40% while improving performance for a Fortune 500 retailer. Designing AI governance frameworks for regulated industries. Migrating legacy monoliths to event-driven architectures without service interruption.
                            </p>
                            <p>
                                My specialty is "reading the road"—identifying patterns others miss and translating complex technical concepts into clear, strategic language that executives can act on. I practice rigorous decision hygiene: understanding the full operational context before making a move, always asking "who checks the foundation?"
                            </p>
                        </div>

                        <div className="mt-8 mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">How I Lead</h3>
                            <p className="mb-4">
                                Leadership, for me, is a quiet, steadying practice. I call it "living in the gap"—holding the long-term vision while remaining present with the team's reality. My goal isn't to micromanage but to be the structure (the "human loom," as I call it) that allows all the other pieces to come together effectively.
                            </p>
                            <p>
                                I coach without coddling. I empower teams with autonomy and clear guardrails. And I arrive not just fast, but together—because sustainable velocity matters more than heroic sprints.
                            </p>
                        </div>

                        <div className="mt-8 mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">My Philosophy on AI</h3>
                            <p>
                                AI is infrastructure, not magic. While others debate whether AI will replace developers, I'm building the governance and architecture patterns that make AI reliable in production. The human role hasn't disappeared—it's evolved from coder to architect, from syntax to systems.
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
