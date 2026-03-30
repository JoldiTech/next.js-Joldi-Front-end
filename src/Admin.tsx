'use client';


import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage, auth } from './firebase';
import { collection, getDocs, getDoc, query, orderBy, doc, setDoc, deleteDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { Users, Image as ImageIcon, List, LayoutTemplate, Plus, Trash2, Upload, Zap, MessageSquare, Menu, X, Layers, Edit, Play, Mail, LayoutGrid } from 'lucide-react';
import { OperationType, handleFirestoreError, getOptimizedImageUrl, renderParsedHeading } from './lib/utils';
import { initialBasics, initialOnlyJoldi, initialFaqs, initialTeam, initialHomeCms, initialPages, initialSolutions } from './constants';


export default function Admin({ user }: { user: any }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'leads' | 'team' | 'home_cms' | 'solutions' | 'basics' | 'only_joldi' | 'faqs' | 'cta' | 'thumbnails' | 'pages'>('home_cms');
  
  const [leads, setLeads] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [homeCms, setHomeCms] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [basics, setBasics] = useState<any[]>([]);
  const [onlyJoldi, setOnlyJoldi] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [cacheInfo, setCacheInfo] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({ quality: 80, format: 'webp', fit: 'cover', position: 'center' });
  const [sitePhotos, setSitePhotos] = useState<any>({});

  // Editing states
  const [editingTeamMember, setEditingTeamMember] = useState<any | null>(null);
  const [editingHomeCms, setEditingHomeCms] = useState<any | null>(null);
  const [editingSolution, setEditingSolution] = useState<any | null>(null);
  const [editingBasics, setEditingBasics] = useState<any | null>(null);
  const [editingOnlyJoldi, setEditingOnlyJoldi] = useState<any | null>(null);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const invalidateDataCache = async () => {
    try {
      await fetch('/api/revalidate', { method: 'POST' });
    } catch (err) {
      console.error('Error invalidating cache:', err);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/images/clear-cache', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to clear cache');
      setSuccess('Cache cleared successfully');
      setCacheInfo([]);
    } catch (err: any) {
      console.error('Error clearing cache:', err);
      setError('Failed to clear cache: ' + (err.message || String(err)));
    } finally {
      setIsClearingCache(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'thumbnails') {
      fetch('/api/images/cache-info')
        .then(res => res.json())
        .then(data => setCacheInfo(data))
        .catch(err => console.error('Error fetching cache info:', err));
    }
  }, [activeTab]);
    
  const fetchData = async () => {
    if (dataLoading) return;
    setDataLoading(true);
    try {
      setError('');
      
      let leadsSnap, teamSnap, homeCmsSnap, solutionsSnap, basicsSnap, onlyJoldiSnap, faqsSnap, siteSettingsSnap, pagesSnap;

      try { leadsSnap = await getDocs(query(collection(db, 'leads'), orderBy('createdAt', 'desc'))); } catch (e: any) { console.error("Error fetching leads:", e); throw new Error("Failed to fetch leads: " + e.message); }
      try { teamSnap = await getDocs(query(collection(db, 'staff'), orderBy('order', 'asc'))); } catch (e: any) { console.error("Error fetching staff:", e); throw new Error("Failed to fetch staff: " + e.message); }
      try { homeCmsSnap = await getDocs(collection(db, 'home_cms')); } catch (e: any) { console.error("Error fetching home_cms:", e); throw new Error("Failed to fetch home_cms: " + e.message); }
      try { solutionsSnap = await getDocs(query(collection(db, 'solutions'), orderBy('order', 'asc'))); } catch (e: any) { console.error("Error fetching solutions:", e); throw new Error("Failed to fetch solutions: " + e.message); }
      try { basicsSnap = await getDocs(query(collection(db, 'basics'), orderBy('order', 'asc'))); } catch (e: any) { console.error("Error fetching basics:", e); throw new Error("Failed to fetch basics: " + e.message); }
      try { onlyJoldiSnap = await getDocs(query(collection(db, 'only_joldi'), orderBy('order', 'asc'))); } catch (e: any) { console.error("Error fetching only_joldi:", e); throw new Error("Failed to fetch only_joldi: " + e.message); }
      try { faqsSnap = await getDocs(query(collection(db, 'faqs'), orderBy('order', 'asc'))); } catch (e: any) { console.error("Error fetching faqs:", e); throw new Error("Failed to fetch faqs: " + e.message); }
      try { siteSettingsSnap = await getDocs(collection(db, 'site_settings')); } catch (e: any) { console.error("Error fetching site_settings:", e); throw new Error("Failed to fetch site_settings: " + e.message); }
      try { pagesSnap = await getDocs(collection(db, 'pages')); } catch (e: any) { console.error("Error fetching pages:", e); throw new Error("Failed to fetch pages: " + e.message); }

      setLeads(leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTeam(teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPages(pagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const data = homeCmsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const orderMap: Record<string, number> = {
        'hero_tag': 1,
        'hero_headline': 2,
        'hero_subheadline': 3,
        'hero_image': 4,
        'explainer_video': 5,
        'solutions_heading': 6,
        'solutions_text': 7,
        'basics_heading': 8,
        'basics_text': 9,
        'only_joldi_heading': 10,
        'only_joldi_text': 11,
        'faq_heading': 12,
        'faq_text': 13,
        'cta_heading': 14,
        'cta_text': 15,
        'team_heading': 16,
        'team_text': 17,
        'team_footer_text': 18
      };
      data.sort((a: any, b: any) => {
        const orderA = a.order !== undefined ? Number(a.order) : (orderMap[a.key] || 99);
        const orderB = b.order !== undefined ? Number(b.order) : (orderMap[b.key] || 99);
        return orderA - orderB;
      });
      setHomeCms(data);
      
      setSolutions(solutionsSnap.docs.map(doc => ({ ...doc.data(), docId: doc.id })));
      setBasics(basicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setOnlyJoldi(onlyJoldiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFaqs(faqsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      if (siteSettingsSnap.docs.length > 0) {
        setSiteSettings(siteSettingsSnap.docs[0].data());
      }
      runMigrations();
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || String(err));
      handleFirestoreError(err, OperationType.GET, 'multiple collections');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleLocalClick = (e: MouseEvent) => {
      // Avoid logging the full target object which can cause circularity issues in some environments
    };
    window.addEventListener('click', handleLocalClick, true);

    // Global error handler for debugging
    const handleError = (event: ErrorEvent) => {
      console.error('Global client-side error caught in Admin:', event.error);
      setError('A client-side error occurred: ' + event.message);
    };
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('click', handleLocalClick, true);
    };
  }, []);

  const runMigrations = async () => {
    try {
      // Fetch Home CMS for migration
      const homeCmsSnap = await getDocs(collection(db, 'home_cms'));
      const homeCmsData = homeCmsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Migration: features_heading -> solutions_heading, features_text -> solutions_text
      const featuresHeading = homeCmsData.find(d => d.key === 'features_heading');
      const featuresText = homeCmsData.find(d => d.key === 'features_text');
      
      if (featuresHeading && !homeCmsData.find(d => d.key === 'solutions_heading')) {
        try {
          await addDoc(collection(db, 'home_cms'), { 
            key: 'solutions_heading', 
            value: featuresHeading.value || '', 
            type: featuresHeading.type || 'text', 
            title: 'Solutions Heading',
            order: 6 
          });
          await deleteDoc(doc(db, 'home_cms', featuresHeading.id));
        } catch (e) { console.error("Error migrating features_heading:", e); throw e; }
      }
      
      if (featuresText && !homeCmsData.find(d => d.key === 'solutions_text')) {
        try {
          await addDoc(collection(db, 'home_cms'), { 
            key: 'solutions_text', 
            value: featuresText.value || '', 
            type: featuresText.type || 'text', 
            title: 'Solutions Text',
            order: 7 
          });
          await deleteDoc(doc(db, 'home_cms', featuresText.id));
        } catch (e) { console.error("Error migrating features_text:", e); throw e; }
      }

      // Check for missing keys
      for (const item of initialHomeCms) {
        if (!homeCmsData.find(d => d.key === item.key)) {
          try {
            await addDoc(collection(db, 'home_cms'), item);
          } catch (e) { console.error("Error adding home_cms item:", item.key, e); throw e; }
        }
      }

      // Migration: features collection -> solutions collection
      const solutionsSnap = await getDocs(collection(db, 'solutions'));
      if (solutionsSnap.empty) {
        const featuresSnap = await getDocs(collection(db, 'features'));
        if (!featuresSnap.empty) {
          let orderCounter = 1;
          for (const featureDoc of featuresSnap.docs) {
            try {
              const data = featureDoc.data();
              await setDoc(doc(db, 'solutions', featureDoc.id), { 
                ...data, 
                id: data.id || featureDoc.id,
                title: data.title || 'Untitled',
                headline: data.headline || 'No headline',
                description: data.description || 'No description',
                color: data.color || 'blue',
                image: data.image || 'https://picsum.photos/seed/placeholder/800/600',
                order: data.order || orderCounter++,
                benefits: data.benefits || []
              });
              await deleteDoc(doc(db, 'features', featureDoc.id));
            } catch (e) { console.error("Error migrating feature to solution:", featureDoc.id, e); throw e; }
          }
        }
      }

      // Seed initial data if collections are empty
      const teamSnap = await getDocs(collection(db, 'staff'));
      if (teamSnap.empty) {
        for (const member of initialTeam) {
          try {
            await addDoc(collection(db, 'staff'), member);
          } catch (e) { console.error("Error adding team member:", member.name, e); throw e; }
        }
      }

      const basicsSnap = await getDocs(collection(db, 'basics'));
      if (basicsSnap.empty) {
        for (let i = 0; i < initialBasics.length; i++) {
          try {
            await setDoc(doc(db, 'basics', `basic-${i}`), initialBasics[i]);
          } catch (e) { console.error("Error adding basic:", i, e); throw e; }
        }
      }

      const onlyJoldiSnap = await getDocs(collection(db, 'only_joldi'));
      if (onlyJoldiSnap.empty) {
        for (let i = 0; i < initialOnlyJoldi.length; i++) {
          try {
            await setDoc(doc(db, 'only_joldi', `only-joldi-${i}`), initialOnlyJoldi[i]);
          } catch (e) { console.error("Error adding only_joldi:", i, e); throw e; }
        }
      }

      const faqsSnap = await getDocs(collection(db, 'faqs'));
      if (faqsSnap.empty) {
        for (let i = 0; i < initialFaqs.length; i++) {
          try {
            await setDoc(doc(db, 'faqs', `faq-${i}`), initialFaqs[i]);
          } catch (e) { console.error("Error adding faq:", i, e); throw e; }
        }
      }

      // Migration: legal pages from home_cms to pages
      const pagesSnap = await getDocs(collection(db, 'pages'));
      const pagesData = pagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      const privacyInHome = homeCmsData.find(d => d.key === 'privacy_policy');
      const termsInHome = homeCmsData.find(d => d.key === 'terms_of_service');

      if (privacyInHome && !pagesData.find(d => d.key === 'privacy_policy')) {
        try {
          await addDoc(collection(db, 'pages'), {
            key: 'privacy_policy',
            title: 'Privacy Policy',
            content: privacyInHome.value
          });
          await deleteDoc(doc(db, 'home_cms', privacyInHome.id));
        } catch (e) { console.error("Error migrating privacy_policy:", e); }
      }

      if (termsInHome && !pagesData.find(d => d.key === 'terms_of_service')) {
        try {
          await addDoc(collection(db, 'pages'), {
            key: 'terms_of_service',
            title: 'Terms of Service',
            content: termsInHome.value
          });
          await deleteDoc(doc(db, 'home_cms', termsInHome.id));
        } catch (e) { console.error("Error migrating terms_of_service:", e); }
      }

      // Seed initial pages if empty
      if (pagesSnap.empty && !privacyInHome && !termsInHome) {
        for (const page of initialPages) {
          try {
            await addDoc(collection(db, 'pages'), page);
          } catch (e) { console.error("Error seeding page:", page.key, e); }
        }
      }

      // Refresh data after migrations
      await fetchData();

    } catch (err) {
      console.error("Error during migrations/seeding:", err);
      handleFirestoreError(err, OperationType.WRITE, 'migrations');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      callback(url);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Team Management
  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !editingTeamMember) return;
    setIsSaving(true);
    try {
      const teamMemberData = {
        name: editingTeamMember.name,
        role: editingTeamMember.role,
        image: editingTeamMember.image,
        bio: editingTeamMember.bio || '',
        order: Number(editingTeamMember.order),
        email: editingTeamMember.email || '',
        isAdmin: !!editingTeamMember.isAdmin
      };

      if (editingTeamMember.id) {
        // Check if email changed to clean up old user doc
        const oldTeamMemberDoc = await getDoc(doc(db, 'staff', editingTeamMember.id));
        if (oldTeamMemberDoc.exists()) {
          const oldData = oldTeamMemberDoc.data();
          if (oldData.email && oldData.email.toLowerCase() !== teamMemberData.email.toLowerCase()) {
            await deleteDoc(doc(db, 'users', oldData.email.toLowerCase()));
          }
        }
        await setDoc(doc(db, 'staff', editingTeamMember.id), teamMemberData);
      } else {
        await addDoc(collection(db, 'staff'), teamMemberData);
      }

      // Sync to users collection for rules lookup
      if (teamMemberData.email) {
        const userDocId = teamMemberData.email.toLowerCase();
        await setDoc(doc(db, 'users', userDocId), {
          email: teamMemberData.email.toLowerCase(),
          isAdmin: teamMemberData.isAdmin,
          name: teamMemberData.name,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      setEditingTeamMember(null);
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'staff');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!id) return;
    try {
      const teamMemberDoc = await getDoc(doc(db, 'staff', id));
      if (teamMemberDoc.exists()) {
        const data = teamMemberDoc.data();
        if (data.email) {
          await deleteDoc(doc(db, 'users', data.email.toLowerCase()));
        }
      }
      await deleteDoc(doc(db, 'staff', id));
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, 'staff');
    }
  };

  // Home CMS Management
  const handleSaveHomeCms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const homeCmsData: any = {
        key: editingHomeCms.key,
        value: editingHomeCms.value,
        type: editingHomeCms.type,
        title: editingHomeCms.title
      };
      if (editingHomeCms.order !== undefined && editingHomeCms.order !== '') {
        homeCmsData.order = Number(editingHomeCms.order);
      }

      const docId = editingHomeCms.id || editingHomeCms.docId;
      if (docId) {
        await setDoc(doc(db, 'home_cms', docId), homeCmsData);
      } else {
        await addDoc(collection(db, 'home_cms'), homeCmsData);
      }
      setEditingHomeCms(null);
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'home_cms');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHomeCms = async (id: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'home_cms', id));
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, 'home_cms');
    }
  };

  // Solution Management
  const handleSaveSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const solutionData: any = {
        id: editingSolution.id,
        title: editingSolution.title,
        headline: editingSolution.headline,
        description: editingSolution.description,
        benefits: editingSolution.benefits,
        color: editingSolution.color,
        image: editingSolution.image,
        pageContent: editingSolution.pageContent || '',
        order: Number(editingSolution.order)
      };

      // Only include quote if it has at least one non-empty field
      if (editingSolution.quote && Object.values(editingSolution.quote).some(v => v !== '')) {
        solutionData.quote = editingSolution.quote;
      }

      if (editingSolution.docId) {
        await setDoc(doc(db, 'solutions', editingSolution.docId), solutionData);
      } else {
        // Use the id field as document ID to prevent duplicates if user uses same slug
        const docId = solutionData.id || `solution-${Date.now()}`;
        await setDoc(doc(db, 'solutions', docId), solutionData);
      }
      setEditingSolution(null);
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      setError('Failed to save solution.');
      handleFirestoreError(err, OperationType.WRITE, 'solutions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSolution = async (id: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'solutions', id));
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, 'solutions');
    }
  };

  // Basics Management
  const handleSaveBasics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingBasics.id) {
        await setDoc(doc(db, 'basics', editingBasics.id), {
          feature: editingBasics.feature,
          oldWay: editingBasics.oldWay,
          joldiWay: editingBasics.joldiWay,
          order: Number(editingBasics.order)
        });
      } else {
        await addDoc(collection(db, 'basics'), {
          feature: editingBasics.feature,
          oldWay: editingBasics.oldWay,
          joldiWay: editingBasics.joldiWay,
          order: Number(editingBasics.order)
        });
      }
      setEditingBasics(null);
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'basics');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBasics = async (id: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'basics', id));
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, 'basics');
    }
  };

  // Only Joldi Management
  const handleSaveOnlyJoldi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingOnlyJoldi.id) {
        await setDoc(doc(db, 'only_joldi', editingOnlyJoldi.id), {
          title: editingOnlyJoldi.title,
          old: editingOnlyJoldi.old,
          new: editingOnlyJoldi.new,
          solutionId: editingOnlyJoldi.solutionId,
          order: Number(editingOnlyJoldi.order)
        });
      } else {
        await addDoc(collection(db, 'only_joldi'), {
          title: editingOnlyJoldi.title,
          old: editingOnlyJoldi.old,
          new: editingOnlyJoldi.new,
          solutionId: editingOnlyJoldi.solutionId,
          order: Number(editingOnlyJoldi.order)
        });
      }
      setEditingOnlyJoldi(null);
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'only_joldi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOnlyJoldi = async (id: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'only_joldi', id));
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, 'only_joldi');
    }
  };

  // FAQ Management
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingFaq.id) {
        await setDoc(doc(db, 'faqs', editingFaq.id), {
          question: editingFaq.question,
          answer: editingFaq.answer,
          order: Number(editingFaq.order)
        });
      } else {
        await addDoc(collection(db, 'faqs'), {
          question: editingFaq.question,
          answer: editingFaq.answer,
          order: Number(editingFaq.order)
        });
      }
      setEditingFaq(null);
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'faqs');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'faqs', id));
      await fetchData();
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, 'faqs');
    }
  };

  const handleSaveSectionHeader = async (item: any, newValue: string) => {
    try {
      const docId = item.id || item.docId;
      const { id, ...data } = item;
      const updatedData = { ...data, value: newValue };
      await setDoc(doc(db, 'home_cms', docId), updatedData);
      const newHomeCms = homeCms.map(i => (i.id === docId || i.docId === docId) ? { ...i, value: newValue } : i);
      setHomeCms(newHomeCms);
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'home_cms');
    }
  };

  const handleSavePage = async (page: any, newContent: string) => {
    try {
      const docId = page.id || page.docId;
      const { id, ...data } = page;
      const updatedData = { ...data, content: newContent };
      await setDoc(doc(db, 'pages', docId), updatedData);
      const newPages = pages.map(p => (p.id === docId || p.docId === docId) ? { ...p, content: newContent } : p);
      setPages(newPages);
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'pages');
    }
  };

  const handleSaveCmsValue = async (key: string, value: string, title: string) => {
    try {
      const item = homeCms.find(i => i.key === key);
      if (item) {
        const docId = item.id || item.docId;
        const { id, ...data } = item;
        const updatedData = { ...data, value };
        await setDoc(doc(db, 'home_cms', docId), updatedData);
        setHomeCms(homeCms.map(i => (i.id === docId || i.docId === docId) ? { ...i, value } : i));
      } else {
        const newItem = {
          key,
          value,
          title,
          type: 'text',
          order: 100
        };
        const docRef = await addDoc(collection(db, 'home_cms'), newItem);
        setHomeCms([...homeCms, { id: docRef.id, ...newItem }]);
      }
      await invalidateDataCache();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'home_cms');
    }
  };

    const renderSectionHeaderEditor = (headingKey: string, textKey: string, sectionName: string) => {
    const headingItem = homeCms.find(item => item.key === headingKey);
    const textItem = homeCms.find(item => item.key === textKey);

    if (!headingItem || !textItem) {
      return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-6">
          <h3 className="font-bold text-lg">{sectionName} Header</h3>
          <p className="text-sm text-zinc-500">Header settings not found. They will be created automatically during the next migration or you can refresh the page.</p>
          <button 
            onClick={async () => {
              const missingKeys = [];
              if (!headingItem) missingKeys.push(initialHomeCms.find(i => i.key === headingKey));
              if (!textItem) missingKeys.push(initialHomeCms.find(i => i.key === textKey));
              
              for (const item of missingKeys) {
                if (item) {
                  await addDoc(collection(db, 'home_cms'), item);
                }
              }
              fetchData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Create Header Settings
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-6">
        <h3 className="font-bold text-lg">{sectionName} Header</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Heading</label>
            <input
              type="text"
              defaultValue={headingItem.value}
              onBlur={(e) => {
                if (e.target.value !== headingItem.value) {
                  handleSaveSectionHeader(headingItem, e.target.value);
                }
              }}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Text</label>
            <textarea
              defaultValue={textItem.value}
              onBlur={(e) => {
                if (e.target.value !== textItem.value) {
                  handleSaveSectionHeader(textItem, e.target.value);
                }
              }}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none resize-none h-24"
            />
          </div>
        </div>
      </div>
    );
  };

  if (dataLoading && homeCms.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white p-6">
        {error ? (
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <X className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold">Data Fetch Error</h2>
            <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
            <button
              onClick={() => fetchData()}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium animate-pulse">Loading dashboard data...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            Joldi Admin
          </div>
          <button 
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {[
            { id: 'home_cms', icon: <ImageIcon className="w-5 h-5" />, label: 'Home CMS' },
            { id: 'solutions', icon: <LayoutTemplate className="w-5 h-5" />, label: 'Solutions' },
            { id: 'basics', icon: <List className="w-5 h-5" />, label: 'Basics' },
            { id: 'only_joldi', icon: <Zap className="w-5 h-5" />, label: 'Only Joldi' },
            { id: 'faqs', icon: <MessageSquare className="w-5 h-5" />, label: 'FAQ' },
            { id: 'cta', icon: <Mail className="w-5 h-5" />, label: 'Mailing List / CTA' },
            { id: 'pages', icon: <LayoutTemplate className="w-5 h-5" />, label: 'Pages CMS' },
            { id: 'leads', icon: <List className="w-5 h-5" />, label: 'Leads' },
            { id: 'team', icon: <Users className="w-5 h-5" />, label: 'Team' },
            { id: 'thumbnails', icon: <ImageIcon className="w-5 h-5" />, label: 'Thumbnails' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
              {user?.photoURL ? (
                <img 
                  src={getOptimizedImageUrl(user.photoURL || '', 64, 64, siteSettings)} 
                  alt={user.displayName || 'User'} 
                  className="w-full h-full" 
                  style={{ 
                    objectFit: (siteSettings?.fit || 'cover') as any, 
                    objectPosition: siteSettings?.position || 'center' 
                  }}
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <span className="text-zinc-600 dark:text-zinc-400 font-bold">{(user?.email?.[0] || 'U').toUpperCase()}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName || 'Admin'}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await signOut(auth);
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
              } catch (err) {
                console.error('Logout failed:', err);
                router.push('/login');
              }
            }}
            className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Layers className="w-3 h-3 text-white" />
            </div>
            Joldi
          </div>
          <button 
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="hidden md:flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold capitalize">{activeTab.replace('_', ' ')}</h1>
              <button
                onClick={async () => {
                  setIsClearingCache(true);
                  try {
                    await invalidateDataCache();
                    setSuccess('Site published successfully! Changes should be visible now.');
                    setTimeout(() => setSuccess(''), 5000);
                  } catch (err) {
                    setError('Failed to publish changes.');
                  } finally {
                    setIsClearingCache(false);
                  }
                }}
                disabled={isClearingCache}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                <Zap className={`w-5 h-5 ${isClearingCache ? 'animate-pulse' : ''}`} />
                {isClearingCache ? 'Publishing...' : 'Publish Changes'}
              </button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {success && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}

        {activeTab === 'pages' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Pages CMS</h2>
            {['privacy_policy', 'terms_of_service'].map(key => {
              const page = pages.find(p => p.key === key);
              if (!page) return null;
              return (
                <div key={page.id || page.key} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <h3 className="font-bold text-lg">{renderParsedHeading(page.title)}</h3>
                  <textarea
                    defaultValue={page.content}
                    onBlur={(e) => {
                      if (e.target.value !== page.content) {
                        handleSavePage(page, e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none resize-y min-h-[300px] font-mono text-sm"
                  />
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'thumbnails' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold">Image Optimization Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Quality (1-100)</label>
                  <input
                    type="number"
                    value={siteSettings.quality}
                    onChange={(e) => setSiteSettings({ ...siteSettings, quality: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Format</label>
                  <select
                    value={siteSettings.format}
                    onChange={(e) => setSiteSettings({ ...siteSettings, format: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                  >
                    <option value="webp">WebP</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fit</label>
                  <select
                    value={siteSettings.fit}
                    onChange={(e) => setSiteSettings({ ...siteSettings, fit: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="inside">Inside</option>
                    <option value="outside">Outside</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Position</label>
                  <select
                    value={siteSettings.position}
                    onChange={(e) => setSiteSettings({ ...siteSettings, position: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              <button
                onClick={async () => {
                  setError('');
                  setSuccess('');
                  try {
                    const settingsRef = collection(db, 'site_settings');
                    const snap = await getDocs(settingsRef);
                    if (snap.docs.length > 0) {
                      await setDoc(doc(db, 'site_settings', snap.docs[0].id), siteSettings);
                    } else {
                      await addDoc(settingsRef, siteSettings);
                    }
                    setSuccess('Settings saved successfully');
                  } catch (err: any) {
                    console.error('Error saving settings:', err);
                    setError('Failed to save settings: ' + (err.message || String(err)));
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Save Settings
              </button>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Thumbnails Cache</h2>
              <button 
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
              >
                {isClearingCache ? 'Clearing...' : 'Clear Image Cache'}
              </button>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-4">Filename</th>
                    <th className="p-4">Size (bytes)</th>
                    <th className="p-4">Dimensions</th>
                    <th className="p-4">Format</th>
                    <th className="p-4">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {cacheInfo.map((info) => (
                    <tr key={info.filename} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="p-4 font-mono text-sm">{info.filename}</td>
                      <td className="p-4">{info.size}</td>
                      <td className="p-4">{info.width}x{info.height}</td>
                      <td className="p-4">{info.format}</td>
                      <td className="p-4">{new Date(info.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">Date</th>
                    <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">Name</th>
                    <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">Company</th>
                    <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">Email</th>
                    <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">Phone</th>
                    <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">Employees</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-600 dark:text-zinc-400">
                        No signups yet.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="p-4 text-sm">
                          {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-sm font-medium">{lead.name}</td>
                        <td className="p-4 text-sm">{lead.company}</td>
                        <td className="p-4 text-sm text-blue-600 dark:text-blue-400">
                          <a href={`mailto:${lead.email}`}>{lead.email}</a>
                        </td>
                        <td className="p-4 text-sm">{lead.phone}</td>
                        <td className="p-4 text-sm">{lead.employees}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            {renderSectionHeaderEditor('team_heading', 'team_text', 'Team')}

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="font-bold text-lg">Team Section Footer Text</h3>
              <p className="text-sm text-zinc-500 mb-4">This text appears below all team members. Supports Markdown and &lt;b&gt; for blue bold.</p>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Footer Text</label>
                <textarea
                  defaultValue={homeCms.find(i => i.key === 'team_footer_text')?.value || ''}
                  placeholder="Enter general team text..."
                  onBlur={(e) => {
                    const item = homeCms.find(i => i.key === 'team_footer_text');
                    if (e.target.value !== (item?.value || '')) {
                      handleSaveCmsValue('team_footer_text', e.target.value, 'Team Section Footer Text');
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none h-32 resize-y"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage Team</h2>
              <button
                onClick={() => setEditingTeamMember({ name: '', role: '', image: '', bio: '', order: team.length, email: '', isAdmin: false })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Team Member
              </button>
            </div>

            {(() => {
              const renderTeamForm = () => {
                if (!editingTeamMember) return null;
                return (
                  <form onSubmit={handleSaveTeamMember} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <h3 className="font-bold text-lg">{editingTeamMember.id ? 'Edit Team Member' : 'Add Team Member'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingTeamMember.name}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
                      <input
                        type="text"
                        value={editingTeamMember.role}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, role: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={editingTeamMember.image}
                          onChange={(e) => setEditingTeamMember({...editingTeamMember, image: e.target.value})}
                          className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                          required
                        />
                        <label className="cursor-pointer flex items-center justify-center px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-300 dark:border-zinc-700">
                          <Upload className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Upload</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, (url) => setEditingTeamMember({...editingTeamMember, image: url}))}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                      {uploadingImage && <p className="text-sm text-blue-500 mt-1">Uploading image...</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Order</label>
                      <input
                        type="number"
                        value={editingTeamMember.order}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, order: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email (for Admin Access)</label>
                      <input
                        type="email"
                        value={editingTeamMember.email || ''}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, email: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="flex items-center gap-2 md:col-span-2">
                      <input
                        type="checkbox"
                        id="isAdmin"
                        checked={editingTeamMember.isAdmin || false}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, isAdmin: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-zinc-100 border-zinc-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                      />
                      <label htmlFor="isAdmin" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Admin Access</label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Bio (Markdown & &lt;b&gt; for blue bold)</label>
                      <textarea
                        value={editingTeamMember.bio || ''}
                        onChange={(e) => setEditingTeamMember({...editingTeamMember, bio: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none resize-y min-h-[120px]"
                        placeholder="Short bio about the team member..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image Fit</label>
                        <select
                          value={editingTeamMember.fit || ''}
                          onChange={(e) => setEditingTeamMember({...editingTeamMember, fit: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        >
                          <option value="">Global Default</option>
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="fill">Fill</option>
                          <option value="none">None</option>
                          <option value="scale-down">Scale Down</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image Position</label>
                        <select
                          value={editingTeamMember.position || ''}
                          onChange={(e) => setEditingTeamMember({...editingTeamMember, position: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        >
                          <option value="">Global Default</option>
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="top left">Top Left</option>
                          <option value="top right">Top Right</option>
                          <option value="bottom left">Bottom Left</option>
                          <option value="bottom right">Bottom Right</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setEditingTeamMember(null)} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-sm font-medium">Cancel</button>
                    <button 
                      type="submit" 
                      disabled={isSaving || uploadingImage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
                );
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {editingTeamMember && !editingTeamMember.id && (
                    <div className="md:col-span-3">
                      {renderTeamForm()}
                    </div>
                  )}
                  {team.map((member) => (
                    <div key={member.id || member.name} className="flex flex-col gap-4 md:col-span-3">
                      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">
                        <img 
                          src={getOptimizedImageUrl(member.image, 96, 96, siteSettings)} 
                          alt={member.name} 
                          className="w-24 h-24 rounded-full" 
                          style={{ 
                            objectFit: (member.fit || siteSettings?.fit || 'cover') as any, 
                            objectPosition: member.position || siteSettings?.position || 'center' 
                          }}
                          referrerPolicy="no-referrer" 
                        />
                        <h3 className="font-bold">{renderParsedHeading(member.name)}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{member.role}</p>
                        {member.email && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">{member.email}</p>
                        )}
                        {member.isAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-2">
                            Admin
                          </span>
                        )}
                        {member.bio && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-4 line-clamp-2 italic">
                            {member.bio}
                          </div>
                        )}
                        <div className="flex gap-2 w-full mt-auto">
                          <button onClick={() => setEditingTeamMember(member)} className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700">Edit</button>
                          <button 
                            onClick={() => handleDeleteTeamMember(member.id)} 
                            disabled={isSaving}
                            className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {editingTeamMember?.id === member.id && (
                        <div className="pl-4 md:pl-8 border-l-2 border-blue-500">
                          {renderTeamForm()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'home_cms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage Home Page Content</h2>
            </div>

            {(() => {
              const renderHomeCmsForm = () => {
                if (!editingHomeCms) return null;
                return (
                  <form onSubmit={handleSaveHomeCms} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <h3 className="font-bold text-lg">{editingHomeCms.id ? 'Edit Content' : 'Add Content'}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingHomeCms.title}
                        onChange={(e) => setEditingHomeCms({...editingHomeCms, title: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Value</label>
                      {editingHomeCms.type === 'text' ? (
                        <textarea
                          value={editingHomeCms.value}
                          onChange={(e) => setEditingHomeCms({...editingHomeCms, value: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none h-32 resize-none"
                          required
                        />
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingHomeCms.value}
                            onChange={(e) => setEditingHomeCms({...editingHomeCms, value: e.target.value})}
                            className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                            required
                          />
                          {editingHomeCms.type === 'image' && (
                            <label className="cursor-pointer flex items-center justify-center px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-300 dark:border-zinc-700">
                              <Upload className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">Upload</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(e, (url) => setEditingHomeCms({...editingHomeCms, value: url}))}
                                disabled={uploadingImage}
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Order</label>
                      <input
                        type="number"
                        value={editingHomeCms.order !== undefined ? editingHomeCms.order : ''}
                        onChange={(e) => setEditingHomeCms({...editingHomeCms, order: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                      />
                    </div>
                    {editingHomeCms.type === 'image' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image Fit</label>
                          <select
                            value={editingHomeCms.fit || ''}
                            onChange={(e) => setEditingHomeCms({...editingHomeCms, fit: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                          >
                            <option value="">Global Default</option>
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="fill">Fill</option>
                            <option value="none">None</option>
                            <option value="scale-down">Scale Down</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image Position</label>
                          <select
                            value={editingHomeCms.position || ''}
                            onChange={(e) => setEditingHomeCms({...editingHomeCms, position: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                          >
                            <option value="">Global Default</option>
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top left">Top Left</option>
                            <option value="top right">Top Right</option>
                            <option value="bottom left">Bottom Left</option>
                            <option value="bottom right">Bottom Right</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setEditingHomeCms(null)} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-sm font-medium">Cancel</button>
                    <button 
                      type="submit" 
                      disabled={isSaving || uploadingImage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              );
            };

            const heroKeys = ['hero_tag', 'hero_headline', 'hero_subheadline', 'hero_image', 'explainer_video'];

              return (
                <div className="grid grid-cols-1 gap-6">
                  {homeCms.filter(item => heroKeys.includes(item.key)).map((item) => (
                    <div key={item.id || item.docId || item.key} className="flex flex-col gap-4">
                      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold">{renderParsedHeading(item.title)}</h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mb-2">{item.key} {item.order !== undefined ? `(Order: ${item.order})` : ''}</p>
                          {item.type === 'text' ? (
                            <p className="text-sm text-zinc-700 dark:text-zinc-300">{renderParsedHeading(item.value)}</p>
                          ) : (
                            <div className="w-32 h-20 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                              {item.type === 'image' ? (
                                <img 
                                  src={getOptimizedImageUrl(item.value, 400, 400, siteSettings)} 
                                  alt={item.title} 
                                  className="w-full h-full" 
                                  style={{ 
                                    objectFit: (item.fit || siteSettings?.fit || 'cover') as any, 
                                    objectPosition: item.position || siteSettings?.position || 'center' 
                                  }}
                                  referrerPolicy="no-referrer" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
                                  <Play className="w-6 h-6 opacity-50" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <button onClick={() => setEditingHomeCms(item)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      {editingHomeCms?.id === item.id && (
                        <div className="pl-4 md:pl-8 border-l-2 border-blue-500">
                          {renderHomeCmsForm()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'solutions' && (
          <div className="space-y-6">
            {renderSectionHeaderEditor('solutions_heading', 'solutions_text', 'Solutions')}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage Solutions (Verticals)</h2>
              <button
                onClick={() => setEditingSolution({ 
                  id: '', 
                  title: '', 
                  headline: '', 
                  description: '', 
                  benefits: [''], 
                  color: 'blue', 
                  image: '', 
                  order: solutions.length + 1,
                  quote: {
                    oldWay: '',
                    joldiWay: '',
                    name: '',
                    position: '',
                    company: '',
                    thumbnail: ''
                  }
                })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Solution
              </button>
            </div>

            {(() => {
              const renderSolutionForm = () => {
                if (!editingSolution) return null;
                return (
                  <form onSubmit={handleSaveSolution} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <h3 className="font-bold text-lg">{editingSolution.docId ? 'Edit Solution' : 'Add Solution'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">ID (lowercase, no spaces)</label>
                      <input
                        type="text"
                        value={editingSolution.id}
                        onChange={(e) => setEditingSolution({...editingSolution, id: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingSolution.title}
                        onChange={(e) => setEditingSolution({...editingSolution, title: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Headline</label>
                      <input
                        type="text"
                        value={editingSolution.headline}
                        onChange={(e) => setEditingSolution({...editingSolution, headline: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                      <textarea
                        value={editingSolution.description}
                        onChange={(e) => setEditingSolution({...editingSolution, description: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none resize-none h-24"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Page Content (Markdown)</label>
                      <textarea
                        value={editingSolution.pageContent || ''}
                        onChange={(e) => setEditingSolution({...editingSolution, pageContent: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none resize-none h-48"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Benefits (Bullet Points)</label>
                      <div className="space-y-2">
                        {editingSolution.benefits?.map((benefit: string, index: number) => (
                          <div key={`${benefit}-${index}`} className="flex gap-2">
                            <input
                              type="text"
                              value={benefit}
                              onChange={(e) => {
                                const newBenefits = [...editingSolution.benefits];
                                newBenefits[index] = e.target.value;
                                setEditingSolution({...editingSolution, benefits: newBenefits});
                              }}
                              className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newBenefits = editingSolution.benefits.filter((_: any, i: number) => i !== index);
                                setEditingSolution({...editingSolution, benefits: newBenefits});
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setEditingSolution({...editingSolution, benefits: [...editingSolution.benefits, '']})}
                          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                        >
                          <Plus className="w-4 h-4" /> Add Benefit
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Color Theme</label>
                      <select
                        value={editingSolution.color}
                        onChange={(e) => setEditingSolution({...editingSolution, color: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        aria-label="Select a color theme"
                      >
                        <option value="blue">Blue</option>
                        <option value="indigo">Indigo</option>
                        <option value="emerald">Emerald</option>
                        <option value="rose">Rose</option>
                        <option value="amber">Amber</option>
                        <option value="violet">Violet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Order</label>
                      <input
                        type="number"
                        value={editingSolution.order}
                        onChange={(e) => setEditingSolution({...editingSolution, order: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={editingSolution.image}
                          onChange={(e) => setEditingSolution({...editingSolution, image: e.target.value})}
                          className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                          required
                        />
                        <label className="cursor-pointer flex items-center justify-center px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-300 dark:border-zinc-700">
                          <Upload className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Upload</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, (url) => setEditingSolution({...editingSolution, image: url}))}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                      {uploadingImage && <p className="text-sm text-blue-500 mt-1">Uploading image...</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image Fit</label>
                        <select
                          value={editingSolution.fit || ''}
                          onChange={(e) => setEditingSolution({...editingSolution, fit: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        >
                          <option value="">Global Default</option>
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="fill">Fill</option>
                          <option value="none">None</option>
                          <option value="scale-down">Scale Down</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Image Position</label>
                        <select
                          value={editingSolution.position || ''}
                          onChange={(e) => setEditingSolution({...editingSolution, position: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        >
                          <option value="">Global Default</option>
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="top left">Top Left</option>
                          <option value="top right">Top Right</option>
                          <option value="bottom left">Bottom Left</option>
                          <option value="bottom right">Bottom Right</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
                      <h4 className="font-bold mb-4">Quote Section</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">The Old Way</label>
                          <input
                            type="text"
                            value={editingSolution.quote?.oldWay || ''}
                            onChange={(e) => setEditingSolution({...editingSolution, quote: {...(editingSolution.quote || {}), oldWay: e.target.value}})}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">The Joldi Way</label>
                          <input
                            type="text"
                            value={editingSolution.quote?.joldiWay || ''}
                            onChange={(e) => setEditingSolution({...editingSolution, quote: {...(editingSolution.quote || {}), joldiWay: e.target.value}})}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Person Name</label>
                          <input
                            type="text"
                            value={editingSolution.quote?.name || ''}
                            onChange={(e) => setEditingSolution({...editingSolution, quote: {...(editingSolution.quote || {}), name: e.target.value}})}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Position</label>
                          <input
                            type="text"
                            value={editingSolution.quote?.position || ''}
                            onChange={(e) => setEditingSolution({...editingSolution, quote: {...(editingSolution.quote || {}), position: e.target.value}})}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Company</label>
                          <input
                            type="text"
                            value={editingSolution.quote?.company || ''}
                            onChange={(e) => setEditingSolution({...editingSolution, quote: {...(editingSolution.quote || {}), company: e.target.value}})}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Thumbnail URL</label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={editingSolution.quote?.thumbnail || ''}
                              onChange={(e) => setEditingSolution({...editingSolution, quote: {...(editingSolution.quote || {}), thumbnail: e.target.value}})}
                              className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                            />
                            <label className="cursor-pointer flex items-center justify-center px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-300 dark:border-zinc-700">
                              <Upload className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">Upload</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(e, (url) => setEditingSolution({...editingSolution, quote: {...(editingSolution.quote || {}), thumbnail: url}}))}
                                disabled={uploadingImage}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button 
                      type="submit" 
                      disabled={isSaving || uploadingImage}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditingSolution(null)} className="px-6 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700">Cancel</button>
                  </div>
                </form>
                );
              };

              return (
                <div className="grid grid-cols-1 gap-6">
                  {editingSolution && !editingSolution.docId && (
                    <div className="mb-6">
                      {renderSolutionForm()}
                    </div>
                  )}
                  {solutions.map((solution) => (
                    <div key={`admin-feature-${solution.docId || solution.id}`} className="flex flex-col gap-4">
                      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          <img 
                            src={getOptimizedImageUrl(solution.image, 400, 400, siteSettings)} 
                            alt={solution.title} 
                            className="w-full h-full" 
                            style={{ 
                              objectFit: (solution.fit || siteSettings?.fit || 'cover') as any, 
                              objectPosition: solution.position || siteSettings?.position || 'center' 
                            }}
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400 mb-2 inline-block">ID: {solution.id} | Order: {solution.order}</span>
                              <h3 className="text-xl font-bold">{renderParsedHeading(solution.title)}</h3>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingSolution(solution)} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700">Edit</button>
                              <button 
                                onClick={() => handleDeleteSolution(solution.docId)} 
                                disabled={isSaving}
                                className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">{solution.headline}</p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{solution.description}</p>
                          {solution.quote && (
                            <div className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                              <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Quote Preview</p>
                              <p className="text-sm italic mb-1">&quot;{solution.quote.joldiWay}&quot;</p>
                              <p className="text-xs font-medium">— {solution.quote.name}, {solution.quote.company}</p>
                            </div>
                          )}
                          <ul className="space-y-1 mt-auto">
                            {solution.benefits?.map((benefit: string, i: number) => (
                              <li key={`${benefit}-${i}`} className="text-sm flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {editingSolution?.docId === solution.docId && (
                        <div className="pl-4 md:pl-8 border-l-2 border-blue-500">
                          {renderSolutionForm()}
                        </div>
                      )}
                    </div>
                  ))}
                  {solutions.length === 0 && !editingSolution && (
                    <div className="p-8 text-center text-zinc-600 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
                      No solutions configured.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'basics' && (
          <div className="space-y-6">
            {renderSectionHeaderEditor('basics_heading', 'basics_text', 'Basics')}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage Basics (Consolidation)</h2>
              <button
                onClick={() => setEditingBasics({ feature: '', oldWay: '', joldiWay: '', order: basics.length + 1 })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Basic Item
              </button>
            </div>

            {(() => {
              const renderBasicsForm = () => {
                if (!editingBasics) return null;
                return (
                  <form onSubmit={handleSaveBasics} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-6">
                    <h3 className="font-bold text-lg">{editingBasics.id ? 'Edit Basic Item' : 'Add Basic Item'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Feature</label>
                      <input
                        type="text"
                        value={editingBasics.feature}
                        onChange={(e) => setEditingBasics({...editingBasics, feature: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">The Old Way</label>
                      <input
                        type="text"
                        value={editingBasics.oldWay}
                        onChange={(e) => setEditingBasics({...editingBasics, oldWay: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">The Joldi Way</label>
                      <input
                        type="text"
                        value={editingBasics.joldiWay}
                        onChange={(e) => setEditingBasics({...editingBasics, joldiWay: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Order</label>
                      <input
                        type="number"
                        value={editingBasics.order}
                        onChange={(e) => setEditingBasics({...editingBasics, order: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save</button>
                    <button type="button" onClick={() => setEditingBasics(null)} className="px-6 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700">Cancel</button>
                  </div>
                </form>
                );
              };

              return (
                <>
                  {editingBasics && !editingBasics.id && renderBasicsForm()}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                          <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">Feature</th>
                          <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">The Old Way</th>
                          <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">The Joldi Way</th>
                          <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">Order</th>
                          <th className="p-4 font-medium text-sm text-zinc-600 dark:text-zinc-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {basics.map((item) => (
                          <React.Fragment key={item.id || item.feature}>
                            <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                              <td className="p-4 text-sm font-medium">{renderParsedHeading(item.feature)}</td>
                              <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">{item.oldWay}</td>
                              <td className="p-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{item.joldiWay}</td>
                              <td className="p-4 text-sm">{item.order}</td>
                              <td className="p-4 text-sm">
                                <div className="flex gap-2">
                                  <button onClick={() => setEditingBasics(item)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"><LayoutTemplate className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteBasics(item.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                            {editingBasics?.id === item.id && (
                              <tr>
                                <td colSpan={5} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                  {renderBasicsForm()}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'only_joldi' && (
          <div className="space-y-6">
            {renderSectionHeaderEditor('only_joldi_heading', 'only_joldi_text', 'Only Joldi')}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage &quot;What Only Joldi Can Do&quot;</h2>
              <button
                onClick={() => setEditingOnlyJoldi({ title: '', old: '', new: '', order: onlyJoldi.length + 1 })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Item
              </button>
            </div>

            {(() => {
              const renderOnlyJoldiForm = () => {
                if (!editingOnlyJoldi) return null;
                return (
                  <form onSubmit={handleSaveOnlyJoldi} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-6">
                    <h3 className="font-bold text-lg">{editingOnlyJoldi.id ? 'Edit Item' : 'Add Item'}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingOnlyJoldi.title}
                        onChange={(e) => setEditingOnlyJoldi({...editingOnlyJoldi, title: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">The Old Way (Description)</label>
                      <textarea
                        value={editingOnlyJoldi.old}
                        onChange={(e) => setEditingOnlyJoldi({...editingOnlyJoldi, old: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none h-24 resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">The Joldi Way (Description)</label>
                      <textarea
                        value={editingOnlyJoldi.new}
                        onChange={(e) => setEditingOnlyJoldi({...editingOnlyJoldi, new: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none h-24 resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Solution</label>
                      <select
                        value={editingOnlyJoldi.solutionId || ''}
                        onChange={(e) => setEditingOnlyJoldi({...editingOnlyJoldi, solutionId: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                        aria-label="Select a solution"
                      >
                        <option value="">Select a solution</option>
                        {solutions.map((s: any) => (
                          <option key={s.docId || s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Order</label>
                      <input
                        type="number"
                        value={editingOnlyJoldi.order}
                        onChange={(e) => setEditingOnlyJoldi({...editingOnlyJoldi, order: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save</button>
                    <button type="button" onClick={() => setEditingOnlyJoldi(null)} className="px-6 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700">Cancel</button>
                  </div>
                </form>
                );
              };

              return (
                <>
                  {editingOnlyJoldi && !editingOnlyJoldi.id && renderOnlyJoldiForm()}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {onlyJoldi.map((item) => (
                      <div key={item.id || item.title} className="flex flex-col gap-4 md:col-span-2">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg">{renderParsedHeading(item.title)}</h3>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingOnlyJoldi(item)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"><LayoutTemplate className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteOnlyJoldi(item.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Old Way</p>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-through opacity-60 italic">{item.old}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-blue-500 uppercase mb-1">Joldi Way</p>
                              <p className="text-sm font-medium">{item.new}</p>
                            </div>
                          </div>
                        </div>
                        {editingOnlyJoldi?.id === item.id && (
                          <div className="pl-4 md:pl-8 border-l-2 border-blue-500">
                            {renderOnlyJoldiForm()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="space-y-6">
            {renderSectionHeaderEditor('faq_heading', 'faq_text', 'FAQ')}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage FAQs</h2>
              <button
                onClick={() => setEditingFaq({ question: '', answer: '', order: faqs.length + 1 })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add FAQ
              </button>
            </div>

            {(() => {
              const renderFaqForm = () => {
                if (!editingFaq) return null;
                return (
                  <form onSubmit={handleSaveFaq} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-6">
                    <h3 className="font-bold text-lg">{editingFaq.id ? 'Edit FAQ' : 'Add FAQ'}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Question</label>
                      <input
                        type="text"
                        value={editingFaq.question}
                        onChange={(e) => setEditingFaq({...editingFaq, question: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Answer</label>
                      <textarea
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({...editingFaq, answer: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none h-32 resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Order</label>
                      <input
                        type="number"
                        value={editingFaq.order}
                        onChange={(e) => setEditingFaq({...editingFaq, order: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save</button>
                    <button type="button" onClick={() => setEditingFaq(null)} className="px-6 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700">Cancel</button>
                  </div>
                </form>
                );
              };

              return (
                <>
                  {editingFaq && !editingFaq.id && renderFaqForm()}
                  <div className="space-y-4">
                    {faqs.map((faq) => (
                      <div key={faq.id || faq.question} className="flex flex-col gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{renderParsedHeading(faq.question)}</h3>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingFaq(faq)} className="p-1.5 hover:bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors"><LayoutTemplate className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteFaq(faq.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
                          <p className="text-xs text-zinc-400 mt-2">Order: {faq.order}</p>
                        </div>
                        {editingFaq?.id === faq.id && (
                          <div className="pl-4 md:pl-8 border-l-2 border-blue-500">
                            {renderFaqForm()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'cta' && (
          <div className="space-y-6">
            {renderSectionHeaderEditor('cta_heading', 'cta_text', 'Mailing List / CTA')}

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="font-bold text-lg">CTA Tag Text</h3>
              <p className="text-sm text-zinc-500 mb-4">The small badge text above the heading (e.g., &quot;Limited Spots Available&quot;). Leave blank to hide.</p>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tag Text</label>
                <input
                  type="text"
                  defaultValue={homeCms.find(i => i.key === 'cta_tag')?.value || ''}
                  placeholder="Limited Spots Available"
                  onBlur={(e) => {
                    const item = homeCms.find(i => i.key === 'cta_tag');
                    if (e.target.value !== (item?.value || '')) {
                      handleSaveCmsValue('cta_tag', e.target.value, 'CTA Tag Text');
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="font-bold text-lg">Signup Form Progress Messages</h3>
              <p className="text-sm text-zinc-500 mb-4">These messages appear above the submit button as the user fills out the form. Leave blank to hide.</p>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { key: 'signup_not_filled_msg', title: 'Not Filled Out' },
                  { key: 'signup_partial_filled_msg', title: 'Partially Filled Out' },
                  { key: 'signup_fully_filled_msg', title: 'Fully Filled Out' }
                ].map(({ key, title }) => {
                  const item = homeCms.find(i => i.key === key);
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{title} Message</label>
                      <input
                        type="text"
                        defaultValue={item?.value || ''}
                        placeholder={`Enter ${title.toLowerCase()} message...`}
                        onBlur={(e) => {
                          if (e.target.value !== (item?.value || '')) {
                            handleSaveCmsValue(key, e.target.value, title + ' Message');
                          }
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
}

console.log('Admin.tsx module evaluation END');
