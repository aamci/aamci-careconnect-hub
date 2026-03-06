import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2,
  ShieldCheck, KeyRound, LockKeyhole, Activity,
  ArrowRight, Sparkles,
} from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
const emailSchema = z.string().email('Adresse email invalide');
const passwordSchema = z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres');

// ---------------------------------------------------------------------------
// Marketing bullet points (inspired by top healthcare platforms)
// ---------------------------------------------------------------------------
const BENEFITS = [
  'Facilitez l\'acces aux soins pour vos patients',
  'Profitez d\'une interface tout-en-un, 100% integree',
  'Valorisez votre expertise et votre temps medical',
] as const;

// ===========================================================================
// AuthPage - split-screen premium, ocean blue + teal
// ===========================================================================
const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [ready, setReady] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, navigate, from]);
  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);

  const validateInputs = (isSignUp: boolean): boolean => {
    setError(null);
    try { emailSchema.parse(email); } catch { setError('Adresse email invalide'); return false; }
    try { passwordSchema.parse(password); } catch { setError('Le mot de passe doit contenir au moins 6 caracteres'); return false; }
    if (isSignUp && password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return false; }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(false)) return;
    setIsLoading(true);
    setError(null);
    const { error: err } = await signIn(email, password);
    if (err) {
      if (err.message.includes('Invalid login credentials')) setError('Email ou mot de passe incorrect');
      else if (err.message.includes('Email not confirmed')) setError('Veuillez confirmer votre email avant de vous connecter');
      else setError(err.message);
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(true)) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const { error: err } = await signUp(email, password);
    if (err) {
      if (err.message.includes('already registered')) setError('Un compte existe deja avec cette adresse email');
      else setError(err.message);
    } else {
      setSuccess('Compte cree ! Verifiez votre email pour confirmer votre inscription.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
    setIsLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccess(null);
  };

  const inputCls =
    'rounded-xl bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/20 ' +
    'focus:bg-white/[0.08] focus:border-[hsl(166,72%,50%)]/50 focus:ring-1 focus:ring-[hsl(166,72%,45%)]/25 transition-all duration-200';

  return (
    <div className="h-screen w-screen overflow-hidden relative grid grid-cols-1 lg:grid-cols-2">

      {/* ================================================================ */}
      {/* LEFT PANEL : form (dark navy)                                    */}
      {/* ================================================================ */}
      <div
        className="relative flex flex-col h-full overflow-hidden"
        style={{ background: 'linear-gradient(180deg, hsl(215 45% 8%) 0%, hsl(210 50% 11%) 100%)' }}
      >
        {/* Header */}
        <header
          className="shrink-0 relative z-10 flex items-center gap-2.5"
          style={{ padding: 'clamp(20px, 3vh, 32px) clamp(24px, 3vw, 40px)' }}
        >
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 'clamp(30px, 4vh, 38px)',
              height: 'clamp(30px, 4vh, 38px)',
              background: 'linear-gradient(135deg, hsl(166 72% 45%), hsl(166 72% 35%))',
              boxShadow: '0 4px 14px hsl(166 72% 45% / 0.25)',
            }}
          >
            <Activity className="text-white" style={{ width: 'clamp(15px, 2vh, 19px)', height: 'clamp(15px, 2vh, 19px)' }} />
          </div>
          <span className="font-bold tracking-tight" style={{ color: 'hsl(210 20% 96%)', fontSize: 'clamp(15px, 1.9vh, 19px)' }}>
            CareConnect
            <span className="text-white/30 ml-1.5 font-semibold tracking-wider uppercase" style={{ fontSize: 'clamp(8px, 1vh, 10px)' }}>
              Hub
            </span>
          </span>
        </header>

        {/* Form - centered */}
        <div className="flex-1 relative z-10 flex items-center justify-center min-h-0">
          <div className="w-full" style={{ maxWidth: 'clamp(340px, 82%, 440px)', padding: '0 clamp(24px, 3vw, 40px)' }}>

            {/* Title */}
            <div style={{ marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              <h1 className="font-bold" style={{ color: 'hsl(210 20% 96%)', fontSize: 'clamp(22px, 3vh, 30px)' }}>
                Identifiez-vous
              </h1>
              <p className="mt-1.5 text-white/40" style={{ fontSize: 'clamp(13px, 1.6vh, 15px)' }}>
                {mode === 'login'
                  ? 'Accedez a votre espace de soins coordonnes'
                  : 'Creez votre compte professionnel'}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <Alert variant="destructive" className="mb-3 rounded-xl bg-red-500/10 border-red-500/20 text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300" style={{ fontSize: 'clamp(11px, 1.3vh, 13px)' }}>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-3 rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-emerald-300" style={{ fontSize: 'clamp(11px, 1.3vh, 13px)' }}>{success}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form
              onSubmit={mode === 'login' ? handleLogin : handleSignUp}
              style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.8vh, 18px)' }}
            >
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="font-medium text-white/50" style={{ fontSize: 'clamp(11px, 1.3vh, 13px)' }}>
                  Adresse e-mail
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                    style={{ width: 'clamp(15px, 1.8vh, 17px)', height: 'clamp(15px, 1.8vh, 17px)' }}
                  />
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="prenom.nom@etablissement.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    style={{ height: 'clamp(42px, 5.5vh, 52px)', fontSize: 'clamp(13px, 1.5vh, 15px)', paddingLeft: 'clamp(38px, 4.5vh, 46px)' }}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="auth-password" className="font-medium text-white/50" style={{ fontSize: 'clamp(11px, 1.3vh, 13px)' }}>
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                    style={{ width: 'clamp(15px, 1.8vh, 17px)', height: 'clamp(15px, 1.8vh, 17px)' }}
                  />
                  <Input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    style={{ height: 'clamp(42px, 5.5vh, 52px)', fontSize: 'clamp(13px, 1.5vh, 15px)', paddingLeft: 'clamp(38px, 4.5vh, 46px)', paddingRight: '48px' }}
                    required
                    disabled={isLoading}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-white/25 hover:text-white/50 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password (signup) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-confirm" className="font-medium text-white/50" style={{ fontSize: 'clamp(11px, 1.3vh, 13px)' }}>
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                      style={{ width: 'clamp(15px, 1.8vh, 17px)', height: 'clamp(15px, 1.8vh, 17px)' }}
                    />
                    <Input
                      id="auth-confirm"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirmer votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputCls}
                      style={{ height: 'clamp(42px, 5.5vh, 52px)', fontSize: 'clamp(13px, 1.5vh, 15px)', paddingLeft: 'clamp(38px, 4.5vh, 46px)' }}
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl font-bold uppercase tracking-wide text-white border-0 hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                style={{
                  height: 'clamp(44px, 5.8vh, 54px)',
                  fontSize: 'clamp(12px, 1.4vh, 14px)',
                  background: 'linear-gradient(135deg, hsl(166 72% 40%), hsl(166 72% 32%))',
                  boxShadow: '0 4px 18px hsl(166 72% 45% / 0.3)',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Connexion...' : 'Creation...'}
                  </>
                ) : (
                  mode === 'login' ? 'Continuer' : 'Creer mon compte'
                )}
              </Button>
            </form>

            {/* Remember + Forgot (login) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between" style={{ marginTop: 'clamp(10px, 1.4vh, 16px)' }}>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/[0.04] cursor-pointer"
                    style={{ accentColor: 'hsl(166 72% 45%)' }}
                  />
                  <span className="text-white/35" style={{ fontSize: 'clamp(11px, 1.3vh, 13px)' }}>Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Contactez votre administrateur pour reinitialiser votre mot de passe.')}
                  className="font-medium text-[hsl(166,60%,55%)]/70 hover:text-[hsl(166,60%,55%)] transition-colors"
                  style={{ fontSize: 'clamp(11px, 1.3vh, 13px)' }}
                >
                  Un probleme pour vous connecter ?
                </button>
              </div>
            )}

            {/* Separator + SSO (login) */}
            {mode === 'login' && (
              <>
                <div className="relative" style={{ margin: 'clamp(12px, 1.8vh, 20px) 0' }}>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-white/20 uppercase tracking-widest" style={{ fontSize: 'clamp(9px, 1.1vh, 11px)' }}>ou</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl bg-white/[0.03] border-white/[0.1] text-white/60 hover:bg-white/[0.06] hover:text-white/80 hover:border-white/[0.15] transition-all duration-200"
                  style={{ height: 'clamp(44px, 5.8vh, 54px)', fontSize: 'clamp(12px, 1.4vh, 14px)' }}
                  onClick={() => toast.info('Pro Sante Connect sera disponible prochainement.')}
                >
                  <KeyRound className="mr-2.5 h-4 w-4 text-[hsl(166,72%,55%)]" />
                  <span className="font-semibold uppercase tracking-wide">S'identifier avec Pro Sante Connect</span>
                </Button>
              </>
            )}

            {/* Toggle login/signup */}
            <p className="text-center text-white/30" style={{ marginTop: 'clamp(12px, 1.8vh, 20px)', fontSize: 'clamp(11px, 1.3vh, 13px)' }}>
              {mode === 'login' ? (
                <>
                  Pas encore de compte ?{' '}
                  <button type="button" onClick={switchMode} className="font-semibold text-[hsl(166,60%,55%)] hover:text-[hsl(166,60%,60%)] transition-colors underline underline-offset-2">
                    Creer un compte
                  </button>
                </>
              ) : (
                <>
                  Deja inscrit ?{' '}
                  <button type="button" onClick={switchMode} className="font-semibold text-[hsl(166,60%,55%)] hover:text-[hsl(166,60%,60%)] transition-colors underline underline-offset-2">
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="shrink-0 relative z-10 flex flex-wrap items-center justify-center gap-x-2"
          style={{ padding: 'clamp(12px, 1.8vh, 20px) clamp(24px, 3vw, 40px)' }}
        >
          {['Conditions generales', 'Mentions legales', 'Politique de cookies', 'Confidentialite'].map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <span className="text-white/10">&middot;</span>}
              <button
                type="button"
                className="text-white/25 hover:text-white/45 transition-colors underline underline-offset-2"
                style={{ fontSize: 'clamp(9px, 1.1vh, 11px)' }}
              >
                {label}
              </button>
            </React.Fragment>
          ))}
        </footer>
      </div>

      {/* ================================================================ */}
      {/* RIGHT PANEL : marketing / value proposition (hidden < lg)        */}
      {/* ================================================================ */}
      <div
        className="hidden lg:flex flex-col justify-center relative overflow-hidden"
        style={{
          padding: 'clamp(40px, 6vh, 72px) clamp(40px, 5vw, 72px)',
          background: 'linear-gradient(170deg, hsl(210 55% 13%) 0%, hsl(205 60% 16%) 40%, hsl(201 65% 18%) 70%, hsl(210 55% 14%) 100%)',
        }}
      >
        {/* Ambient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute rounded-full"
            style={{
              width: '40vw', height: '40vw', maxWidth: '500px', maxHeight: '500px',
              top: '-15%', right: '-10%',
              background: 'radial-gradient(circle, hsl(166 72% 45%), transparent 70%)',
              opacity: 0.06,
              filter: 'blur(100px)',
              animation: 'cc-float 24s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '30vw', height: '30vw', maxWidth: '400px', maxHeight: '400px',
              bottom: '-10%', left: '-5%',
              background: 'radial-gradient(circle, hsl(201 80% 45%), transparent 70%)',
              opacity: 0.05,
              filter: 'blur(100px)',
              animation: 'cc-float 30s ease-in-out infinite reverse',
            }}
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[520px]">

          {/* Badge "Nouveau" */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            style={{
              marginBottom: 'clamp(16px, 2.5vh, 28px)',
              background: 'hsl(166 72% 45% / 0.1)',
              border: '1px solid hsl(166 72% 45% / 0.15)',
            }}
          >
            <Sparkles style={{ width: 'clamp(12px, 1.4vh, 14px)', height: 'clamp(12px, 1.4vh, 14px)', color: 'hsl(166 72% 55%)' }} />
            <span className="font-semibold uppercase tracking-wider" style={{ fontSize: 'clamp(9px, 1.1vh, 11px)', color: 'hsl(166 72% 60%)' }}>
              Nouveau
            </span>
          </div>

          {/* Main headline */}
          <h2
            className={`font-bold leading-tight transition-all duration-700 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ color: 'hsl(210 20% 97%)', fontSize: 'clamp(24px, 3.5vh, 40px)' }}
          >
            Votre vocation, c'est de soigner.
            <br />
            La notre, c'est de vous
            <br />
            simplifier le quotidien.
          </h2>

          {/* Subtitle - warm gold accent */}
          <p
            className={`leading-relaxed transition-all duration-700 delay-100 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              marginTop: 'clamp(12px, 1.8vh, 20px)',
              fontSize: 'clamp(13px, 1.6vh, 16px)',
              color: 'hsl(38 85% 65%)',
            }}
          >
            Chaque minute gagnee se transforme en temps medical de qualite.
            Concentrez-vous sur vos patients, on s'occupe du reste.
          </p>

          {/* 3 Benefits with arrows */}
          <div
            style={{ marginTop: 'clamp(24px, 3.5vh, 40px)', display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.8vh, 20px)' }}
          >
            {BENEFITS.map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? 'translateX(0)' : 'translateX(16px)',
                  transition: `opacity 0.5s ease-out ${200 + i * 150}ms, transform 0.5s ease-out ${200 + i * 150}ms`,
                }}
              >
                <ArrowRight
                  className="shrink-0"
                  style={{ width: 'clamp(16px, 2vh, 20px)', height: 'clamp(16px, 2vh, 20px)', color: 'hsl(166 72% 55%)' }}
                />
                <span
                  className="font-medium"
                  style={{ color: 'hsl(210 20% 92%)', fontSize: 'clamp(13px, 1.6vh, 16px)' }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA "Decouvrir" */}
          <button
            type="button"
            className={`
              inline-flex items-center gap-2 font-semibold rounded-lg
              hover:brightness-110 transition-all duration-300
              ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            style={{
              marginTop: 'clamp(24px, 3.5vh, 40px)',
              padding: 'clamp(10px, 1.4vh, 14px) clamp(20px, 2.5vw, 28px)',
              fontSize: 'clamp(12px, 1.5vh, 15px)',
              color: 'white',
              background: 'linear-gradient(135deg, hsl(201 80% 35%), hsl(201 80% 28%))',
              boxShadow: '0 4px 16px hsl(201 80% 40% / 0.25)',
              transitionDelay: '700ms',
            }}
            onClick={() => toast.info('Presentation de la plateforme disponible prochainement.')}
          >
            Decouvrir la plateforme
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>

          {/* Compliance footer */}
          <div
            className={`flex items-center gap-2 transition-all duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
            style={{ marginTop: 'clamp(28px, 4vh, 48px)', transitionDelay: '800ms' }}
          >
            <LockKeyhole style={{ width: 'clamp(12px, 1.4vh, 14px)', height: 'clamp(12px, 1.4vh, 14px)', color: 'hsl(166 72% 50% / 0.5)' }} />
            <span className="text-white/30 font-medium" style={{ fontSize: 'clamp(10px, 1.2vh, 12px)' }}>
              Donnees hebergees en France, conformement au RGPD, en serveurs certifies
            </span>
          </div>

          {/* Trust badges */}
          <div
            className={`flex items-center gap-2 transition-all duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
            style={{ marginTop: 'clamp(8px, 1vh, 12px)', transitionDelay: '900ms' }}
          >
            {['ISO 27001', 'RGPD', 'Chiffrement E2E'].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]"
                style={{ fontSize: 'clamp(8px, 1vh, 10px)' }}
              >
                <ShieldCheck className="text-[hsl(166,72%,50%)]/40" style={{ width: 'clamp(9px, 1.1vh, 11px)', height: 'clamp(9px, 1.1vh, 11px)' }} />
                <span className="text-white/25 font-medium">{badge}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframe for ambient orbs */}
      <style>{`
        @keyframes cc-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(12px, -18px) scale(1.02); }
          66% { transform: translate(-8px, 12px) scale(0.98); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
