import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Thank you for contacting Pearlis. Our concierge will be in touch shortly.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl mb-4">Concierge</h1>
          <div className="w-16 h-px bg-accent mx-auto mb-6"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our dedicated team is at your disposal for styling advice, bespoke requests, or any assistance you may require.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 max-w-6xl mx-auto">
          <div className="lg:w-1/2">
            <h2 className="font-serif text-2xl mb-8">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="uppercase tracking-widest text-xs">First Name</Label>
                  <Input id="firstName" required className="rounded-none h-12 border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="uppercase tracking-widest text-xs">Last Name</Label>
                  <Input id="lastName" required className="rounded-none h-12 border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="uppercase tracking-widest text-xs">Email</Label>
                <Input id="email" type="email" required className="rounded-none h-12 border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="uppercase tracking-widest text-xs">Subject</Label>
                <Input id="subject" required className="rounded-none h-12 border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="uppercase tracking-widest text-xs">Message</Label>
                <Textarea id="message" required className="rounded-none min-h-[150px] border-border" />
              </div>
              <Button type="submit" className="rounded-none h-12 px-8 uppercase tracking-widest w-full md:w-auto">
                Send Message
              </Button>
            </form>
          </div>

          <div className="lg:w-1/2 space-y-12">
            <div>
              <h2 className="font-serif text-2xl mb-6">The Atelier</h2>
              <div className="text-muted-foreground space-y-2">
                <p>124 Luxury Lane</p>
                <p>New York, NY 10012</p>
                <p>United States</p>
              </div>
            </div>
            
            <div>
              <h2 className="font-serif text-2xl mb-6">Contact</h2>
              <div className="text-muted-foreground space-y-2">
                <p>Email: concierge@pearlis.com</p>
                <p>Phone: +1 (800) 555-0199</p>
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl mb-6">Hours</h2>
              <div className="text-muted-foreground space-y-2">
                <p>Monday - Friday: 10am - 7pm EST</p>
                <p>Saturday: 11am - 6pm EST</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
