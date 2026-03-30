import { getHomeData } from "@/src/lib/data";
import { HomeContent } from "@/src/components/HomeContent";

export default async function Home() {
  const { homeCms, basics, onlyJoldi, solutions, siteSettings } = await getHomeData();

  return (
    <HomeContent 
      homeCms={homeCms} 
      basics={basics} 
      onlyJoldi={onlyJoldi} 
      solutions={solutions} 
      siteSettings={siteSettings} 
    />
  );
}
