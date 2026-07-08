"use client";

const signatureFood = "/assets/signature-dish.png";

export default function Hero() {
  return (
    <section className="relative min-h-[100vh] w-full overflow-hidden bg-[#0d0404] flex items-center pt-32 pb-20">
      {/* Dynamic Chinese Theme Background Gradients */}
      <div className="absolute top-0 right-0 -mr-[10%] -mt-[10%] w-[60%] h-[70%] rounded-full bg-red-800/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-[10%] -mb-[10%] w-[50%] h-[50%] rounded-full bg-gold/10 blur-[100px] pointer-events-none" />
      
      {/* Faint Background Character for Chinese Vibe */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] lg:text-[40rem] font-serif text-red-900/5 select-none pointer-events-none z-0">
        鲜
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        
        {/* Left Content */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          
          <h1 className="reveal font-serif text-5xl leading-[1.1] md:text-7xl xl:text-8xl text-foreground drop-shadow-xl">
            Scan. Order.<br/>
            <em className="text-gradient-gold not-italic">Enjoy.</em>
          </h1>
          
          <p className="reveal mt-6 max-w-lg text-base text-foreground/75 md:text-lg">
            Experience the true taste of oriental cuisine. Browse our digital menu, customize your dishes, and order directly from your table effortlessly.
          </p>
          
          <div className="reveal mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="/menu"
              className="w-full sm:w-auto rounded-full bg-gradient-gold px-10 py-4 text-base font-bold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-1 text-center"
            >
              Browse Menu
            </a>
            <button
              onClick={() => alert("Waiter has been called to your table!")}
              className="w-full sm:w-auto rounded-full border border-red-500/30 bg-red-900/20 px-10 py-4 text-base font-bold text-red-100 backdrop-blur-md transition-all hover:bg-red-900/40 hover:border-red-500 hover:-translate-y-1 text-center flex items-center justify-center gap-2"
            >
              <span>🔔</span> Call Waiter
            </button>
          </div>
          
          {/* Highlights */}
          <div className="reveal mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 border-t border-red-900/30 pt-8 w-full">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-950/40 flex items-center justify-center text-red-400 text-xl border border-red-500/20">🥢</div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">Visual Menu</p>
                <p className="text-[10px] uppercase tracking-wider text-foreground/50 mt-0.5">See before you order</p>
              </div>
            </div>
            <div className="w-px h-10 bg-red-900/30 hidden sm:block"></div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-950/40 flex items-center justify-center text-red-400 text-xl border border-red-500/20">🔥</div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">Wok Hei</p>
                <p className="text-[10px] uppercase tracking-wider text-foreground/50 mt-0.5">Fresh from the kitchen</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Image Display */}
        <div className="reveal relative flex mt-12 lg:mt-0 h-full w-full items-center justify-center">
          
          {/* Glowing backdrop circle */}
          <div className="absolute w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] rounded-full border border-red-500/10 bg-red-900/10 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
          
          <div className="relative w-full h-[400px] lg:h-[500px] flex justify-center items-center scale-[0.65] sm:scale-[0.85] md:scale-90 lg:scale-100 origin-center">
            
            {/* Image 1: Main Center Arch */}
            <div className="absolute z-20 w-[260px] h-[360px] rounded-t-full rounded-b-3xl overflow-hidden border-[6px] border-[#0d0404] shadow-2xl animate-[float_6s_ease-in-out_infinite]">
              <img src="/assets/dish-1.jpg" alt="Signature Chinese Dish" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-0 w-full text-center">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs text-gold border border-gold/30">Chef's Special</span>
              </div>
            </div>

            {/* Image 2: Left Circle */}
            <div className="absolute z-10 w-[200px] h-[200px] rounded-full overflow-hidden border-[6px] border-[#0d0404] shadow-2xl right-[55%] top-[40%] animate-[float_5s_ease-in-out_infinite_0.5s]">
              <img src="/assets/dish-2.jpg" alt="Appetizer" className="w-full h-full object-cover" />
            </div>

            {/* Image 3: Right Rectangle */}
            <div className="absolute z-30 w-[180px] h-[240px] rounded-3xl overflow-hidden border-[6px] border-[#0d0404] shadow-2xl left-[55%] top-[10%] animate-[float_7s_ease-in-out_infinite_1s]">
              <img src="/assets/dish-3.jpg" alt="Specialty" className="w-full h-full object-cover" />
            </div>
            
            {/* Floating glass card */}
            <div className="absolute bottom-2 right-2 sm:bottom-8 sm:right-12 z-40 glass rounded-2xl p-4 shadow-[var(--shadow-elegant)] animate-[fade-up_1.5s_ease-out_forwards] border border-red-500/20 bg-background/80 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center bg-red-500/20 p-2.5 rounded-full text-red-500 border border-red-500/30">
                  <span className="text-lg">🌶️</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Sichuan Spice</p>
                  <p className="text-[10px] text-foreground/60 uppercase tracking-widest mt-1">Authentic Flavor</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
