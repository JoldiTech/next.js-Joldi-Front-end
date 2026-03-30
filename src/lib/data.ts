import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { unstable_cache } from 'next/cache';
import { initialSolutions, initialBasics, initialOnlyJoldi, initialTeam, initialHomeCms, initialPages } from '../constants';

export const getHomeData = unstable_cache(
  async () => {
    try {
      const [staffSnap, homeCmsSnap, solutionsSnap, basicsSnap, onlyJoldiSnap, faqsSnap, pagesSnap, siteSettingsSnap] =
        await Promise.all([
          getDocs(query(collection(db, 'staff'), orderBy('order', 'asc'))),
          getDocs(collection(db, 'home_cms')),
          getDocs(query(collection(db, 'solutions'), orderBy('order', 'asc'))),
          getDocs(query(collection(db, 'basics'), orderBy('order', 'asc'))),
          getDocs(query(collection(db, 'only_joldi'), orderBy('order', 'asc'))),
          getDocs(query(collection(db, 'faqs'), orderBy('order', 'asc'))),
          getDocs(collection(db, 'pages')),
          getDocs(collection(db, 'site_settings')),
        ]);

      const staff = staffSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      const homeCms = homeCmsSnap.docs.map((doc) => {
        const data = doc.data() as any;
        return { id: doc.id, key: data.key || doc.id, ...data };
      });
      const solutions = Array.from(
        new Map(
          solutionsSnap.docs.map((doc) => {
            const data = { ...(doc.data() as any), docId: doc.id };
            return [data.id, data];
          })
        ).values()
      );
      const basics = basicsSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      const onlyJoldi = onlyJoldiSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      const faqs = faqsSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      const pages = pagesSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

      return {
        staff: staff.length > 0 ? staff : initialTeam,
        homeCms: homeCms.length > 0 ? homeCms : initialHomeCms,
        solutions: solutions.length > 0 ? solutions : initialSolutions,
        basics: basics.length > 0 ? basics : initialBasics,
        onlyJoldi: onlyJoldi.length > 0 ? onlyJoldi : initialOnlyJoldi,
        faqs: faqs,
        pages: pages.length > 0 ? pages : initialPages,
        siteSettings: (siteSettingsSnap.docs[0]?.data() as any) ?? {
          quality: 80, format: 'webp', fit: 'cover', position: 'center',
        },
      };
    } catch (err) {
      console.error('Error fetching home data:', err);
      return {
        staff: initialTeam,
        homeCms: initialHomeCms,
        solutions: initialSolutions,
        basics: initialBasics,
        onlyJoldi: initialOnlyJoldi,
        faqs: [],
        pages: initialPages,
        siteSettings: { quality: 80, format: 'webp', fit: 'cover', position: 'center' },
      };
    }
  },
  ['home-data'],
  { revalidate: 3600, tags: ['home-data'] }
);
