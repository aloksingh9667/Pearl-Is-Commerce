import { useState } from "react";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const registerMutation = useRegisterUser();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      { data: { name, email, password } },
      {
        onSuccess: (data) => {
          login(data.token);
          toast({ title: "Welcome to Pearlis", description: "Your account has been created successfully." });
          setLocation("/");
        },
        onError: (err: any) => {
          toast({ 
            title: "Registration Failed", 
            description: err.message || "An error occurred",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="font-serif text-3xl tracking-widest mb-6">PEARLIS</h1>
          </Link>
          <h2 className="text-2xl font-serif">Create an Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="uppercase tracking-widest text-xs">Full Name</Label>
            <Input 
              id="name" 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              className="rounded-none h-12 border-border focus-visible:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="uppercase tracking-widest text-xs">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="rounded-none h-12 border-border focus-visible:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="uppercase tracking-widest text-xs">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="rounded-none h-12 border-border focus-visible:ring-accent"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full rounded-none h-12 uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-foreground hover:text-accent underline underline-offset-4">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
