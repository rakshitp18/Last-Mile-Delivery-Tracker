import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, User, Sparkles, X, ArrowRight, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

interface Props {
  text?: string;
  defaultCustomerType?: 'B2C' | 'B2B';
  onError?: (msg: string) => void;
}

export const GoogleSignInButton: React.FC<Props> = ({
  text = 'Continue with Google',
  defaultCustomerType = 'B2C',
  onError,
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'B2C' | 'B2B'>(defaultCustomerType);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [pinCodeInput, setPinCodeInput] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [tokenClient, setTokenClient] = useState<any>(null);

  useEffect(() => {
    // Load Google Identity Services SDK if Client ID is configured in .env
    if (googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID') {
      const initGsi = () => {
        if ((window as any).google?.accounts) {
          try {
            if (!(window as any).__shipit_gsi_initialized) {
              (window as any).__shipit_gsi_initialized = true;
              (window as any).google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
              });
            }

            // Initialize OAuth2 Token Client
            if ((window as any).google.accounts.oauth2 && !tokenClient) {
              const client = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: googleClientId,
                scope: 'email profile openid',
                callback: async (tokenResponse: any) => {
                  if (tokenResponse && tokenResponse.access_token) {
                    setIsLoading(true);
                    try {
                      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                      });
                      const googleUser = await userInfoRes.json();

                      const user = await loginWithGoogle({
                        credential: 'google-oauth-token',
                        email: googleUser.email,
                        firstName: googleUser.given_name || googleUser.name || 'Google',
                        lastName: googleUser.family_name || 'User',
                        customerType: selectedType,
                      });

                      if (user.role === 'ADMIN') navigate('/admin/dashboard');
                      else if (user.role === 'DELIVERY_AGENT') navigate('/agent/dashboard');
                      else navigate('/customer/dashboard');
                    } catch (err: any) {
                      setShowConfigModal(true);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                },
                error_callback: () => {
                  setShowConfigModal(true);
                },
              });
              setTokenClient(client);
            }
          } catch (e) {
            console.warn('Google Identity initialization notice:', e);
          }
        }
      };

      if ((window as any).google?.accounts) {
        initGsi();
      } else if (!document.getElementById('google-gsi-client')) {
        const script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGsi;
        document.body.appendChild(script);
      }
    }
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    try {
      const user = await loginWithGoogle({
        credential: response.credential,
        customerType: selectedType,
        companyName: selectedType === 'B2B' ? companyName : undefined,
        gstNumber: selectedType === 'B2B' ? gstNumber : undefined,
      });

      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DELIVERY_AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Google authentication failed';
      if (onError) onError(msg);
      setShowConfigModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (tokenClient) {
      try {
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('Token client request failed, fallback to modal:', e);
      }
    }

    if (googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowConfigModal(true);
          }
        });
        return;
      } catch {
        setShowConfigModal(true);
      }
    }

    // Fallback: Open interactive persona & Google details modal
    setShowConfigModal(true);
  };

  const handleDirectGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneInput.trim().length < 8) {
      if (onError) onError('Please enter a valid contact phone number for delivery updates.');
      return;
    }
    if (!addressInput.trim()) {
      if (onError) onError('Please enter your primary delivery street address.');
      return;
    }
    if (!pinCodeInput.trim() || pinCodeInput.trim().length < 6) {
      if (onError) onError('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    setIsLoading(true);
    try {
      const email = emailInput.trim() || 'user.google@gmail.com';
      const fullName = nameInput.trim() || 'Google User';
      const names = fullName.split(' ');
      const firstName = names[0] || 'Google';
      const lastName = names.slice(1).join(' ') || 'User';

      const user = await loginWithGoogle({
        credential: 'google-oauth-session-token',
        email: email,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneInput.trim(),
        address: addressInput.trim(),
        city: cityInput.trim() || 'New Delhi',
        state: stateInput.trim() || 'Delhi',
        pinCode: pinCodeInput.trim(),
        customerType: selectedType,
        companyName: selectedType === 'B2B' ? companyName : undefined,
        gstNumber: selectedType === 'B2B' ? gstNumber : undefined,
      });

      // Mark profile permanently completed
      const userKey = user.email || email;
      localStorage.setItem(`gatiman_profile_completed_${userKey}`, 'true');
      localStorage.setItem(`gatiman_profile_dismissed_${userKey}`, 'true');

      setShowConfigModal(false);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DELIVERY_AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Google sign-in failed';
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={isLoading}
        onClick={handleButtonClick}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer disabled:opacity-50"
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{isLoading ? 'Authenticating...' : text}</span>
      </button>

      {/* Google Persona & Account Type Selection Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-100">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Google Account Sign-In</h3>
                <p className="text-xs text-slate-500">Select your account profile type</p>
              </div>
            </div>

            <form onSubmit={handleDirectGoogleLogin} className="space-y-4">
              {/* Account Persona Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Account Type (Individual vs Business)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedType('B2C')}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition cursor-pointer ${
                      selectedType === 'B2C'
                        ? 'border-orange-600 bg-orange-50/80 text-orange-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <User className={`h-5 w-5 ${selectedType === 'B2C' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Personal (B2C)</span>
                    <span className="text-[10px] text-slate-500 leading-tight">Individual sender</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedType('B2B')}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition cursor-pointer ${
                      selectedType === 'B2B'
                        ? 'border-orange-600 bg-orange-50/80 text-orange-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Building className={`h-5 w-5 ${selectedType === 'B2B' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">Business (B2B)</span>
                    <span className="text-[10px] text-slate-500 leading-tight">Corporate & GST</span>
                  </button>
                </div>
              </div>

              {/* Email Input (Simulates Google Profile Email) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Google Email</label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your-name@gmail.com"
                    className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone Number *</label>
                <div className="relative mt-1">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
                  />
                </div>
              </div>

              {/* Address Coordinates */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-orange-600" />
                  Primary Delivery Address *
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="e.g. Flat 402, Greenfield Apartments"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-orange-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">City</label>
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="New Delhi"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 shadow-xs focus:border-orange-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">State</label>
                    <input
                      type="text"
                      value={stateInput}
                      onChange={(e) => setStateInput(e.target.value)}
                      placeholder="Delhi"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 shadow-xs focus:border-orange-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Postal PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pinCodeInput}
                    onChange={(e) => setPinCodeInput(e.target.value)}
                    placeholder="110016"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-orange-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Business Extra Fields */}
              {selectedType === 'B2B' && (
                <div className="space-y-3 rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Company / Enterprise Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Logistics Pvt Ltd"
                      className="mt-1 w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs text-slate-900 shadow-xs focus:border-orange-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="07AAAAA0000A1Z5"
                      className="mt-1 w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs text-slate-900 shadow-xs focus:border-orange-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-500 transition cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Confirm & Sign In'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
