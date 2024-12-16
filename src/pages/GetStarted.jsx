import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PhoneVerification from '../components/auth/verification/PhoneVerification';
import OtpVerification from '../components/auth/verification/OtpVerification';
import AnimatedElement from '../components/animations/AnimatedElement';
import { initializeApp } from 'firebase/app';
import { Check } from 'lucide-react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { useLocation } from '../context/LocationContext';
import { propertiesByLocation } from '../data/properties';
import { useNavigate } from 'react-router-dom';
import { useLocation as useRouteLocation } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const firebaseConfig = {
  apiKey: 'AIzaSyBihQygxha0qRxb14LV81MH65GQshstBbU',
  authDomain: 'cobrother-5f961.firebaseapp.com',
  projectId: 'cobrother-5f961',
  storageBucket: 'cobrother-5f961.firebasestorage.app',
  messagingSenderId: '1030961019067',
  appId: '1:1030961019067:web:ae2664d87d2a937c1cd19e',
  measurementId: 'G-C49053S5SH',
};

// Initialize Firebase App
initializeApp(firebaseConfig);
const auth = getAuth();

const MultiSelect = ({ options, selected, onChange, label }) => (
  <div className="space-y-2">
    <label className="block text-gray-900 font-medium mb-4">{label}</label>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => {
            if (selected.includes(option)) {
              onChange(selected.filter(item => item !== option));
            } else {
              onChange([...selected, option]);
            }
          }}
          className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${selected.includes(option)
            ? 'bg-primary-600 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-primary-50 border border-gray-200'
            }`}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(option) ? 'border-white' : 'border-gray-400'
              }`}>
              {selected.includes(option) && <Check className="w-3 h-3" />}
            </div>
            <span>{option}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const SingleSelect = ({ options, selected, onChange, label }) => (
  <div className="space-y-2">
    <label className="block text-gray-900 font-medium mb-4">{label}</label>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${selected === option
            ? 'bg-primary-600 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-primary-50 border border-gray-200'
            }`}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected === option ? 'border-white bg-white' : 'border-gray-400'
              }`}>
              {selected === option && <div className="w-2 h-2 rounded-full bg-primary-600" />}
            </div>
            <span>{option}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const GetStarted = () => {
  const [step, setStep] = useState('phone');
  const [page, setPage] = useState('verify');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [otp, setOtp] = useState('');
  const [cap, setCap] = useState(false);
  const routeLocation = useRouteLocation();
  var { state } = routeLocation;
  if (state == null) {
    state = { property: '' }
  }
  const [preferences, setPreferences] = useState({
    ageGroup: [],
    occupation: [],
    earnings: [],
    maritalStatus: [],
    children: [],
    dietary: [],
    environment: [],
    pets: [],
    property: state.property
  });
  const { selectedLocation } = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const properties = propertiesByLocation[selectedLocation] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    let form = preferences;
    form.phoneNumber = phoneNumber;
    console.log("Test")
    try {
      const { data } = await axios.post('http://localhost:8000/api/form', form);
      console.log(data);
      if (data.success == true) {
        toast.success('Form submitted Successfully, redirecting to home page', {
          position: 'top-right',
          autoClose: 3000, // 3 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          onClose: () => navigate('/'), // Navigate to Home after the toast
        });
        console.log("true")
      } else {
        console.log(data);
      }
    } catch (e) {
      console.log(e);
      toast.error(String(e), {
        position: 'top-right',
        autoClose: 3000, // 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };

  const SelectProperty = ({ selected, onChange, label }) => (
    <div className="space-y-2">
      <label className="block text-gray-900 font-medium mb-4">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {properties.map((option) => (
          <button
            key={option.title}
            onClick={() => onChange(option.title)}
            className={`relative px-4 py-2 text-white bg-cover h-32 rounded-lg text-sm transition-all duration-300 ${selected === option.title
              ? 'shadow-lg'
              : 'hover:bg-primary-50 border border-gray-200'
              }`}
            style={{ backgroundImage: `url(${option.image})` }}
          >
            {/* Black gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent rounded-lg pointer-events-none" />

            <div className="relative flex p-4 space-x-2 h-full z-10">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected === option.title
                  ? 'border-white bg-white'
                  : 'border-gray-400'
                  }`}
              >
                {selected === option.title && (
                  <div className="w-2 h-2 rounded-full bg-primary-600" />
                )}
              </div>
              <span >{option.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );


  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;

      console.log('Google Sign-In Successful:', { user, token });
      if (user.phoneNumber) {
        setPhoneNumber(user.phoneNumber);
        setPage('done');
      } else {
        setError('Your Account is not linked with phone number')
      }
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleFacebookSignIn = async () => {
    setError('');
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;

      console.log('Facebook Sign-In Successful:', { user, token });
      // Handle user info here
    } catch (err) {
      console.error('Error signing in with Facebook:', err);
      setError('Failed to sign in with Facebook. Please try again.');
    }
  };

  const handlePhoneSubmit = async (phone) => {
    setPhoneNumber(phone);
    setError('');

    try {
      // Initialize RecaptchaVerifier only if it's not already initialized
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('Recaptcha resolved.');
          },
        });
      }

      const formattedPhone = `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);

      // Clean up the RecaptchaVerifier after successful OTP generation
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;

      setConfirmationResult(result);
      setStep('otp');
      startResendTimer(); // Start the resend timer
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send OTP. Please try again.');

      // Clean up the RecaptchaVerifier on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };


  const Temp = (e) => {
    e.preventDefault();
  }

  const handleOtpVerify = async () => {
    setError('');

    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result found. Please request a new OTP.');
      }
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      console.log('OTP Verified! Token:', idToken);
      setPage('done');
      // Handle successful OTP verification here (e.g., save token, redirect)
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return; // Prevent multiple resends during the timer

    try {
      setError('');
      await handlePhoneSubmit(phoneNumber); // Resend OTP by calling phone submit logic
      startResendTimer(); // Restart the resend timer
      console.log('OTP resent successfully');
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {page === 'verify' ? (
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-md mx-auto">
            <AnimatedElement direction="up" delay={0.1}>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Get Started
                </h1>

                <div className="flex justify-between mb-6 space-x-4">
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center h-12 px-4 bg-white border border-black rounded-full shadow hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="36"
                      height="36"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4 C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      ></path>
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      ></path>
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002 l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                    </svg>
                    Google
                  </button>

                  {/* Facebook Sign-In Button */}
                  <button
                    onClick={handleFacebookSignIn}
                    className="flex items-center justify-cente h-12 px-4 bg-white border border-black rounded-full shadow hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="36"
                      height="36"
                    >
                      <path
                        fill="#3F51B5"
                        d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
                      ></path>
                      <path
                        fill="#FFF"
                        d="M34.368,25H31v13h-5V25h-3v-4h3v-2.41c0.002-3.508,1.459-5.59,5.592-5.59H35v4h-2.287 C31.104,17,31,17.6,31,18.723V21h4L34.368,25z"
                      ></path>
                    </svg>
                    Facebook
                  </button>
                </div>

                {step === 'phone' ? (
                  <PhoneVerification
                    onSubmit={handlePhoneSubmit}
                    error={error}
                    setError={setError}
                  />
                ) : (
                  <OtpVerification
                    phoneNumber={phoneNumber}
                    onVerified={handleOtpVerify}
                    onResendOtp={handleResendOtp}
                    onBack={() => setStep('phone')}
                    resendTimer={resendTimer}
                    error={error}
                    otp={otp}
                    setOtp={setOtp}
                    setError={setError}
                  />
                )}
              </div>
            </AnimatedElement>
          </div>
        </div>) : (
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedElement direction="up" delay={0.1}>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Preferred Co-Brother</h1>
                <SelectProperty
                  label="Selected Property"
                  selected={preferences.property}
                  onChange={(value) => setPreferences({ ...preferences, property: value })}
                />
                <p className="text-gray-600 mt-8 mb-3">
                  Help us find your ideal neighbors by sharing your preferences. You can select multiple options for most questions.
                </p>
                <button
                  className="mb-3 w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onClick={handleSubmit}
                >
                  Skip Preferences
                </button>

                <div className="space-y-8">
                  <MultiSelect
                    label="1. Age Group"
                    options={['18-25', '26-35', '36-45', '46-55', '56-65', '66+']}
                    selected={preferences.ageGroup}
                    onChange={(value) => setPreferences({ ...preferences, ageGroup: value })}
                  />

                  <MultiSelect
                    label="2. Occupation"
                    options={['Skip', 'Employee', 'Freelancer', 'Business Owner', 'Retired', 'Student', 'Other']}
                    selected={preferences.occupation}
                    onChange={(value) => setPreferences({ ...preferences, occupation: value })}
                  />

                  <MultiSelect
                    label="3. Annual Earnings"
                    options={['Skip', 'Above 20 LPA', 'Above 50 LPA', 'Above 1 Cr']}
                    selected={preferences.earnings}
                    onChange={(value) => setPreferences({ ...preferences, earnings: value })}
                  />

                  <MultiSelect
                    label="4. Marital Status"
                    options={['Skip', 'Single', 'Married']}
                    selected={preferences.maritalStatus}
                    onChange={(value) => setPreferences({ ...preferences, maritalStatus: value })}
                  />

                  <MultiSelect
                    label="5. Do you prefer neighbors with children?"
                    options={['Skip', 'No Children', 'Children aged 0-5', 'Children aged 6-12', 'Teenagers', 'Adult Children']}
                    selected={preferences.children}
                    onChange={(value) => setPreferences({ ...preferences, children: value })}
                  />

                  <MultiSelect
                    label="6. Dietary Preference"
                    options={['Skip', 'Vegetarian', 'Non-Vegetarian', 'Vegan']}
                    selected={preferences.dietary}
                    onChange={(value) => setPreferences({ ...preferences, dietary: value })}
                  />

                  <MultiSelect
                    label="7. Environment"
                    options={['Skip', 'Quiet', 'Social', 'Active']}
                    selected={preferences.environment}
                    onChange={(value) => setPreferences({ ...preferences, environment: value })}
                  />

                  <MultiSelect
                    label="8. Do you prefer neighbors with pets? If yes, which ones are you okay with?"
                    options={['Skip', 'No Pets', 'Dog', 'Cat', 'Bird', 'Fish', 'Reptile', 'Others']}
                    selected={preferences.pets}
                    onChange={(value) => setPreferences({ ...preferences, pets: value })}
                  />

                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    onClick={handleSubmit}
                  >
                    Join Co-Brother
                  </button>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>)}
      <ToastContainer />
    </div>
  );
};

export default GetStarted;