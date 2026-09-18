'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  // State untuk berpindah mode antara 'login' dan 'register'
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // State untuk form input Login
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // State untuk form input Register
  const [regFullName, setRegFullName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  // State untuk penanganan pesan error & sukses
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handler Submit Login
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const result = await loginAction(new FormData(e.currentTarget));

    if (result.success) {
      setSuccessMessage('Login berhasil! Mengalihkan ke dashboard...');
      router.push('/dashboard-ppdb/dashboard');
      router.refresh();
    } else {
      setIsLoading(false);
      setErrorMessage(result.error ?? 'Email atau password salah!');
    }
  };

  // Handler Submit Register
  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Pendaftaran berhasil! Silakan masuk ke akun Anda.');
      // Pindah ke mode login setelah registrasi
      setIsLogin(true);
      // Reset form register
      setRegFullName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
    }, 1000);
  };

  // Fungsi toggle perpindahan mode
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* SISI KIRI: Form Auth Dinamis */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 relative flex items-center justify-center">
                {/* Placeholder Logo Icon */}
                <div className="w-10 h-10 border-4 border-blue-600 border-t-yellow-400 border-r-green-500 rounded-full transform -rotate-45"></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Masuk ke Akun PPDB' : 'Daftar Akun PPDB'}
            </h2>
            <p className="text-sm text-gray-500">
              {isLogin
                ? 'Masuk ke akun PPDB Anda untuk melanjutkan proses pendaftaran.'
                : 'Yuk, lengkapi data diri Anda untuk memulai proses pendaftaran PPDB.'}
            </p>
          </div>

          {/* Pesan Notifikasi Feedback */}
          {errorMessage && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
              {successMessage}
            </div>
          )}

          {/* FORM LOGIN */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="mb-1 block text-xs font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  placeholder="m@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-gray-800"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label htmlFor="login-password" className="block text-xs font-medium text-gray-700">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-blue-900 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-gray-800"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-auto w-full rounded-md bg-[#0F2A60] px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-[#0a1e45] disabled:opacity-50"
              >
                {isLoading ? 'Memproses...' : 'Login'}
              </Button>

              <div className="text-center text-xs text-gray-600 pt-2">
                Belum Memiliki Akun?{' '}
                <Button
                  type="button"
                  onClick={toggleAuthMode}
                  variant="link"
                  className="h-auto p-0 text-blue-900 font-semibold hover:underline inline-block"
                >
                  Daftar Sekarang!
                </Button>
              </div>
            </form>
          ) : (

            
            /* FORM REGISTER */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <Label htmlFor="register-name" className="mb-1 block text-xs font-medium text-gray-700">
                  Nama Lengkap
                </Label>
                <Input
                  id="register-name"
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-gray-800"
                />
              </div>

              <div>
                <Label htmlFor="register-email" className="mb-1 block text-xs font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  required
                  placeholder="m@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-gray-800"
                />
              </div>

              <div>
                <Label htmlFor="register-password" className="mb-1 block text-xs font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-gray-800"
                />
              </div>

              <div>
                <Label htmlFor="register-confirm-password" className="mb-1 block text-xs font-medium text-gray-700">
                  Konfirmasi Password
                </Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-gray-800"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-auto w-full rounded-md bg-[#0F2A60] px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-[#0a1e45] disabled:opacity-50"
              >
                {isLoading ? 'Memproses...' : 'Daftar'}
              </Button>

              <div className="text-center text-xs text-gray-600 pt-2">
                Sudah Memiliki Akun?{' '}
                <Button
                  type="button"
                  onClick={toggleAuthMode}
                  variant="link"
                  className="h-auto p-0 text-blue-900 font-semibold hover:underline inline-block"
                >
                  Masuk Sekarang
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* SISI KANAN: Gambar Gedung */}
      <div className="hidden md:block md:w-1/2 relative bg-gray-100 min-h-screen">
        {/* Pastikan letakkan foto gedung di folder public/gedung-bazma.jpg */}
        <Image
          src="/gedung-bazma.jpg"
          alt="Gedung SMK TI BAZMA"
          fill
          priority
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}