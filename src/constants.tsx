import React from 'react';
import {
  ShoppingCart,
  Headset,
  Users,
  Megaphone,
  MessageSquare,
  Globe2,
  LayoutTemplate
} from 'lucide-react';

export const initialSolutions = [
  {
    id: 'ecommerce',
    title: 'Ecommerce',
    headline: 'Sell online with a beautiful storefront.',
    description: "Build a world-class digital experience. Joldi's ecommerce engine is built for speed and seamless conversion.",
    benefits: [
      'Lightning-fast page loads',
      'Built-in product bundles and upsells',
      'Automated product feeds',
      'Real-time inventory sync'
    ],
    color: 'blue',
    image: 'https://picsum.photos/seed/ecommerce-dash/800/600'
  },
  {
    id: 'pos',
    title: 'Point of Sale',
    headline: 'Sell in-person with a unified register.',
    description: 'Turn any tablet or computer into a retail terminal. Joldi POS talks to your online store in real-time.',
    benefits: [
      'Unified customer profiles',
      'Support for discounts and loyalty',
      'Integrated hardware support',
      'Instant inventory adjustments'
    ],
    color: 'indigo',
    image: 'https://picsum.photos/seed/pos-dash/800/600'
  },
  {
    id: 'helpdesk',
    title: 'Helpdesk',
    headline: 'Never lose a customer message.',
    description: 'Turn chaotic inboxes into a streamlined support machine. Automatically route tickets to the right agent.',
    benefits: [
      'Full customer order history',
      'Automate common responses',
      'Track SLA breaches',
      'Unify all support channels'
    ],
    color: 'emerald',
    image: 'https://picsum.photos/seed/helpdesk-dash/800/600'
  },
  {
    id: 'hr',
    title: 'HR',
    headline: 'Manage your team without the paperwork.',
    description: 'From onboarding to payroll prep, handle the entire employee lifecycle in one system.',
    benefits: [
      'Track time and attendance',
      'Automate onboarding',
      'Generate payroll exports',
      'Manage shift scheduling'
    ],
    color: 'amber',
    image: 'https://picsum.photos/seed/hr-dash/800/600'
  },
  {
    id: 'marketing',
    title: 'Marketing',
    headline: 'Reach your audience automatically.',
    description: 'Trigger campaigns based on real customer behavior. Your marketing tools finally talk to your sales data.',
    benefits: [
      'Behavior-based emails',
      'Automated product feeds',
      'Track true ROI',
      'Drag-and-drop editor'
    ],
    color: 'purple',
    image: 'https://picsum.photos/seed/marketing-dash/800/600'
  },
  {
    id: 'messaging',
    title: 'Messaging',
    headline: 'Keep your team connected.',
    description: 'Context-rich team chat that lives right next to your work. Discuss an order without switching tabs.',
    benefits: [
      'Link chat to records',
      'Advanced threading',
      'Reliable delivery',
      'Reduce context-switching'
    ],
    color: 'blue',
    image: 'https://picsum.photos/seed/chat-dash/800/600'
  }
];

export const initialFaqs = [
  {
    question: "Can I migrate from Shopify or other platforms?",
    answer: "Yes. We offer white-glove migration services for Shopify, WooCommerce, Zendesk, and other major platforms. Our team handles the data export, transformation, and import so you don't lose any history.",
    order: 1
  },
  {
    question: "Is my data isolated from other businesses?",
    answer: "Absolutely. We use enterprise-grade data isolation. Your data is strictly separated at the database level, ensuring that no other tenant can ever access your information.",
    order: 2
  },
  {
    question: "Do I need a developer to set this up?",
    answer: "No. Joldi is designed for business operators. While we offer powerful APIs for developers, the core platform is completely no-code and can be configured entirely through our intuitive dashboard.",
    order: 3
  },
  {
    question: "Can I use just one module, like Helpdesk?",
    answer: "Yes! You can start with the modules you need today and turn on others as your business grows. You only pay for what you use.",
    order: 4
  }
];

export const initialBasics = [
  { feature: "Tech Stack & Cost", oldWay: "Shopify + Zendesk + Slack + Gusto + Mailchimp ($800+/mo)", joldiWay: "One platform, one bill — starting at $199/mo", order: 1 },
  { feature: "User Logins", oldWay: "5 different accounts per employee", joldiWay: "1 secure login for everything", order: 2 }
];

