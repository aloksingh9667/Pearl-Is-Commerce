import { SignIn } from "@clerk/react";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkAppearance = {
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "#D4AF37",
    colorForeground: "#0F0F0F",
    colorMutedForeground: "#6B6B6B",
    colorDanger: "#dc2626",
    colorBackground: "#FAF8F3",
    colorInput: "#ffffff",
    colorInputForeground: "#0F0F0F",
    colorNeutral: "#B89A4A",
    fontFamily: "'Poppins', sans-serif",
    borderRadius: "18px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "w-full max-w-[460px] overflow-hidden shadow-[0_24px_80px_rgba(15,15,15,0.08)] border border-[#D4AF37]/20 bg-white/80 backdrop-blur-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-3xl md:text-4xl tracking-wide text-[#0F0F0F]",
    headerSubtitle: "text-sm md:text-base text-[#6B6B6B] tracking-wide leading-6",
    socialButtonsBlockButton: "border border-[#D4AF37]/25 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 !rounded-xl transition-all h-11 md:h-12",
    socialButtonsBlockButtonText: "text-[#0F0F0F] text-sm font-medium",
    formFieldLabel: "text-[11px] uppercase tracking-[0.18em] text-[#0F0F0F]/70 font-semibold",
    formFieldInput: "!rounded-xl h-11 md:h-12 bg-white text-[#0F0F0F] border-[#E8DDC0] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25",
    formButtonPrimary: "bg-[#D4AF37] hover:bg-[#c7a436] text-white !rounded-xl uppercase tracking-[0.22em] text-[11px] md:text-xs h-11 md:h-12 font-semibold transition-colors shadow-[0_12px_24px_rgba(212,175,55,0.22)]",
    footerActionText: "text-[#6B6B6B] text-sm",
    footerActionLink: "text-[#D4AF37] hover:text-[#c7a436] font-semibold",
    dividerText: "text-[#6B6B6B] text-xs",
    dividerLine: "bg-[#D4AF37]/20",
    identityPreviewEditButton: "text-[#D4AF37]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-[#0F0F0F]",
    logoBox: "hidden",
    logoImage: "hidden",
    footerAction: "bg-transparent",
    alert: "!rounded-xl",
    otpCodeFieldInput: "!rounded-xl border-[#E8DDC0]",
    main: "px-5 sm:px-8 pt-6 pb-5",
  },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_35%),linear-gradient(180deg,#FAF8F3_0%,#FFFDF8_100%)] flex items-center justify-center px-4 py-10 sm:py-14 lg:py-16">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.15fr_0.85fr] overflow-hidden rounded-[2rem] border border-[#D4AF37]/15 bg-white/55 shadow-[0_24px_100px_rgba(15,15,15,0.08)] backdrop-blur-2xl">
        <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-[linear-gradient(180deg,rgba(15,15,15,0.96),rgba(30,24,14,0.96))] text-white relative">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.35),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_35%)]" />
          <div className="relative z-10">
            <Link href="/">
              <div className="inline-flex flex-col cursor-pointer">
                <div className="font-serif text-4xl tracking-[0.35em]">PEARLIS</div>
                <div className="text-[11px] tracking-[0.4em] uppercase text-[#D4AF37] mt-3">Luxury Jewellery House</div>
              </div>
            </Link>
            <div className="mt-16 max-w-md space-y-5">
              <h1 className="font-serif text-5xl leading-[1.05]">Welcome back to timeless elegance.</h1>
              <p className="text-white/70 text-base leading-7">
                Sign in to access your wishlist, orders, and personalized jewelry experience.
              </p>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-3 gap-4 text-sm text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Secure login</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fast checkout</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Premium support</div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10 xl:p-14">
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <div className="cursor-pointer">
                <div className="font-serif text-3xl tracking-[0.3em] text-[#0F0F0F]">PEARLIS</div>
                <div className="text-[10px] tracking-[0.35em] uppercase text-[#D4AF37] mt-2">Fine Jewellery</div>
              </div>
            </Link>
          </div>

          <SignIn
            routing="path"
            path={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
            fallbackRedirectUrl="/"
            appearance={clerkAppearance}
          />
        </div>
      </div>
    </div>
  );
}
