import type { Metadata } from 'next';
import { getHomeData } from '@/src/lib/data';
import { Solutions } from '@/src/components/Solutions';

export async function generateMetadata({ params }: { params: Promise<{ solutionId: string }> }): Promise<Metadata> {
  const { solutionId } = await params;
  const { solutions } = await getHomeData();
  const solution = solutions.find((s: any) => s.id === solutionId);

  return {
    title: solution ? `${solution.title} | Joldi Business OS` : 'Solution | Joldi Business OS',
    description: solution?.description || 'Explore Joldi\'s unified modules.',
  };
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ solutionId: string }> }) {
  const { solutionId } = await params;
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
