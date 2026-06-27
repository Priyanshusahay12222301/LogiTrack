"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast, Toaster } from "sonner";
import { MoveUpRight, Hexagon, Truck, X, MapPin, Package, Clock } from "lucide-react";
import { auth, db } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Passcode must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getFirebaseErrorMessage(error: any) {
  const code = error.code;
  switch (code) {
    case "auth/user-not-found":
      return "No user found with this email.";
    case "auth/wrong-password":
      return "Incorrect passcode. Please try again.";
    case "auth/invalid-credential":
      return "Invalid credentials provided.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled in Firebase Console.";
    case "auth/invalid-api-key":
      return "Invalid API Key. Please check your .env.local.";
    default:
      return error.message || "Access denied. Please try again.";
  }
}

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [trackId, setTrackId] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackedShipment, setTrackedShipment] = useState<any>(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Gateway access granted.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickTrack(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!trackId.trim()) return;

    setTrackLoading(true);
    setTrackedShipment(null);
    setShowTrackModal(true);
    try {
      const id = trackId.trim();
      let docRef = doc(db, "shipments", id);
      let docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        docRef = doc(db, "shipments", id.toUpperCase());
        docSnap = await getDoc(docRef);
      }

      if (docSnap.exists()) {
        setTrackedShipment({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error("Shipment not found. Please check your AWB number.");
        setShowTrackModal(false);
      }
    } catch (err: any) {
      toast.error("Error retrieving shipment data. (Check Firebase Connection)");
      setShowTrackModal(false);
    } finally {
      setTrackLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-white/10 bg-black/60 text-sm text-primary placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors font-['Space_Grotesk']";

  return (
    <div className="min-h-screen text-primary overflow-x-hidden p-4 md:p-8 flex justify-center relative">
      <Toaster position="bottom-right" richColors closeButton theme="dark" />

      {/* Fixed Viewport Video Wrapper */}
      <div className="fixed inset-0 -z-50 h-screen w-screen overflow-hidden bg-black">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="h-full w-full object-cover opacity-30 grayscale brightness-75">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-a-highway-at-night-41584-large.mp4" type="video/mp4" />
        </video>

        {/* High-Tech Cyber Grid & Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Floating Shell Container (Translucent to show video) */}
      <div className="w-full max-w-[1600px] bg-background/75 backdrop-blur-md rounded-[2.5rem] ring-1 ring-white/10 shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Decorative Grid & Noise */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-15 pointer-events-none mix-blend-overlay z-0" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0" />
        
        {/* Navigation Header */}
        <header className="relative z-20 flex items-center justify-between p-6 md:px-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-black border-2 border-accent shadow-[0_0_15px_rgba(204,255,0,0.3)]">
              <img src="/logo.png" alt="LogiTrack Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-['Space_Grotesk'] font-bold text-lg tracking-tight">LOGITRACK</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 px-8 py-3 bg-white/[0.03] backdrop-blur-md rounded-full border border-white/10 font-['Space_Grotesk'] text-sm font-medium">
            <a href="#" className="text-white hover:text-accent transition-colors">Track</a>
            <a href="#" className="text-white hover:text-accent transition-colors">Dispatch</a>
            <a href="#" className="text-white hover:text-accent transition-colors">Fleet</a>
          </nav>

          <div className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]" />
            <span className="font-['JetBrains_Mono'] uppercase tracking-[0.15em] text-[10px] text-white/70">Global Ops Node</span>
          </div>
        </header>

        {/* HERO SECTION */}
        <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 p-6 md:px-12 md:py-16 items-center">
          
          {/* Left: Login Form (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <h1 className="text-5xl md:text-[5rem] font-bold font-['Space_Grotesk'] leading-[0.85] tracking-[-0.06em] mb-4">
                SMART <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white italic">
                  LOGISTICS
                </span>
              </h1>
              <p className="font-['JetBrains_Mono'] text-xs text-accent uppercase tracking-[0.2em] bg-accent/10 inline-block px-3 py-1 rounded border border-accent/20">
                Real-Time Shipment Intelligence
              </p>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-[20px] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] font-['JetBrains_Mono']">
                    Driver / Client ID
                  </label>
                  <input
                    type="email"
                    placeholder="hq@logitrack.network"
                    {...register("email")}
                    className={inputClass}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs">{errors.email.message}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] font-['JetBrains_Mono']">
                    Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    {...register("password")}
                    className={inputClass}
                  />
                  {errors.password && (
                    <span className="text-red-500 text-xs">{errors.password.message}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full py-4 rounded-full bg-accent hover:scale-[1.03] active:scale-[0.98] text-black font-bold text-sm tracking-[0.1em] transition-all cursor-pointer shadow-[0_0_30px_rgba(204,255,0,0.3)] disabled:opacity-50 font-['Space_Grotesk'] uppercase flex items-center justify-center gap-2"
                >
                  {loading ? "Verifying..." : "Partner Dispatch"} <MoveUpRight size={16} strokeWidth={3} />
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10">
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] font-['JetBrains_Mono'] block mb-2">
                  Quick Track Waybill
                </label>
                <form onSubmit={handleQuickTrack} className="flex gap-2">
                  <input 
                    type="text" 
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    placeholder="AWB-XXXXXXXXX" 
                    className={inputClass} 
                  />
                  <button 
                    type="submit" 
                    disabled={!trackId.trim()}
                    className="px-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/10 flex items-center justify-center disabled:opacity-50"
                  >
                    <MoveUpRight size={18} className="text-white" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Visualizer (7 cols) */}
          <div className="lg:col-span-7 h-[600px] relative rounded-[2rem] border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center">
            {/* Map lines mock */}
            <div className="absolute inset-0 opacity-30"
                 style={{
                   backgroundImage: `linear-gradient(to right, #ffffff0a 1px, transparent 1px), linear-gradient(to bottom, #ffffff0a 1px, transparent 1px)`,
                   backgroundSize: `40px 40px`
                 }} />
            
            {/* Realistic Map Design with UI Overlays */}
            <div className="absolute inset-0 w-full h-full z-10 overflow-hidden">
              
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15282225.799791289!2d73.7250245393691!3d20.750301298393563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30635ff06b92b791%3A0xd78c4fa1854213a6!2sIndia!5e0!3m2!1sen!2sus!4v1718000000000!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(0.3) opacity(0.85)' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full z-0 pointer-events-none"
              ></iframe>

              {/* Custom Map UI Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                
                {/* Floating Map Pins */}
                <div className="absolute top-[30%] left-[40%] flex flex-col items-center">
                  <div className="w-8 h-8 bg-emerald-500 rounded-t-full rounded-bl-full rotate-45 flex items-center justify-center shadow-lg border-2 border-white">
                    <div className="w-3 h-3 bg-white rounded-full -rotate-45" />
                  </div>
                </div>

                <div className="absolute top-[50%] left-[60%] flex flex-col items-center">
                  <div className="w-8 h-8 bg-accent rounded-t-full rounded-bl-full rotate-45 flex items-center justify-center shadow-lg border-2 border-black">
                    <div className="w-3 h-3 bg-black rounded-full -rotate-45" />
                  </div>
                </div>

                <div className="absolute top-[70%] left-[25%] flex flex-col items-center">
                  <div className="w-8 h-8 bg-emerald-500 rounded-t-full rounded-bl-full rotate-45 flex items-center justify-center shadow-lg border-2 border-white">
                    <div className="w-3 h-3 bg-white rounded-full -rotate-45" />
                  </div>
                </div>

                {/* Get Directions Button (Bottom Left) */}
                <div className="absolute bottom-6 left-6 pointer-events-auto">
                  <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-['Space_Grotesk'] font-medium px-6 py-3 rounded-xl shadow-lg transition-colors border border-white/20">
                    Get Directions
                    <MoveUpRight size={16} />
                  </button>
                </div>

                {/* Zoom Controls (Middle Right) */}
                <div className="absolute top-[40%] right-6 flex flex-col gap-2 pointer-events-auto">
                  <button className="w-10 h-10 bg-black/60 backdrop-blur-md text-white rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10 shadow-lg">
                    <span className="text-xl leading-none">+</span>
                  </button>
                  <button className="w-10 h-10 bg-black/60 backdrop-blur-md text-white rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10 shadow-lg">
                    <span className="text-xl leading-none">-</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Floating Waybill Card */}
            <div className="absolute bottom-10 right-10 z-30 bg-white/[0.03] backdrop-blur-[16px] border border-white/10 rounded-[1.5rem] p-5 w-64 float-anim" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-['JetBrains_Mono'] text-[10px] tracking-[0.2em] text-accent">FLEET IN TRANSIT</span>
              </div>
              <div className="font-['Space_Grotesk'] text-xl font-bold mb-1">AWB-847290</div>
              <div className="font-['JetBrains_Mono'] text-[10px] text-white/50 mb-4">Origin: LAX → Dest: JFK</div>
              <div className="flex gap-1">
                {Array.from({length: 15}).map((_, i) => (
                  <div key={i} className={`h-8 bg-white/70 rounded-sm ${i%3===0 ? 'w-1' : i%2===0 ? 'w-2' : 'w-0.5'}`} />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* BENTO GRID METRICS */}
        <section className="relative z-10 px-6 md:px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="md:col-span-2 md:row-span-2 bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 hover:border-accent/40 transition-colors group flex flex-col justify-between min-h-[300px]">
              <div>
                <h3 className="font-['Space_Grotesk'] text-2xl font-bold">Network Volume</h3>
                <p className="font-['JetBrains_Mono'] text-xs text-white/50 mt-1 uppercase tracking-wider">Active Shipments / 24H</p>
              </div>
              <div className="flex items-end gap-3 h-32 mt-6">
                {[40, 70, 45, 90, 65, 80, 100, 50, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/10 rounded-t-sm relative group-hover:bg-white/20 transition-colors" style={{ height: `${h}%` }}>
                    <div className="absolute bottom-0 w-full bg-accent rounded-t-sm transition-all duration-500 ease-out" style={{ height: `${h * 0.7}%` }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-1 md:row-span-2 bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 hover:border-accent/40 transition-colors flex flex-col gap-6">
              <h3 className="font-['Space_Grotesk'] text-xl font-bold">Transit Status</h3>
              <div className="flex flex-col gap-4 font-['JetBrains_Mono'] text-xs uppercase tracking-widest flex-1 justify-center">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/60">In-Transit</span>
                  <span className="text-accent">8,241</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/60">Out for Del</span>
                  <span className="text-white">1,490</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/60">Sorted</span>
                  <span className="text-emerald-500">4,302</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 md:row-span-1 bg-accent rounded-[2rem] p-6 text-black flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <p className="font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-70">Total Dispatched</p>
                <h3 className="font-['Space_Grotesk'] text-4xl font-bold tracking-tight">2.4M</h3>
                <p className="font-['Space_Grotesk'] font-medium text-sm mt-1">Tonnage this week</p>
              </div>
            </div>

            <div className="md:col-span-1 md:row-span-1 bg-emerald-500 rounded-[2rem] p-6 text-black flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
              <div className="relative z-10 flex justify-between items-center">
                 <div>
                   <p className="font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-70">Success Rate</p>
                   <h3 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight">99.8%</h3>
                 </div>
                 <Hexagon size={40} className="opacity-20" />
              </div>
            </div>

          </div>
        </section>

        {/* CONTRAST SECTION */}
        <section className="relative z-10 bg-primary text-black mt-20 rounded-t-[4rem] px-6 py-24 md:px-16 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold font-['Space_Grotesk'] tracking-[-0.04em] mb-12">
                Physical Supply Chain <br/> Synchronized.
              </h2>
              <div className="flex flex-col gap-8">
                {[
                  { id: "01", title: "Pick-Up", desc: "Automated routing to origin nodes." },
                  { id: "02", title: "Hub Transit", desc: "Long-haul telemetry and asset tracking." },
                  { id: "03", title: "Last Mile", desc: "Precision routing to final destination." },
                ].map((step) => (
                  <div key={step.id} className="flex items-start gap-6 group cursor-pointer">
                    <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center font-['JetBrains_Mono'] text-lg font-bold group-hover:bg-accent transition-colors shrink-0">
                      {step.id}
                    </div>
                    <div>
                      <h4 className="font-['Space_Grotesk'] text-2xl font-bold mb-1">{step.title}</h4>
                      <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest opacity-60">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[500px] rounded-[2rem] overflow-hidden bg-black flex items-end p-8">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop" alt="Cargo" className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-luminosity" />
              
              <div className="relative z-10 w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-accent">Manifest Loaded</span>
                  <MoveUpRight size={16} />
                </div>
                <h4 className="font-['Space_Grotesk'] text-xl font-bold mb-2">Freight #AX-992</h4>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[75%]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OVERSIZED FOOTER */}
        <footer className="relative z-10 bg-black pt-32 pb-10 px-6 md:px-16 overflow-hidden">
          <div className="absolute top-0 left-0 w-full select-none pointer-events-none overflow-hidden">
            <h1 className="text-[10rem] md:text-[18rem] font-bold font-['Space_Grotesk'] text-white/[0.03] leading-none whitespace-nowrap tracking-tighter">
              LOGISTICS
            </h1>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center mb-32">
             <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl font-bold mb-8 text-primary">Ready to initiate dispatch?</h2>
             <button className="px-10 py-5 rounded-full bg-accent text-black font-bold font-['JetBrains_Mono'] uppercase tracking-[0.1em] text-lg hover:bg-white transition-colors cursor-pointer shadow-[0_0_40px_rgba(204,255,0,0.2)]">
               Partner Dispatch
             </button>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-white/10 font-['JetBrains_Mono'] text-xs uppercase tracking-widest text-white/40">
            <div>
              <p className="font-bold text-white mb-4">Compliance</p>
              <ul className="flex flex-col gap-2">
                <li><a href="#" className="hover:text-accent transition-colors">ISO 27001 Certified</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Data Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Terms of Transport</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Operations</p>
              <ul className="flex flex-col gap-2">
                <li><a href="#" className="hover:text-accent transition-colors">Network Map</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Fleet API</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Support Node</a></li>
              </ul>
            </div>
            <div className="md:text-right">
              <p>&copy; 2026 LOGITRACK NETWORK</p>
              <p className="mt-2 text-[10px]">ALL SYSTEMS NOMINAL.</p>
            </div>
          </div>
        </footer>

      </div>

      {/* Quick Track Modal Overlay */}
      {showTrackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowTrackModal(false)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">Track Result</h3>
                <p className="text-xs text-white/50 font-['JetBrains_Mono']">{trackId}</p>
              </div>
            </div>

            {trackLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <p className="text-xs text-white/50 font-['JetBrains_Mono'] tracking-widest uppercase animate-pulse">Scanning Network...</p>
              </div>
            ) : trackedShipment ? (
              <div className="flex flex-col gap-5">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-['JetBrains_Mono']">Status</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded bg-white/10 ${
                      trackedShipment.status === 'Delivered' ? 'text-emerald-400' :
                      trackedShipment.status === 'In Transit' ? 'text-accent' :
                      trackedShipment.status === 'Delayed' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {trackedShipment.status || 'Unknown'}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white font-['Space_Grotesk']">{trackedShipment.id}</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <MapPin size={14} className="text-white/40 mb-2" />
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-['JetBrains_Mono'] mb-1">Origin</p>
                    <p className="text-sm font-medium text-white truncate">{trackedShipment.senderCity || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <MapPin size={14} className="text-accent mb-2" />
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-['JetBrains_Mono'] mb-1">Destination</p>
                    <p className="text-sm font-medium text-white truncate">{trackedShipment.receiverCity || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/40">
                    <Package size={14} />
                    <span className="text-xs font-['JetBrains_Mono']">Weight</span>
                  </div>
                  <span className="text-sm font-medium text-white">{trackedShipment.weight ? `${trackedShipment.weight} kg` : 'N/A'}</span>
                </div>
                
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/40">
                    <Clock size={14} />
                    <span className="text-xs font-['JetBrains_Mono']">Est. Delivery</span>
                  </div>
                  <span className="text-sm font-medium text-white">{trackedShipment.estimatedDelivery || 'Pending'}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
