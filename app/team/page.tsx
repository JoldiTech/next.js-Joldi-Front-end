import type { Metadata } from 'next';
import { getHomeData } from '@/src/lib/data';
import { TeamContent } from '@/src/components/TeamContent';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Meet the team behind Joldi.',
};

export default async function TeamPage() {
  const { staff, homeCms, siteSettings } = await getHomeData();
  return <TeamContent team={staff} homeCms={homeCms} siteSettings={siteSettings} />;
}
