import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email.endsWith('@rgipt.ac.in')) {
      toast.error('Only @rgipt.ac.in emails are allowed.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email: formData.email });
      toast.success('OTP has been sent to your email! (Check inbox)');
      setShowOtpField(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      // Store token and set user directly from register response
      localStorage.setItem('token', res.data.token);
      // Cleanly set user state without the token
      const { token, ...userData } = res.data;
      setUser(userData);
      toast.success('Registration successful!');
      navigate('/'); // root route handles role-based redirect
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center -mt-8">
      <div className="bg-white flex flex-col md:flex-row-reverse rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl mx-4 border border-slate-100">

        {/* Right Side: Graphic (Flipped for Register) */}
        <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 text-white p-12 justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

          <img src="/rgipt_logo.png" alt="RGIPT Logo" className="w-32 h-auto mb-8 z-10 drop-shadow-xl" />
          <h2 className="text-4xl font-extrabold mb-4 z-10 text-center tracking-tight text-white drop-shadow">Join RGIPT NOC</h2>
          <p className="text-blue-100 text-center z-10 max-w-sm text-lg font-medium leading-relaxed">Fast-track your internship approvals directly from your student dashboard.</p>
        </div>

        {/* Left Side: Form */}
        <div className="flex-1 p-8 sm:p-14 w-full flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500 font-medium mb-8">Sign up securely using your RGIPT webmail identity.</p>

            {error && <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 text-sm font-medium flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
              {error}
            </div>}

            {message && <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl mb-6 text-sm font-medium flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              {message}
            </div>}

            <form onSubmit={showOtpField ? handleRegister : handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  disabled={showOtpField}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email (@rgipt.ac.in)</label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={showOtpField}
                  placeholder="e.g. name@rgipt.ac.in"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    disabled={showOtpField}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm pr-16 disabled:bg-slate-50 disabled:text-slate-400"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    disabled={showOtpField}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-500 hover:text-indigo-600 font-bold transition-colors disabled:opacity-50"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {showOtpField && (
                <div className="animate-fade-in-up">
                  <label className="block text-sm font-bold text-indigo-700 mb-1">6-Digit Verification Code</label>
                  <input
                    type="text"
                    name="otp"
                    required
                    maxLength="6"
                    placeholder="Enter OTP from email"
                    className="w-full px-4 py-3 border-2 border-indigo-200 bg-indigo-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold tracking-widest text-center text-indigo-900"
                    value={formData.otp}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="pt-2">
                {showOtpField ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowOtpField(false); setFormData({ ...formData, otp: '' }); }}
                      className="w-1/3 bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition-all"
                    >
                      Go Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 hover:-translate-y-0.5 transform transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {loading ? 'Verifying...' : 'Complete Sign Up'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 transform transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {loading ? 'Requesting OTP...' : 'Send Verification OTP'}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-slate-600">
              Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline ml-1">Sign In</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
