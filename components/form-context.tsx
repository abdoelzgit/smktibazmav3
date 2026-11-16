'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { tabSchemas } from '@/lib/validations/ppdb-form';
import type { AllFormData, TabName } from '@/lib/validations/ppdb-form';

const STORAGE_KEY = 'ppdb_form_draft';
const TAB_ORDER = [
  'Data Diri',
  'Riwayat',
  'Finalisasi',
  'Data orang Tua',
  'Berkas',
  'Surat Rekomendasi',
  'Data sekolah Asal',
] as const;

interface FormContextType {
  formData: AllFormData;
  errors: Partial<Record<TabName, Record<string, string>>>;
  touched: Partial<Record<TabName, Record<string, boolean>>>;
  activeTab: TabName;
  isSubmitting: Record<TabName, boolean>;
  tabStatus: Record<TabName, 'idle' | 'saving' | 'saved' | 'error'>;
  savedTabs: Record<TabName, boolean>;
  
  setActiveTab: (tab: TabName) => void;
  updateField: (tab: TabName, field: string, value: unknown) => void;
  updateFields: (tab: TabName, fields: Partial<AllFormData>) => void;
  setError: (tab: TabName, field: string, error: string) => void;
  clearError: (tab: TabName, field: string) => void;
  setTouched: (tab: TabName, field: string) => void;
  validateTab: (tab: TabName) => boolean;
  setSubmitting: (tab: TabName, submitting: boolean) => void;
  setTabStatus: (tab: TabName, status: 'idle' | 'saving' | 'saved' | 'error') => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
  getFormDataForSubmit: (tab: TabName) => FormData;
}

const initialFormData: AllFormData = {
  namaLengkap: '',
  email: '',
  tempatLahir: '',
  tanggalLahir: '',
  nik: '',
  nisn: '',
  kewarganegaraan: 'Indonesia',
  anakKe: '',
  jumlahSaudara: '',
  statusKeluarga: 'ANAK_KANDUNG',
  tinggalBersama: '',
  alamatLengkap: '',
  noHpWhatsapp: '',
  mediaSosial: '',
  linkPengumpulanVideo: '',
  setujuPanduanVideo: false,
  bahasaAsing: '',
  riwayatPrestasi: '',
  riwayatOrganisasi: '',
  beratBadan: '',
  tinggiBadan: '',
  riwayatPenyakit: '',
  isMerokok: false,
  isButaWarna: false,
  hasPenyakitMenular: false,
  pernyataanSiswa: false,
  fotoFormalUrl: '',
  namaAyah: '',
  pekerjaanAyah: '',
  alamatDomisiliAyah: '',
  alamatAyahSamaDenganSiswa: false,
  namaIbu: '',
  pekerjaanIbu: '',
  noHpOi: '',
  keadaanOrangTua: 'LENGKAP',
  penghasilanOrangTua: '',
  pernyataanOrangTua: false,
  namaSekolahAsal: '',
  npsnSekolah: '',
  statusSekolah: 'NEGERI',
  tahunLulus: '',
  alamatSekolah: '',
  namaPemberiRekomendasi: '',
  jabatanInstansi: '',
  noHpPemberiRekomendasi: '',
  suratRekomendasiUrl: '',
  catatanRekomendasi: '',
  kkUrl: '',
  ktpOrangTuaUrl: '',
  kipUrl: '',
  akteUrl: '',
  ijazahUrl: '',
  raporUrl: '',
  prestasiUrl: '',
  bpjsUrl: '',
  sktmUrl: '',
  suratPernyataanWaliUrl: '',
  suratPernyataanCpdbUrl: '',
  suratTidakMerokokUrl: '',
  tampakDepanRumahUrl: '',
  tampakSampingRumahUrl: '',
  kamarTidurUrl: '',
  kamarMandiUrl: '',
  ruangTamuUrl: '',
  riwayatPrestasiItems: [],
  riwayatOrganisasiItems: [],
  riwayatBahasaItems: [],
};

const FormContext = createContext<FormContextType | null>(null);

interface FormProviderProps {
  children: ReactNode;
  initialData?: AllFormData | null;
  initialSavedTabs?: Partial<Record<TabName, boolean>>;
}

