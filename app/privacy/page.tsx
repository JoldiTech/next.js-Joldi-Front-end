import type { Metadata } from 'next';
import { getHomeData } from '@/src/lib/data';
import { PrivacyContent } from '@/src/components/PrivacyContent';
import { initialPages } from '@/src/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Joldi.',
};

export default async function PrivacyPage() {
  const { pages } = await getHomeData();
  const privacyPolicy = pages.find((p: any) => p.key === 'privacy_policy')?.content || '';
  return <PrivacyContent privacyPolicy={privacyPolicy} />;
}
