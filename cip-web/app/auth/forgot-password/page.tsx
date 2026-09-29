'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    // Password reset isn't implemented yet — this just acknowledges the request
    // so the link isn't a dead 404 while the real flow gets built.
    toast.success('If an account exists for that email, a reset link will be sent.');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-gray-400 hover:text-[#38BDF8] mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forgot password</h1>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
          Enter your account email and we&apos;ll send you a reset link.
        </p>

        {submitted ? (
          <div className="rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 p-4 text-sm text-sky-700 dark:text-sky-300">
            Check your inbox for further instructions. This feature is still being finished, so
            reach out to support if you don&apos;t receive anything.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#38BDF8] text-white font-semibold hover:bg-sky-500 transition"
            >
              Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
