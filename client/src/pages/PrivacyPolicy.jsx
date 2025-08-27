import React, { useState, useEffect } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Shield,
    Lock,
    Eye,
    FileText,
    Phone,
    Mail,
    MapPin,
    CheckCircle,
    AlertTriangle,
    Users,
    Heart,
    Database,
    Globe,
    Clock,
    Star,
    Award,
    UserCheck,
    Download,
    RefreshCw,
    Zap,
    Calendar,
    MessageCircle,
    BookOpen,
    Settings
} from 'lucide-react';

const PrivacyPolicy = () => {
    const [expandedSection, setExpandedSection] = useState(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setScrollProgress(progress);
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const downloadPolicy = () => {
        alert('Privacy Policy PDF download will begin shortly');
    };

    const sections = [
        {
            id: 'introduction',
            title: 'Our Commitment to Your Privacy',
            icon: <Heart className="w-5 h-5 text-white" />,
            bgColor: 'bg-cyan-500',
            content: `At Rosheta, we understand that your health information is deeply personal. Our privacy practices are built on trust, transparency, and the highest security standards. We collect and use your data solely to provide you with exceptional healthcare services while keeping your information completely secure and private.`,
            highlights: [
                'Bank-level 256-bit encryption for all data',
                'Your data is never sold or shared for profit',
                'Complete control over your information',
                'Egyptian data protection law compliant'
            ]
        },
        {
            id: 'data-collection',
            title: 'Information We Collect',
            icon: <Database className="w-5 h-5 text-white" />,
            bgColor: 'bg-teal-600',
            content: 'We collect only the information necessary to provide you with quality healthcare services and ensure the best possible user experience.',
            categories: [
                {
                    title: 'Personal Information',
                    icon: <UserCheck className="w-4 h-4" />,
                    items: [
                        'Full name and contact details',
                        'Age, gender, and basic demographics',
                        'Phone number for appointment confirmations',
                        'Email address for secure communications',
                        'Address (optional, for prescription delivery)'
                    ]
                },
                {
                    title: 'Medical Information',
                    icon: <Heart className="w-4 h-4" />,
                    items: [
                        'Medical history and current conditions',
                        'Symptoms and health concerns',
                        'Current medications and allergies',
                        'Test results and medical reports',
                        'Consultation notes and treatment plans'
                    ]
                },
                {
                    title: 'Usage Data',
                    icon: <Eye className="w-4 h-4" />,
                    items: [
                        'App usage patterns and preferences',
                        'Device information for compatibility',
                        'Location data (only when permitted)',
                        'Session data for security purposes'
                    ]
                }
            ]
        },
        {
            id: 'data-usage',
            title: 'How We Use Your Information',
            icon: <Zap className="w-5 h-5 text-white" />,
            bgColor: 'bg-cyan-600',
            content: 'Every piece of data we collect serves a specific purpose in delivering better healthcare services to you.',
            purposes: [
                {
                    title: 'Healthcare Services',
                    description: 'Connecting you with qualified doctors and managing your health journey',
                    icon: <Heart className="w-6 h-6 text-cyan-600" />,
                    examples: ['Doctor-patient matching', 'Appointment scheduling', 'Medical record management', 'Treatment follow-ups']
                },
                {
                    title: 'Platform Security',
                    description: 'Protecting your account and preventing unauthorized access',
                    icon: <Shield className="w-6 h-6 text-cyan-600" />,
                    examples: ['Account verification', 'Fraud prevention', 'Security monitoring', 'Data backup and recovery']
                },
                {
                    title: 'Service Improvement',
                    description: 'Making our platform more user-friendly and efficient',
                    icon: <Star className="w-6 h-6 text-cyan-600" />,
                    examples: ['User experience optimization', 'Feature development', 'Performance enhancement', 'Quality assurance']
                }
            ]
        },
        {
            id: 'data-protection',
            title: 'How We Protect Your Data',
            icon: <Shield className="w-5 h-5 text-white" />,
            bgColor: 'bg-teal-500',
            content: 'Your data security is our top priority. We employ multiple layers of protection to ensure your information remains safe and secure.',
            protections: [
                {
                    title: 'Advanced Encryption',
                    description: '256-bit SSL encryption protects all data transmission and storage',
                    icon: <Lock className="w-8 h-8 text-cyan-500" />
                },
                {
                    title: 'Secure Servers',
                    description: 'Data stored on protected servers with restricted access',
                    icon: <Database className="w-8 h-8 text-cyan-500" />
                },
                {
                    title: 'Access Controls',
                    description: 'Only authorized personnel can access your information',
                    icon: <UserCheck className="w-8 h-8 text-cyan-500" />
                },
                {
                    title: 'Regular Audits',
                    description: 'Continuous security monitoring and regular safety assessments',
                    icon: <Eye className="w-8 h-8 text-cyan-500" />
                }
            ]
        },
        {
            id: 'data-sharing',
            title: 'Data Sharing Policy',
            icon: <Users className="w-5 h-5 text-white" />,
            bgColor: 'bg-cyan-700',
            content: 'We never sell your data to third parties. Information sharing is limited to essential healthcare services and legal requirements only.',
            sharingScenarios: [
                {
                    title: 'Healthcare Providers',
                    description: 'Licensed doctors and medical professionals who provide your care',
                    color: 'border-green-400 bg-green-50',
                    textColor: 'text-green-800',
                    icon: <Heart className="w-5 h-5 text-green-600" />,
                    examples: ['Your chosen doctors on Rosheta', 'Pharmacies for prescription delivery', 'Laboratory partners for test results']
                },
                {
                    title: 'Service Partners',
                    description: 'Trusted partners who help us deliver our services securely',
                    color: 'border-blue-400 bg-blue-50',
                    textColor: 'text-blue-800',
                    icon: <Settings className="w-5 h-5 text-blue-600" />,
                    examples: ['Payment processors', 'SMS service providers', 'Cloud storage partners (with strict agreements)']
                },
                {
                    title: 'Legal Requirements',
                    description: 'Only when required by Egyptian law or emergency situations',
                    color: 'border-orange-400 bg-orange-50',
                    textColor: 'text-orange-800',
                    icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
                    examples: ['Court orders', 'Medical emergencies', 'Public health requirements']
                }
            ]
        },
        {
            id: 'your-rights',
            title: 'Your Privacy Rights',
            icon: <Award className="w-5 h-5 text-white" />,
            bgColor: 'bg-teal-700',
            content: 'You have complete control over your personal information. These rights are yours by law and by our commitment to transparency.',
            rights: [
                {
                    title: 'Access Your Data',
                    description: 'Request a copy of all information we have about you',
                    icon: <Download className="w-5 h-5 text-cyan-600" />,
                    action: 'Download your data anytime from your account settings'
                },
                {
                    title: 'Update Information',
                    description: 'Correct or update your personal and medical information',
                    icon: <RefreshCw className="w-5 h-5 text-cyan-600" />,
                    action: 'Edit your profile and medical history easily'
                },
                {
                    title: 'Delete Your Account',
                    description: 'Request complete deletion of your account and data',
                    icon: <AlertTriangle className="w-5 h-5 text-cyan-600" />,
                    action: 'Contact support for permanent account deletion'
                },
                {
                    title: 'Control Communications',
                    description: 'Choose what notifications and emails you receive',
                    icon: <MessageCircle className="w-5 h-5 text-cyan-600" />,
                    action: 'Manage notification preferences in settings'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-cyan-500 to-teal-600 p-3 rounded-xl">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Pangolin, cursive' }}>
                                    Rosheta Privacy Policy
                                </h1>
                                <p className="text-sm text-gray-600">Your health data, protected & secure</p>
                            </div>
                        </div>
                        <button
                            onClick={downloadPolicy}
                            className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="text-center text-white">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">Trusted by 100,000+ Users in Egypt</span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                            Your Health Privacy,
                            <br />
                            <span className="text-cyan-200">Our Sacred Promise</span>
                        </h1>

                        <p className="text-xl lg:text-2xl text-cyan-100 max-w-4xl mx-auto leading-relaxed mb-12">
                            At Rosheta, we protect your medical information with the highest security standards.
                            Your data is encrypted, secure, and never shared without your explicit permission.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl lg:text-4xl font-bold mb-2">256-bit</div>
                                <div className="text-cyan-200">Bank-level encryption</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl lg:text-4xl font-bold mb-2">24/7</div>
                                <div className="text-cyan-200">Security monitoring</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl lg:text-4xl font-bold mb-2">100%</div>
                                <div className="text-cyan-200">Data ownership by you</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
                <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-300/20 rounded-full blur-2xl animate-pulse delay-1000" />
                <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-teal-400/20 rounded-full blur-xl animate-pulse delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                {/* Trust Indicators */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { icon: Shield, title: "Secure Platform", desc: "Military-grade protection", gradient: "from-cyan-500 to-teal-500" },
                        { icon: Heart, title: "Medical Standards", desc: "Healthcare-grade privacy", gradient: "from-teal-500 to-cyan-600" },
                        { icon: Globe, title: "Local Compliance", desc: "Egyptian law compliant", gradient: "from-cyan-600 to-teal-600" },
                        { icon: Award, title: "User Trust", desc: "5-star security rating", gradient: "from-teal-600 to-cyan-500" }
                    ].map((item, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.gradient} p-3 mb-4`}>
                                <item.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Sections */}
                <div className="space-y-6">
                    {sections.map((section) => (
                        <div key={section.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full px-6 lg:px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 ${section.bgColor} rounded-xl p-3`}>
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{section.title}</h3>
                                        <p className="text-gray-600 text-sm mt-1">Tap to expand details</p>
                                    </div>
                                </div>
                                {expandedSection === section.id ? (
                                    <ChevronUp className="w-6 h-6 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-6 h-6 text-gray-400" />
                                )}
                            </button>

                            {expandedSection === section.id && (
                                <div className="px-6 lg:px-8 pb-8 border-t border-gray-100">
                                    <div className="pt-6">
                                        <p className="text-gray-700 text-lg leading-relaxed mb-6">{section.content}</p>

                                        {section.highlights && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                                {section.highlights.map((highlight, index) => (
                                                    <div key={index} className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg border border-green-200">
                                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                        <span className="text-gray-700">{highlight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {section.categories && (
                                            <div className="space-y-6">
                                                {section.categories.map((category, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                        <div className="flex items-center space-x-3 mb-4">
                                                            <div className="w-8 h-8 bg-cyan-100 rounded-lg p-2">
                                                                {category.icon}
                                                            </div>
                                                            <h4 className="text-xl font-semibold text-gray-900">{category.title}</h4>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {category.items.map((item, itemIndex) => (
                                                                <div key={itemIndex} className="flex items-start space-x-3">
                                                                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                                                                    <span className="text-gray-700">{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {section.purposes && (
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {section.purposes.map((purpose, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                        <div className="text-center mb-4">
                                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                                {purpose.icon}
                                                            </div>
                                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{purpose.title}</h4>
                                                            <p className="text-gray-600 text-sm mb-4">{purpose.description}</p>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {purpose.examples.map((example, exIndex) => (
                                                                <li key={exIndex} className="flex items-start space-x-2">
                                                                    <Star className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-gray-700 text-sm">{example}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {section.protections && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {section.protections.map((protection, index) => (
                                                    <div key={index} className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                            {protection.icon}
                                                        </div>
                                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{protection.title}</h4>
                                                        <p className="text-gray-600 text-sm">{protection.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {section.sharingScenarios && (
                                            <div className="space-y-6">
                                                {section.sharingScenarios.map((scenario, index) => (
                                                    <div key={index} className={`${scenario.color} rounded-xl p-6 border-2`}>
                                                        <div className="flex items-center space-x-3 mb-4">
                                                            <div className="w-10 h-10 bg-white rounded-xl p-2 shadow-sm">
                                                                {scenario.icon}
                                                            </div>
                                                            <div>
                                                                <h4 className={`text-xl font-semibold ${scenario.textColor}`}>{scenario.title}</h4>
                                                                <p className={`${scenario.textColor} opacity-80`}>{scenario.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {scenario.examples.map((example, exIndex) => (
                                                                <div key={exIndex} className="flex items-start space-x-2 bg-white/50 p-3 rounded-lg">
                                                                    <CheckCircle className={`w-4 h-4 ${scenario.textColor} mt-0.5 flex-shrink-0`} />
                                                                    <span className={`${scenario.textColor} text-sm`}>{example}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {section.rights && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {section.rights.map((right, index) => (
                                                    <div key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6">
                                                        <div className="flex items-center space-x-3 mb-4">
                                                            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl p-3">
                                                                {right.icon}
                                                            </div>
                                                            <h4 className="text-lg font-semibold text-gray-900">{right.title}</h4>
                                                        </div>
                                                        <p className="text-gray-600 mb-4">{right.description}</p>
                                                        <div className="bg-cyan-50 border border-cyan-200 p-3 rounded-lg">
                                                            <p className="text-cyan-800 text-sm font-medium">{right.action}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-16 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-8 lg:p-12 text-white">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Have Privacy Questions?</h2>
                        <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
                            Our dedicated privacy team is here to help you understand how we protect your information
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Email Support</h4>
                            <p className="text-cyan-200 mb-2">privacy@rosheta.com</p>
                            <p className="text-sm text-cyan-300">Response within 24 hours</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Phone Support</h4>
                            <p className="text-cyan-200 mb-2">+20 100 123 4567</p>
                            <p className="text-sm text-cyan-300">Available 9 AM - 6 PM</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Live Chat</h4>
                            <p className="text-cyan-200 mb-2">In-app messaging</p>
                            <p className="text-sm text-cyan-300">Real-time support</p>
                        </div>
                    </div>
                </div>

                {/* Consent Section */}
                <div className="mt-16 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-teal-600 p-8 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-bold mb-4">Privacy Acknowledgment</h3>
                        <p className="text-xl text-cyan-100">
                            By using Rosheta, you confirm that you understand and agree to our privacy practices
                        </p>
                    </div>

                    <div className="p-6 lg:p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-6 mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Confirmation:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        "I have read and understand this privacy policy",
                                        "I consent to the collection of my health information",
                                        "I understand my rights regarding my data",
                                        "I agree to the security measures described",
                                        "I know I can withdraw consent at any time",
                                        "I understand how my data may be shared"
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-start space-x-4 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-1 w-6 h-6 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                                    />
                                    <div className="flex-1">
                                        <span className="text-lg font-medium text-gray-900 group-hover:text-cyan-600 transition-colors">
                                            I understand and agree to Rosheta's Privacy Policy
                                        </span>
                                        <p className="text-sm text-gray-600 mt-1">
                                            This includes data collection, usage, sharing, and my rights as described above.
                                        </p>
                                    </div>
                                </label>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-amber-800">
                                            <strong>Note:</strong> You can change your privacy preferences or withdraw consent at any time by contacting our support team.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <button
                                    onClick={() => {
                                        if (acceptedTerms) {
                                            alert('Thank you! Your privacy preferences have been saved. Welcome to Rosheta - where your health data is always protected.');
                                        }
                                    }}
                                    disabled={!acceptedTerms}
                                    className={`px-8 lg:px-12 py-4 rounded-xl font-semibold text-lg transition-all transform ${acceptedTerms
                                        ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:shadow-lg hover:scale-105 shadow-md'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {acceptedTerms ? 'Accept Privacy Policy & Continue' : 'Please read and accept our privacy policy'}
                                </button>

                                {acceptedTerms && (
                                    <p className="text-sm text-gray-600 mt-4">
                                        Your acceptance is securely recorded • Policy version 3.0 • Last updated: January 2025
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Retention Policy */}
                <div className="mt-16 bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">How Long We Keep Your Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                type: 'Medical Records',
                                period: '10 years',
                                color: 'bg-cyan-500',
                                description: 'Required by Egyptian medical regulations',
                                icon: <Heart className="w-5 h-5 text-white" />
                            },
                            {
                                type: 'Account Information',
                                period: '2 years after deletion',
                                color: 'bg-teal-600',
                                description: 'For legal and administrative purposes',
                                icon: <Users className="w-5 h-5 text-white" />
                            },
                            {
                                type: 'Payment Data',
                                period: '5 years',
                                color: 'bg-cyan-600',
                                description: 'Required by financial regulations',
                                icon: <FileText className="w-5 h-5 text-white" />
                            },
                            {
                                type: 'Usage Analytics',
                                period: '1 year',
                                color: 'bg-teal-500',
                                description: 'Anonymous data for improvements',
                                icon: <Eye className="w-5 h-5 text-white" />
                            }
                        ].map((policy, index) => (
                            <div key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className={`w-10 h-10 ${policy.color} rounded-xl p-2`}>
                                        {policy.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{policy.type}</h4>
                                        <div className="text-lg font-bold text-cyan-600">
                                            {policy.period}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">{policy.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Resources */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl p-3">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">Privacy Resources</h3>
                        </div>
                        <ul className="space-y-4">
                            {[
                                { title: "Privacy Summary", desc: "Quick overview in simple terms" },
                                { title: "Your Data Rights Guide", desc: "How to control your information" },
                                { title: "Security Overview", desc: "How we protect your data" },
                                { title: "Cookie Settings", desc: "Manage tracking preferences" },
                                { title: "Contact Privacy Team", desc: "Get help with privacy questions" }
                            ].map((resource, index) => (
                                <li key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <FileText className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900">{resource.title}</div>
                                        <div className="text-sm text-gray-600">{resource.desc}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-3">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">Legal Compliance</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { region: "Egypt", law: "Data Protection Law", status: "Fully Compliant", color: "text-green-600" },
                                { region: "Arab League", law: "Regional Standards", status: "Certified", color: "text-green-600" },
                                { region: "International", law: "GDPR Ready", status: "Prepared", color: "text-blue-600" },
                                { region: "Healthcare", law: "Medical Privacy", status: "Certified", color: "text-green-600" }
                            ].map((compliance, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900">{compliance.region}</div>
                                        <div className="text-sm text-gray-600">{compliance.law}</div>
                                    </div>
                                    <div className={`font-semibold ${compliance.color}`}>
                                        {compliance.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Back to Top Button */}
                {showBackToTop && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <button
                            onClick={scrollToTop}
                            className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
                        >
                            <ChevronUp className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-20 text-center py-12 border-t border-gray-200">
                    <div className="mb-8">
                        <div className="inline-flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full p-2">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Pangolin, cursive' }}>Rosheta</span>
                        </div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Your trusted healthcare platform in Egypt. We're committed to protecting your privacy while providing exceptional medical care.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Last Updated</h4>
                            <p className="text-gray-600">January 15, 2025</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Policy Version</h4>
                            <p className="text-gray-600">3.0</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Next Review</h4>
                            <p className="text-gray-600">July 2025</p>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 space-y-2">
                        <p>© 2025 Rosheta Healthcare Platform. All rights reserved.</p>
                        <p>Protecting health data with the highest security standards in Egypt.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;