export function FormProvider({ children, initialData, initialSavedTabs }: FormProviderProps) {
  const [formData, setFormData] = useState<AllFormData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.formData) return { ...initialFormData, ...parsed.formData };
        }
      } catch (e) {
        console.warn('Failed to load form draft:', e);
      }
    }
    return initialData || initialFormData;
  });
  const [errors, setErrors] = useState<Partial<Record<TabName, Record<string, string>>>>({});
  const [touched, setTouched] = useState<Partial<Record<TabName, Record<string, boolean>>>>({});
  const [activeTab, setActiveTab] = useState<TabName>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.activeTab && TAB_ORDER.includes(parsed.activeTab)) {
            return parsed.activeTab;
          }
        }
      } catch (e) {
        console.warn('Failed to load active tab:', e);
      }
    }
    return 'Data Diri';
  });
  const [isSubmitting, setIsSubmitting] = useState<Record<TabName, boolean>>({
    'Data Diri': false,
    'Riwayat': false,
    'Finalisasi': false,
    'Data orang Tua': false,
    'Berkas': false,
    'Surat Rekomendasi': false,
    'Data sekolah Asal': false,
  });
  const [tabStatus, setTabStatus] = useState<Record<TabName, 'idle' | 'saving' | 'saved' | 'error'>>({
    'Data Diri': 'idle',
    'Riwayat': 'idle',
    'Finalisasi': 'idle',
    'Data orang Tua': 'idle',
    'Berkas': 'idle',
    'Surat Rekomendasi': 'idle',
    'Data sekolah Asal': 'idle',
  });
  const [savedTabs, setSavedTabs] = useState<Record<TabName, boolean>>({
    'Data Diri': Boolean(initialSavedTabs?.['Data Diri']),
    'Data orang Tua': Boolean(initialSavedTabs?.['Data orang Tua']),
    'Berkas': Boolean(initialSavedTabs?.Berkas),
    'Surat Rekomendasi': Boolean(initialSavedTabs?.['Surat Rekomendasi']),
    'Data sekolah Asal': Boolean(initialSavedTabs?.['Data sekolah Asal']),
    'Riwayat': Boolean(initialSavedTabs?.Riwayat),
    'Finalisasi': false,
  });
  const [hydrated, setHydrated] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.formData) setFormData({ ...initialFormData, ...parsed.formData });
        if (parsed.activeTab && TAB_ORDER.includes(parsed.activeTab)) {
          setActiveTab(parsed.activeTab);
        }
      }
    } catch (e) {
      console.warn('Failed to load form draft:', e);
    }
  }, []);

  const saveToStorage = useCallback((data: AllFormData, tab: TabName) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData: data, activeTab: tab }));
    } catch (e) {
      console.warn('Failed to save form draft:', e);
    }
  }, []);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Hydrate initial data from server on first render
  useEffect(() => {
    if (initialData && !hydrated) {
      setFormData((prev) => ({
        ...initialFormData,
        ...prev,
        ...initialData,
      }));
      setHydrated(true);
    }
  }, [initialData, hydrated]);

  // Auto-save to localStorage on changes
  useEffect(() => {
    if (hydrated) {
      saveToStorage(formData, activeTab);
    }
  }, [formData, activeTab, hydrated, saveToStorage]);

  const updateField = useCallback((tab: TabName, field: string, value: unknown) => {
    setSavedTabs((prev) => ({ ...prev, [tab]: false }));
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      saveToStorage(next, tab);
      return next;
    });
  }, [saveToStorage]);

  const updateFields = useCallback((tab: TabName, fields: Partial<AllFormData>) => {
    setSavedTabs((prev) => ({ ...prev, [tab]: true }));
    setFormData((prev) => {
      const next = { ...prev, ...fields };
      saveToStorage(next, tab);
      return next;
    });
  }, [saveToStorage]);

  const setError = useCallback((tab: TabName, field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: error },
    }));
  }, []);

  const clearError = useCallback((tab: TabName, field: string) => {
    setErrors((prev) => {
      if (!prev[tab]) return prev;
      const { [field]: _, ...rest } = prev[tab];
      return { ...prev, [tab]: rest };
    });
  }, []);

  const setFieldTouched = useCallback((tab: TabName, field: string) => {
    setTouched((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: true },
    }));
  }, []);

  const validateTab = useCallback((tab: TabName) => {
    const schema = tabSchemas[tab];
    const result = schema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors((prev) => ({ ...prev, [tab]: fieldErrors }));
      return false;
    }
    
    setErrors((prev) => {
      const { [tab]: _, ...rest } = prev;
      return rest;
    });
    return true;
  }, [formData]);

  const setSubmittingTab = useCallback((tab: TabName, submitting: boolean) => {
    setIsSubmitting((prev) => ({ ...prev, [tab]: submitting }));
  }, []);

  const setTabStatusFn = useCallback((tab: TabName, status: 'idle' | 'saving' | 'saved' | 'error') => {
    setTabStatus((prev) => ({ ...prev, [tab]: status }));
  }, []);

  const getFormDataForSubmit = useCallback((tab: TabName): FormData => {
    const fd = new FormData();
    const schema = tabSchemas[tab] as any;
    const shape = schema?.shape || {};
    
    Object.keys(shape).forEach((key) => {
      const value = formData[key as keyof AllFormData];
      if (value !== undefined && value !== '' && value !== false) {
        if (typeof value === 'boolean') {
          fd.append(key, value.toString());
        } else {
          fd.append(key, String(value));
        }
      }
    });
    
    return fd;
  }, [formData]);

  return (
    <FormContext.Provider
      value={{
        formData,
        errors,
        touched,
        activeTab,
        isSubmitting,
        tabStatus,
        savedTabs,
        setActiveTab,
        updateField,
        updateFields,
        setError,
        clearError,
        setTouched: setFieldTouched,
        validateTab,
        setSubmitting: setSubmittingTab,
        setTabStatus: setTabStatusFn,
        loadFromStorage,
        clearStorage,
        getFormDataForSubmit,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
}
