import { SignUp } from "@clerk/react";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center px-4 py-16">
      <Link href="/">
        <div className="text-center mb-10 cursor-pointer">
          <div className="font-serif text-3xl tracking-[0.3em] text-[#0F0F0F]">PEARLIS</div>
          <div className="text-[10px] tracking-[0.35em] uppercase text-[#D4AF37] mt-1">Fine Jewellery</div>
        </div>
      </Link>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl="/"
        appearance={{
          cssLayerName: "clerk",
          variables: {
            colorPrimary: "#D4AF37",
            colorForeground: "#0F0F0F",
            colorMutedForeground: "#6b6b6b",
            colorDanger: "#dc2626",
            colorBackground: "#FAF8F3",
            colorInput: "#ffffff",
            colorInputForeground: "#0F0F0F",
            colorNeutral: "#0F0F0F",
            fontFamily: "'Poppins', sans-serif",
            borderRadius: "0px",
          },
          elements: {
            rootBox: "w-full flex justify-center",
            cardBox: "w-[420px] max-w-full overflow-hidden shadow-none border border-[#D4AF37]/20",
            card: "!shadow-none !border-0 !bg-[#FAF8F3] !rounded-none",
            footer: "!shadow-none !border-0 !bg-[#FAF8F3] !rounded-none",
            headerTitle: "font-serif text-2xl tracking-wide text-[#0F0F0F]",
            headerSubtitle: "text-sm text-[#6b6b6b] tracking-wide",
            socialButtonsBlockButton: "border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 !rounded-none transition-all",
            socialButtonsBlockButtonText: "text-[#0F0F0F] text-sm font-medium",
            formFieldLabel: "text-[11px] uppercase tracking-[0.15em] text-[#0F0F0F]/70 font-semibold",
            formFieldInput: "border-border !rounded-none h-11 bg-white text-[#0F0F0F] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]",
            formButtonPrimary: "bg-[#D4AF37] hover:bg-[#c4a02f] text-white !rounded-none uppercase tracking-widest text-xs h-11 font-semibold transition-colors",
            footerActionText: "text-[#6b6b6b] text-sm",
            footerActionLink: "text-[#D4AF37] hover:text-[#c4a02f] font-semibold",
            dividerText: "text-[#6b6b6b] text-xs",
            dividerLine: "bg-[#D4AF37]/20",
            identityPreviewEditButton: "text-[#D4AF37]",
            formFieldSuccessText: "text-green-600",
            alertText: "text-[#0F0F0F]",
            logoBox: "hidden",
            logoImage: "hidden",
            footerAction: "bg-[#FAF8F3]",
            alert: "!rounded-none",
            otpCodeFieldInput: "!rounded-none border-border",
            main: "px-8 pt-6 pb-4",
          },
        }}
      />
      <p className="mt-6 text-center text-xs text-[#0F0F0F]/40 uppercase tracking-widest">
        Secure & Encrypted
      </p>
    </div>
  );
}
