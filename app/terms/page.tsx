import type { Metadata } from 'next';
import { getHomeData } from '@/src/lib/data';
import { TermsContent } from '@/src/components/TermsContent';
import { initialPages } from '@/src/constants';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Joldi.',
};

export default async function TermsPage() {
  const { pages } = await getHomeData();
  const termsOfService = pages.find((p: any) => p.key === 'terms_of_service')?.content || '';
  return <TermsContent termsOfService={termsOfService} />;
}
