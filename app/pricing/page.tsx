import type { Metadata } from 'next';
import { getHomeData } from '@/src/lib/data';
import { PricingContent } from '@/src/components/PricingContent';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, predictable pricing for Joldi. Stop paying per-seat for five different tools.',
};

export default async function PricingPage() {
  const { homeCms } = await getHomeData();
  return <PricingContent homeCms={homeCms} />;
}
