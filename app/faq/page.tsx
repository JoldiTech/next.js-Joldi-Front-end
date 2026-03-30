import type { Metadata } from 'next';
import { getHomeData } from '@/src/lib/data';
import { FAQContent } from '@/src/components/FAQContent';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently Asked Questions about Joldi.',
};

export default async function FAQPage() {
  const { faqs, homeCms } = await getHomeData();
  return <FAQContent faqs={faqs} homeCms={homeCms} />;
}
