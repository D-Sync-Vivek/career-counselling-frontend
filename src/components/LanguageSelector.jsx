import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const INDIAN_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'as', label: 'Assamese (অসমীয়া)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'brx', label: 'Bodo (बड़ो)' },
  { code: 'doi', label: 'Dogri (डोगरी)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'hi', label: 'Hindi (हिंदी)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ks', label: 'Kashmiri (कॉशुर / کأشُر)' },
  { code: 'kok', label: 'Konkani (कोंकणी)' },
  { code: 'mai', label: 'Maithili (मैथिली)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'mni', label: 'Manipuri (মৈতৈলোন্)' }, // Meitei
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'ne', label: 'Nepali (नेपाली)' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'sa', label: 'Sanskrit (संस्कृतम्)' },
  { code: 'sat', label: 'Santali (ᱥᱟᱱᱛᱟᱲି)' },
  { code: 'sd', label: 'Sindhi (سنڌي)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'ur', label: 'Urdu (اردو)' },
];

export default function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState('en');

  // Check cookies on load to set the initial dropdown state
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1]) {
      const currentLang = match[1].split('/')[2]; // Extract 'hi' from '/en/hi'
      if (currentLang) setSelectedLang(currentLang);
    }
  }, []);

  const handleLanguageChange = (e) => {
    const langCode = e.target.value;
    setSelectedLang(langCode);

    // 1. Force the cookie update
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/;`;

    // 2. Try to trigger the Google Translate dropdown programmatically
    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = langCode;
      googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // 3. Fallback: If the widget hasn't fully loaded, reload the page to apply the cookie
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 shadow-sm hover:border-blue-400 hover:bg-blue-100 transition-all cursor-pointer relative">
      <Globe size={18} className="text-blue-600" />
      <select
        value={selectedLang}
        onChange={handleLanguageChange}
        className="bg-transparent text-sm font-extrabold text-blue-900 outline-none cursor-pointer appearance-none pr-6"
        style={{
          // Removes default dropdown arrow in some browsers
          WebkitAppearance: 'none',
          MozAppearance: 'none'
        }}
      >
        {INDIAN_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-slate-800 font-bold">
            {lang.label}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
        ▼
      </div>
    </div>
  );
}