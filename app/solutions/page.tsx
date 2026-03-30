import type { Metadata } from 'next';
import { getHomeData } from '@/src/lib/data';
import { Solutions } from '@/src/components/Solutions';

export const metadata: Metadata = {
  title: 'Solutions',
  description: 'Explore Joldi\'s unified modules for Ecommerce, Point of Sale, Helpdesk, HR, Marketing, and Messaging.',
};

export default async function SolutionsPage() {
  const { solutions, homeCms, onlyJoldi, siteSettings } = await getHomeData();
  
  return (
    <Solutions 
      solutions={solutions} 
      homeCms={homeCms} 
      onlyJoldi={onlyJoldi} 
      siteSettings={siteSettings} 
      isHome={false} 
    />
  );
}
