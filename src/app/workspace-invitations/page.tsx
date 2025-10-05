'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Users, FolderOpen, Check } from 'lucide-react';

type InvitationStatus = 'loading' | 'verified' | 'expired' | 'invalid' | 'accepted' | 'error';

function WorkspaceInvitationPageContent() {
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
      const invitation_id = searchParams.get('invitation_id');
      const email = searchParams.get('email');
      const slug = searchParams.get('slug');
      
      if (!invitation_id || !email || !slug) {
        setStatus('invalid');
        setMessage('Link de convite inválido ou expirado.');
        return;
      }

      try {
        const response = await fetch('/api/invitations/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: invitation_id, email, slug }),
        });

        const data = await response.json().catch(() => {
          throw new Error('Resposta inválida do servidor');
        });

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao verificar o convite');
        }

        if (data.workspaceName) setWorkspaceName(data.workspaceName);
        if (data.inviterName) setInviterName(data.inviterName);
        if (data.inviterEmail) setInviterEmail(data.inviterEmail);
        if (data.role) setRole(data.role);

        if (data.requiresAuth) {
          router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
          return;
        }

        if (data.redirectUrl) {
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
        body: JSON.stringify({ 
          token: searchParams.get('invitation_id'),
          email: searchParams.get('email'),
          slug: searchParams.get('slug')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao aceitar o convite');
      }

      setStatus('accepted');
      setMessage('Convite aceito com sucesso! Redirecionando...');
      
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/dashboard';
      }, 1500);
      
    } catch (err) {
      console.error('Accept invitation error:', err);
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Erro ao aceitar o convite');
    }
  };

  const handleIgnoreInvitation = () => {
    router.push('/');
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
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">You have been invited to {workspaceName}</h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Your workspace is where you&apos;ll create projects, collaborate on your work items, 
              and organize different streams of work in your TaskFlow account.
            </p>
            
            {inviterName && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <p className="text-gray-600">
                  <span className="font-medium">{inviterName}</span> ({inviterEmail}) invited you to join as {role === 'ADMIN' ? 'an administrator' : 'a member'}.
                </p>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAcceptInvitation}
                className="flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Check className="h-5 w-5 mr-2" />
                Accept
              </button>
              
              <button
                onClick={handleIgnoreInvitation}
                className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Ignore
              </button>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              By accepting, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        );

      case 'accepted':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation accepted!</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6">
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" />
                Redirecting...
              </div>
            </div>
          </div>
        );

      case 'expired':
      case 'invalid':
      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'expired' ? 'Invitation Expired' : 'Invitation Error'}
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
                Back to home
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
      <div className="w-full max-w-2xl space-y-8 bg-white p-12 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 mb-4">
            <FolderOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {status === 'verified' ? 'Workspace Invitation' : 'TaskFlow Invitation'}
          </h1>
        </div>

        <div className="mt-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceInvitationPage() {
  return (
    <Suspense fallback={null}>
      <WorkspaceInvitationPageContent />
    </Suspense>
  );
}