export const initialOnlyJoldi = [
  { title: "Smart Pricing", old: "Your supplier raises costs by 12%. You open a spreadsheet, manually recalculate 400 SKUs, export CSVs, upload to Shopify, and hope you didn't miss one.", new: "You built pricing as formulas: (material cost × markup) + labor. Update the material cost once — every price on every storefront and POS updates automatically.", order: 1 },
  { title: "Multi-Brand from Day One", old: "You sell tea online and posters at a pop-up. On Shopify, that's two separate stores, two subscriptions, and split data.", new: "One account. Two brands. Each gets its own storefront, logo, and POS — but they share inventory, customers, and reporting.", order: 2 },
  { title: "Unified Context", old: "Customer emails support on Zendesk. Agent has no idea they placed a $2,000 order yesterday. Alt-tabs to Shopify, searches by email, copies the order number back.", new: "Agent opens the ticket — order history, lifetime value, and loyalty status are already in the sidebar. Zero copy-paste, zero tab-switching.", order: 3 }
];

export const initialTeam = [
  { name: "David Ross Edwards", role: "Co-Founder", image: "https://picsum.photos/seed/david/400/400", order: 1, email: "david@nmteaco.com", isAdmin: true },
  { name: "Akatoli Zhimo Edwards", role: "Co-Founder", image: "https://picsum.photos/seed/akatoli-professional/400/400", order: 2, email: "akatoli@jolditech.com", isAdmin: true },
  { name: "Ayush Gupta", role: "Founding Engineer", image: "https://picsum.photos/seed/ayush/400/400", order: 3, email: "ayush@jolditech.com", isAdmin: true }
];

export const initialHomeCms = [
  { key: 'hero_tag', value: 'A Unified Business Operating System Suite', title: 'Hero Tag', type: 'text' },
  { key: 'hero_headline', value: 'Run your entire business from <b>one platform</b>.', title: 'Hero Headline', type: 'text' },
  { key: 'hero_subheadline', value: 'Stop juggling six different tools with six different logins. Joldi brings your storefront, helpdesk, team chat, HR, and marketing into one system — with one bill.', title: 'Hero Subheadline', type: 'text' },
  { key: 'hero_image', value: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80', title: 'Hero Image', type: 'image' },
  { key: 'explainer_video', value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Explainer Video', type: 'video' },
  { key: 'solutions_heading', value: 'One platform, every module.', title: 'Solutions Heading', type: 'text' },
  { key: 'solutions_text', value: 'Stop juggling six different tools with six different logins.', title: 'Solutions Text', type: 'text' },
  { key: 'basics_heading', value: 'The Old Way vs. The Joldi Way', title: 'Basics Heading', type: 'text' },
  { key: 'basics_text', value: 'Stop juggling multiple subscriptions and logins.', title: 'Basics Text', type: 'text' },
  { key: 'only_joldi_heading', value: 'Why choose Joldi?', title: 'Only Joldi Heading', type: 'text' },
  { key: 'only_joldi_text', value: 'We built a new way to run your business.', title: 'Only Joldi Text', type: 'text' },
  { key: 'faq_heading', value: 'Frequently Asked Questions', title: 'FAQ Heading', type: 'text' },
  { key: 'faq_text', value: 'Everything you need to know about Joldi.', title: 'FAQ Text', type: 'text' },
  { key: 'cta_heading', value: 'Ready to unify your business?', title: 'CTA Heading', type: 'text' },
  { key: 'cta_text', value: "We'll be onboarding new clients to early access soon. Lock in founding member pricing today by registering your interest.", title: 'CTA Text', type: 'text' },
  { key: 'team_heading', value: 'Meet the Team', title: 'Team Heading', type: 'text' },
  { key: 'team_text', value: 'The people building the future of unified business operations.', title: 'Team Text', type: 'text' },
  { key: 'team_footer_text', value: 'Our team is dedicated to building the future of business operations.', title: 'Team Section Footer Text', type: 'text' }
];

export const initialPages = [
  { key: 'privacy_policy', content: '# Privacy Policy\n\nAt Joldi, we take your privacy seriously...', title: 'Privacy Policy' },
  { key: 'terms_of_service', content: '# Terms of Service\n\nWelcome to Joldi...', title: 'Terms of Service' }
];

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.5 }
};

export const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { staggerChildren: 0.1 }
};

export const getIcon = (id: string) => {
  switch (id) {
    case 'ecommerce': return <Globe2 className="w-5 h-5" />;
    case 'pos': return <ShoppingCart className="w-5 h-5" />;
    case 'helpdesk': return <Headset className="w-5 h-5" />;
    case 'hr': return <Users className="w-5 h-5" />;
    case 'marketing': return <Megaphone className="w-5 h-5" />;
    case 'messaging': return <MessageSquare className="w-5 h-5" />;
    default: return <LayoutTemplate className="w-5 h-5" />;
  }
};
