'use client';

// This page relies on search params from the URL. During the build step,
// Next.js attempts to pre-render pages by default which causes errors
// when `useSearchParams` is executed without a request context.
// Mark the page as dynamic so that it renders at runtime only.
export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

type InvitationStatus = 'loading' | 'verified' | 'expired' | 'invalid' | 'accepted' | 'error';

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<InvitationStatus>('loading');
  const [message, setMessage] = useState('Verificando seu convite...');
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviterName, setInviterName] = useState('');
  const [inviterEmail, setInviterEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const verifyInvitation = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('invalid');
        setMessage('Link de convite inválido ou expirado.');
        return;
      }

      try {
        const response = await fetch('/api/invitations/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao verificar o convite');
        }

        // Set invitation details
        if (data.workspaceName) setWorkspaceName(data.workspaceName);
        if (data.inviterName) setInviterName(data.inviterName);
        if (data.inviterEmail) setInviterEmail(data.inviterEmail);
        if (data.role) setRole(data.role);

        if (data.requiresAuth) {
          // Redirect to sign in with callback URL
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
          return;
        }

        if (data.redirectUrl) {
          // If user is already logged in and invitation is valid, redirect to workspace
          setStatus('accepted');
          setMessage('Redirecionando para o workspace...');
          setTimeout(() => {
            window.location.href = data.redirectUrl;
          }, 1500);
          return;
        }

        setStatus('verified');
        setMessage('Convite verificado com sucesso!');
        
      } catch (err) {
        console.error('Verification error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao processar o convite';
        
        if (errorMessage.includes('expirado')) {
          setStatus('expired');
          setMessage('Este convite expirou. Peça ao administrador para enviar um novo convite.');
        } else if (errorMessage.includes('inválido') || errorMessage.includes('já foi usado')) {
          setStatus('invalid');
          setMessage('Link de convite inválido ou já utilizado.');
        } else {
          setStatus('error');
          setMessage(errorMessage);
        }
      }
    };

    verifyInvitation();
  }, [searchParams, router]);

  const handleAcceptInvitation = async () => {
    try {
      setStatus('loading');
      setMessage('Aceitando convite...');
      
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: searchParams.get('token') }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao aceitar o convite');
      }

      setStatus('accepted');
      setMessage('Convite aceito com sucesso! Redirecionando...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/dashboard';
      }, 1500);
      
    } catch (err) {
      console.error('Accept invitation error:', err);
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Erro ao aceitar o convite');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <p className="text-lg text-gray-700">{message}</p>
          </div>
        );

      case 'verified':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Você foi convidado para {workspaceName}</h2>
            
            {inviterName && (
              <p className="text-gray-600 mb-6">
                <span className="font-medium">{inviterName}</span> ({inviterEmail}) convidou você para ser {role === 'ADMIN' ? 'um administrador' : 'um membro'} deste workspace.
              </p>
            )}
            
            <div className="mt-8 space-y-4">
              <button
                onClick={handleAcceptInvitation}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Aceitar convite
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Recusar
              </button>
            </div>
            
            <p className="mt-4 text-xs text-gray-500">
              Ao aceitar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
          </div>
        );

      case 'accepted':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Convite aceito!</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6">
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" />
                Redirecionando...
              </div>
            </div>
          </div>
        );

      case 'expired':
      case 'invalid':
      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'expired' ? 'Convite Expirado' : 'Erro no Convite'}
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
                Voltar para o início
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {status === 'verified' ? 'Bem-vindo(a) ao' : 'Convite para o'} Kanban
          </h1>
        </div>
        
        <div className="mt-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
