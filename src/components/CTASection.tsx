import React from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle2, X } from 'lucide-react';
import { renderParsedHeading, getHomeCmsValue } from '../lib/utils';

const MotionDiv = dynamic(() => import('motion/react').then((mod) => mod.motion.div), { ssr: false });

export const CTASection = ({ formData, handleInputChange, handleSubmit, isSubmitting, isSubmitted, error, homeCms }: any) => {
  const verticals = [
    { id: 'ecommerce', label: 'Ecommerce', competitors: ['Shopify', 'WooCommerce', 'Magento'] },
    { id: 'pos', label: 'Point of Sale', competitors: ['Square', 'Clover', 'Lightspeed'] },
    { id: 'helpdesk', label: 'Helpdesk', competitors: ['Zendesk', 'Freshdesk', 'Intercom'] },
    { id: 'hr', label: 'HR', competitors: ['BambooHR', 'Gusto', 'Workday'] },
    { id: 'marketing', label: 'Marketing', competitors: ['HubSpot', 'Mailchimp', 'Klaviyo'] },
    { id: 'chat', label: 'Team Chat', competitors: ['Slack', 'Microsoft Teams', 'Discord'] },
  ];

  const isFormEmpty = () => {
    const basicFields = [formData.name, formData.email, formData.phone, formData.company, formData.challenge];
    const verticalFields = verticals.map(v => formData[v.id]);
    const otherFields = verticals.filter(v => formData[v.id] === 'Other').map(v => formData[`${v.id}Other`]);
    
    return [...basicFields, ...verticalFields, ...otherFields].every(val => !val || val.trim() === '');
  };

  const isFormPartiallyFilled = () => {
    if (isFormEmpty()) return false;
    return !isFormComplete();
  };

  const isFormComplete = () => {
    const basicFields = [formData.name, formData.email, formData.phone, formData.company, formData.challenge];
    const verticalFields = verticals.map(v => formData[v.id]);
    const otherFields = verticals.filter(v => formData[v.id] === 'Other').map(v => formData[`${v.id}Other`]);

    const allBasicsFilled = basicFields.every(val => val && val.trim() !== '');
    const allVerticalsFilled = verticalFields.every(val => val && val.trim() !== '');
    const allOthersFilled = otherFields.every(val => val && val.trim() !== '');

    return allBasicsFilled && allVerticalsFilled && allOthersFilled;
  };

  const getStatusMessage = () => {
    if (isFormComplete()) return getHomeCmsValue(homeCms, 'signup_fully_filled_msg', '');
    if (isFormPartiallyFilled()) return getHomeCmsValue(homeCms, 'signup_partial_filled_msg', '');
    if (isFormEmpty()) return getHomeCmsValue(homeCms, 'signup_not_filled_msg', '');
    return '';
  };

  const resetOther = (id: string) => {
    handleInputChange({ target: { name: id, value: '' } } as any);
    handleInputChange({ target: { name: `${id}Other`, value: '' } } as any);
  };

  return (
    <section id="cta" className="py-16 px-6 border-t border-zinc-200 dark:border-zinc-800/50 relative overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        {getHomeCmsValue(homeCms, 'cta_tag', 'Limited Spots Available') && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold mb-8 uppercase tracking-wider">
            {renderParsedHeading(getHomeCmsValue(homeCms, 'cta_tag', 'Limited Spots Available'))}
          </div>
        )}
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-zinc-900 dark:text-white leading-tight">
          {renderParsedHeading(getHomeCmsValue(homeCms, 'cta_heading', 'Ready to unify your business?'))}
        </h2>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10">
          {getHomeCmsValue(homeCms, 'cta_text', "We'll be onboarding new clients to early access soon. Lock in founding member pricing today by registering your interest.")}
        </p>
        
        {isSubmitted ? (
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 p-8 rounded-3xl max-w-2xl mx-auto mb-6"
          >
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">{renderParsedHeading("You're on the list!")}</h3>
            <p className="text-lg">Thank you for your interest in Joldi. We&apos;ll reach out to you shortly with next steps for early access.</p>
          </MotionDiv>
        ) : (
          <div className="max-w-4xl mx-auto">
            <form className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-left" onSubmit={handleSubmit}>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-sm">1</span>
                  {renderParsedHeading('Contact Info')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2" suppressHydrationWarning>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    required
                    pattern=".*\S+.*"
                    title="This field cannot be empty or just spaces"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2" suppressHydrationWarning>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Work Email *</label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="john@company.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    required
                    pattern=".*\S+.*"
                    title="This field cannot be empty or just spaces"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2" suppressHydrationWarning>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="+1 (555) 000-0000" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    required
                    pattern=".*\S+.*"
                    title="This field cannot be empty or just spaces"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2" suppressHydrationWarning>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Company Name *</label>
                  <input 
                    type="text" 
                    name="company"
                    placeholder="Acme Inc." 
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    required
                    pattern=".*\S+.*"
                    title="This field cannot be empty or just spaces"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="employees" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Employees</label>
                  <input 
                    id="employees"
                    type="text" 
                    name="employees"
                    placeholder="e.g. 10-50"
                    value={formData.employees}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-sm">2</span>
                  {renderParsedHeading('Current Stack: Help us tailor your onboarding')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {verticals.map((v) => (
                    <div key={v.id} className="space-y-3">
                      <label htmlFor={v.id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">What are you using for {v.label}?</label>
                      <div className="relative">
                        {formData[v.id] === 'Other' ? (
                          <MotionDiv
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                          >
                            <input 
                              id={v.id}
                              type="text" 
                              name={`${v.id}Other`}
                              placeholder={`Specify your ${v.label} solution...`}
                              value={formData[`${v.id}Other`]}
                              onChange={handleInputChange}
                              className="w-full pl-4 pr-12 py-3 rounded-xl border border-blue-500 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                              disabled={isSubmitting}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => resetOther(v.id)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                              title="Back to selection"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </MotionDiv>
                        ) : (
                          <select 
                            id={v.id}
                            name={v.id}
                            value={formData[v.id]}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none"
                            disabled={isSubmitting}
                          >
                            <option value="">Select an option</option>
                            {v.competitors.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="None">None</option>
                            <option value="Other">Other</option>
                          </select>
                        )}
                        {formData[v.id] !== 'Other' && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8 space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-sm">3</span>
                  {renderParsedHeading('Your Biggest Challenge')}
                </h3>
                <textarea 
                  name="challenge"
                  placeholder="What's the #1 thing holding your business back right now?" 
                  value={formData.challenge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[120px] resize-y"
                  disabled={isSubmitting}
                />
              </div>
              
              {getStatusMessage() && (
                <MotionDiv
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl text-sm font-medium text-center ${
                    isFormComplete() 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50' 
                      : isFormPartiallyFilled()
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                        : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isFormComplete() && <CheckCircle2 className="w-4 h-4" />}
                    {renderParsedHeading(getStatusMessage())}
                  </div>
                </MotionDiv>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Request Early Access'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
