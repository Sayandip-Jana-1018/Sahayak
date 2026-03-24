'use client';

import { useState, useMemo } from 'react';
import { useOnboardingStore, LanguageCode } from '@/store/onboardingStore';

const LANGUAGES: { code: LanguageCode; native: string; english: string }[] = [
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'ur', native: 'اردو', english: 'Urdu' },
  { code: 'en', native: 'English', english: 'English' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export function Step2ElderlyDetails() {
  const { formData, updateFormData } = useOnboardingStore();
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  const isFamily = formData.userType === 'family';

  const filteredStates = useMemo(
    () => INDIAN_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase())),
    [stateSearch]
  );

  const ageHint = formData.ageYears >= 65 ? 'Eligible for senior citizen government schemes' :
    formData.ageYears >= 60 ? 'Qualifies for some state benefits' : '';

  return (
    <div className="step2">
      <h2 className="step2__title">
        {isFamily ? <>Tell us about the person you&apos;re caring for <span style={{ color: '#E63946' }}>❤️</span></> : 'Tell us about yourself'}
      </h2>

      <div className="step2__form">
        {/* ─── Left Column ─── */}
        <div className="step2__col">
          {/* Name */}
          <div className="step2__field">
            <label className="step2__label">{isFamily ? 'Their full name' : 'Your full name'}</label>
            <input
              type="text"
              className="step2__input"
              placeholder="e.g. Kamala Devi"
              value={formData.elderlyName}
              onChange={(e) => updateFormData({ elderlyName: e.target.value })}
            />
            {formData.elderlyName.length > 0 && formData.elderlyName.length < 2 && (
              <span className="step2__error">Name must be at least 2 characters</span>
            )}
          </div>

          {/* Age slider */}
          <div className="step2__field">
            <label className="step2__label">Age</label>
            <div className="step2__age-display">{formData.ageYears}</div>
            <input
              type="range"
              min={50}
              max={100}
              value={formData.ageYears}
              onChange={(e) => updateFormData({ ageYears: parseInt(e.target.value) })}
              className="step2__slider"
            />
            <div className="step2__age-range">
              <span>50</span>
              <span className="step2__age-label">years old</span>
              <span>100</span>
            </div>
            {ageHint && <p className="step2__age-hint">{ageHint}</p>}
          </div>

          {/* State */}
          <div className="step2__field">
            <label className="step2__label">State</label>
            <div className="step2__dropdown-wrapper">
              <input
                type="text"
                className="step2__input"
                placeholder="Search state..."
                value={formData.state || stateSearch}
                onChange={(e) => {
                  setStateSearch(e.target.value);
                  updateFormData({ state: '' });
                  setShowStateDropdown(true);
                }}
                onFocus={() => setShowStateDropdown(true)}
                onBlur={() => setTimeout(() => setShowStateDropdown(false), 200)}
              />
              {showStateDropdown && filteredStates.length > 0 && (
                <div className="step2__dropdown">
                  {filteredStates.map((state) => (
                    <button
                      key={state}
                      className="step2__dropdown-item"
                      onMouseDown={() => {
                        updateFormData({ state });
                        setStateSearch('');
                        setShowStateDropdown(false);
                      }}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* District */}
          <div className="step2__field">
            <label className="step2__label">District (optional)</label>
            <input
              type="text"
              className="step2__input"
              placeholder="e.g. Varanasi"
              value={formData.district}
              onChange={(e) => updateFormData({ district: e.target.value })}
            />
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="step2__col">
          {/* Language grid */}
          <div className="step2__field">
            <label className="step2__label">Primary language</label>
            <div className="step2__languages">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`step2__lang-btn ${formData.primaryLanguage === lang.code ? 'step2__lang-btn--selected' : ''}`}
                  onClick={() => updateFormData({ primaryLanguage: lang.code })}
                >
                  <span className="step2__lang-native">{lang.native}</span>
                  <span className="step2__lang-english">{lang.english}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency contact */}
          <div className="step2__field">
            <label className="step2__label">
              {isFamily ? "Emergency contact (caregiver's number)" : 'Emergency contact (family member)'}
            </label>
            <div className="step2__row">
              <input
                type="text"
                className="step2__input step2__input--half"
                placeholder="Contact name"
                value={formData.emergencyContactName}
                onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
              />
              <div className="step2__phone-wrapper">
                <span className="step2__phone-prefix">+91</span>
                <input
                  type="tel"
                  className="step2__input step2__input--phone"
                  placeholder="98765 43210"
                  maxLength={10}
                  value={formData.emergencyContactPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    updateFormData({ emergencyContactPhone: val });
                  }}
                />
              </div>
            </div>
            {formData.emergencyContactPhone.length > 0 && !/^[6-9]\d{9}$/.test(formData.emergencyContactPhone) && (
              <span className="step2__error">Enter a valid 10-digit Indian mobile number</span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .step2__title {
          font-family: var(--font-display);
          font-size: 32px !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em;
          margin-bottom: 40px;
          color: var(--text-primary);
          text-align: center;
        }

        .step2__form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          align-items: start;
        }

        .step2__col {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .step2__field {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .step2__label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-align: center;
        }

        .step2__input {
          padding: 16px 20px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          font-size: 16px;
          font-family: var(--font-body);
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          text-align: center;
          letter-spacing: 0.02em;
        }

        :global(.light) .step2__input,
        :global([data-theme="light"]) .step2__input {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(27, 42, 74, 0.1);
        }

        .step2__input::placeholder {
          color: var(--text-muted);
        }

        .step2__input:focus {
          border-color: #FF6B2C;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 4px rgba(255, 107, 44, 0.15);
        }

        :global(.light) .step2__input:focus,
        :global([data-theme="light"]) .step2__input:focus {
          background: #FFFFFF;
        }

        .step2__error {
          font-size: 12px;
          color: #E63946;
        }

        .step2__age-display {
          font-family: var(--font-accent);
          font-size: 48px;
          font-weight: 700;
          color: #FF6B2C;
          text-align: center;
          line-height: 1;
        }

        .step2__slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(90deg,
            #FF6B2C 0%,
            #FF6B2C ${((formData.ageYears - 50) / 50) * 100}%,
            rgba(255,255,255,0.1) ${((formData.ageYears - 50) / 50) * 100}%
          );
          outline: none;
          cursor: pointer;
        }

        :global(.light) .step2__slider,
        :global([data-theme="light"]) .step2__slider {
          background: linear-gradient(90deg,
            #FF6B2C 0%,
            #FF6B2C ${((formData.ageYears - 50) / 50) * 100}%,
            rgba(27,42,74,0.1) ${((formData.ageYears - 50) / 50) * 100}%
          );
        }

        .step2__slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FF6B2C;
          box-shadow: 0 2px 8px rgba(255, 107, 44, 0.4);
          cursor: pointer;
        }

        .step2__age-range {
          display: flex;
          justify-content: center;
          gap: 16px;
          font-size: 13px;
          color: var(--text-muted);
          width: 100%;
          margin-top: 8px;
        }

        .step2__age-label {
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .step2__age-hint {
          font-size: 12px;
          color: #2D6A4F;
          text-align: center;
          margin: 0;
        }

        .step2__dropdown-wrapper {
          position: relative;
        }

        .step2__dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          max-height: 240px;
          overflow-y: auto;
          background: rgba(15, 15, 25, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          z-index: 20;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }

        :global(.light) .step2__dropdown,
        :global([data-theme="light"]) .step2__dropdown {
          background: #FFFFFF;
          box-shadow: 0 8px 32px rgba(27,42,74,0.1);
        }

        .step2__dropdown-item {
          display: block;
          width: 100%;
          padding: 14px 20px;
          text-align: center;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 15px;
          cursor: pointer;
          transition: background 0.15s;
          font-family: var(--font-body);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .step2__dropdown-item:last-child {
          border-bottom: none;
        }

        .step2__dropdown-item:hover {
          background: rgba(255, 107, 44, 0.1);
          color: #FF6B2C;
        }

        .step2__languages {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }

        .step2__lang-btn {
          padding: 14px 10px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-family: var(--font-body);
          width: calc(33.333% - 8px);
          min-width: 90px;
        }

        :global(.light) .step2__lang-btn,
        :global([data-theme="light"]) .step2__lang-btn {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(27, 42, 74, 0.08);
        }

        .step2__lang-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        :global(.light) .step2__lang-btn:hover,
        :global([data-theme="light"]) .step2__lang-btn:hover {
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 24px rgba(27, 42, 74, 0.08);
          border-color: rgba(27, 42, 74, 0.15);
        }

        .step2__lang-btn--selected {
          border-color: #FF6B2C !important;
          background: linear-gradient(145deg, rgba(255, 107, 44, 0.15), rgba(255, 143, 94, 0.05)) !important;
          box-shadow: 0 0 24px rgba(255, 107, 44, 0.2) !important;
        }

        .step2__lang-btn--selected .step2__lang-native,
        .step2__lang-btn--selected .step2__lang-english {
          color: #FF6B2C;
        }

        .step2__lang-native {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          transition: color 0.3s ease;
        }

        .step2__lang-english {
          font-size: 11px;
          color: var(--text-muted);
          transition: color 0.3s ease;
          font-weight: 500;
        }

        .step2__row {
          display: flex;
          gap: 16px;
          width: 100%;
        }

        .step2__input--half {
          flex: 1;
        }

        .step2__phone-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .step2__phone-prefix {
          position: absolute;
          left: 14px;
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 600;
          pointer-events: none;
        }

        .step2__input--phone {
          padding-left: 60px;
          text-align: left; /* Phone numbers left aligned usually looks better, but let's center */
          text-align: center;
        }

        @media (max-width: 768px) {
          .step2__form {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .step2__lang-btn {
            width: calc(33.333% - 8px);
          }

          .step2__row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
