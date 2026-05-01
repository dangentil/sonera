import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);
const displayNameSchema = z.string().trim().min(2, "Mínimo 2 caracteres").max(50);

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  // signin
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // signup
  const [suDisplayName, setSuDisplayName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  useEffect(() => {
    if (!loading && session) navigate("/", { replace: true });
  }, [loading, session, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailSchema.safeParse(siEmail);
    const password = passwordSchema.safeParse(siPassword);
    if (!email.success) return toast({ title: "Erro", description: email.error.issues[0].message, variant: "destructive" });
    if (!password.success) return toast({ title: "Erro", description: password.error.issues[0].message, variant: "destructive" });
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.data, password: password.data });
    setBusy(false);
    if (error) return toast({ title: "Falha no login", description: error.message, variant: "destructive" });
    navigate("/", { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayNameSchema.safeParse(suDisplayName);
    const email = emailSchema.safeParse(suEmail);
    const password = passwordSchema.safeParse(suPassword);
    if (!name.success) return toast({ title: "Erro", description: name.error.issues[0].message, variant: "destructive" });
    if (!email.success) return toast({ title: "Erro", description: email.error.issues[0].message, variant: "destructive" });
    if (!password.success) return toast({ title: "Erro", description: password.error.issues[0].message, variant: "destructive" });
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.data,
      password: password.data,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: name.data },
      },
    });
    setBusy(false);
    if (error) return toast({ title: "Falha no cadastro", description: error.message, variant: "destructive" });
    toast({ title: "Bem-vindo ao Sonera!", description: "Sua conta foi criada." });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link
          to="/"
          className="block text-center text-foreground font-light text-2xl tracking-[0.3em] uppercase mb-8 hover:text-primary transition-colors"
          style={{ fontFamily: "'Merriweather', serif" }}
        >
          sonera
        </Link>

        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 mb-5">
              <TabsTrigger value="signin" className="text-[11px] tracking-[0.15em] uppercase">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="text-[11px] tracking-[0.15em] uppercase">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3">
                <Input type="email" placeholder="Email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)} className="h-10 text-sm" autoComplete="email" />
                <Input type="password" placeholder="Senha" value={siPassword} onChange={(e) => setSiPassword(e.target.value)} className="h-10 text-sm" autoComplete="current-password" />
                <Button type="submit" disabled={busy} className="w-full text-[11px] tracking-[0.15em] uppercase h-11">
                  {busy ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3">
                <Input placeholder="Nome de exibição" value={suDisplayName} onChange={(e) => setSuDisplayName(e.target.value)} className="h-10 text-sm" autoComplete="name" />
                <Input type="email" placeholder="Email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} className="h-10 text-sm" autoComplete="email" />
                <Input type="password" placeholder="Senha (mín. 6)" value={suPassword} onChange={(e) => setSuPassword(e.target.value)} className="h-10 text-sm" autoComplete="new-password" />
                <Button type="submit" disabled={busy} className="w-full text-[11px] tracking-[0.15em] uppercase h-11">
                  {busy ? "Criando..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;