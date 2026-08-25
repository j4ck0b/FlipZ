import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen selection:bg-secondary selection:text-white">
      
      {/* 1. Header Navigation */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high">
        <div className="h-20 max-w-[1280px] mx-auto px-6 lg:px-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-base shadow-sm">
              FZ
            </div>
            <span className="font-extrabold text-2xl text-on-surface tracking-tight">FlipCardZ</span>
          </Link>

          <nav className="hidden xl:flex items-center gap-8 font-medium text-sm">
            <Link to="/" className="text-secondary font-semibold underline underline-offset-8">
              Home
            </Link>
            <Link to="/card-exchange" className="text-on-surface-variant hover:text-on-surface transition-colors">
              Przeglądaj Kategorie
            </Link>
            <a href="#how-it-works" className="text-on-surface-variant hover:text-on-surface transition-colors">
              Jak to działa
            </a>
            <Link 
              to="/card-exchange" 
              className="px-5 py-2 bg-secondary text-on-secondary font-semibold text-xs rounded-xl hover:bg-on-secondary-fixed-variant transition-all shadow-sm"
            >
              Rozpocznij Wymianę
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface text-sm font-medium">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <span className="hidden sm:inline">Zaloguj się</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full relative overflow-hidden">
          
          {/* Ambient Background Effect */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-fixed/20 rounded-full blur-[120px] mix-blend-multiply opacity-50"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary-fixed/20 rounded-full blur-[150px] mix-blend-multiply opacity-40"></div>
          </div>

          {/* Hero Section */}
          <section className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-10 pt-16 pb-24 flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-full mb-8 shadow-sm">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Instytucjonalne Bezpieczeństwo Escrow
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-[64px] md:leading-[72px] font-extrabold text-on-surface max-w-4xl tracking-tight mb-6">
              Bezpieczna wymiana <br/>
              <span className="text-secondary relative whitespace-nowrap">
                przedmiot-za-przedmiot
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary-container opacity-50" fill="none" preserveAspectRatio="none" viewBox="0 0 200 12">
                  <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                </svg>
              </span>
            </h1>

            <p className="text-lg text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
              FlipCardZ zapewnia całkowity spokój podczas handlu wartościowymi aktywami. Nasz protokół Escrow chroni obie strony transakcji do momentu fizycznego potwierdzenia autentyczności w Hubie.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                to="/login" 
                className="px-8 py-4 bg-primary text-on-primary rounded-xl font-semibold text-base shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:bg-inverse-surface transition-all transform hover:-translate-y-1"
              >
                Rozpocznij Wymianę
              </Link>
              <a 
                href="#how-it-works" 
                className="px-8 py-4 bg-surface-container text-on-surface rounded-xl font-semibold text-base hover:bg-surface-container-high transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">play_circle</span>
                Jak to działa
              </a>
            </div>

            {/* Trust Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-10 items-center">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-on-surface">100%</span>
                <span className="text-xs font-semibold text-on-surface-variant uppercase mt-1">Gwarancja Escrow</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-on-surface">50k+</span>
                <span className="text-xs font-semibold text-on-surface-variant uppercase mt-1">Użytkowników</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-on-surface">0 PLN</span>
                <span className="text-xs font-semibold text-on-surface-variant uppercase mt-1">Ukrytych Opłat</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-on-surface">24/7</span>
                <span className="text-xs font-semibold text-on-surface-variant uppercase mt-1">Wsparcie Biegłych</span>
              </div>
              <div className="flex flex-col items-center col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-6">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                  </span>
                  <span className="text-3xl font-extrabold text-on-surface">1,284</span>
                </div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase mt-1">Aktywnych Ofert</span>
              </div>
            </div>
          </section>

          {/* Live Activity Ticker Bar */}
          <section className="w-full max-w-[1280px] mx-auto px-6 lg:px-10 mb-12">
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/50 flex items-center gap-6 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 shrink-0">
                <span className="material-symbols-outlined text-secondary animate-pulse">sensors</span>
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">Na Żywo</span>
              </div>
              <div className="h-6 w-[1px] bg-outline-variant shrink-0"></div>
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-8 animate-scroll-marquee whitespace-nowrap">
                  <span className="text-sm text-on-surface-variant"><strong className="text-on-surface">@Kolekcjoner99</strong> właśnie dodał <span className="text-secondary font-medium">Charizard Base Set</span> do wymiany</span>
                  <span className="text-sm text-on-surface-variant"><strong className="text-on-surface">@VinylMaster</strong> szuka <span className="text-secondary font-medium">Pink Floyd - The Wall</span></span>
                  <span className="text-sm text-on-surface-variant"><strong className="text-on-surface">@HotWheelsPL</strong> zakończył wymianę z <strong className="text-on-surface">@User_42</strong></span>
                  <span className="text-sm text-on-surface-variant"><strong className="text-on-surface">@CardVault_EU</strong> wystawił <span className="text-secondary font-medium">Michael Jordan Rookie PSA 10</span></span>
                  <span className="text-sm text-on-surface-variant"><strong className="text-on-surface">@Kolekcjoner99</strong> właśnie dodał <span className="text-secondary font-medium">Charizard Base Set</span> do wymiany</span>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Bento Grid */}
          <section className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-10 py-12">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-on-surface mb-2">Kategorie Premium</h2>
                <p className="text-base text-on-surface-variant">Przeglądaj najpopularniejsze rynki kolekcjonerskie zabezpieczone przez FlipCardZ.</p>
              </div>
              <Link to="/card-exchange" className="hidden md:flex items-center gap-2 text-secondary font-semibold hover:text-on-secondary-fixed-variant transition-colors">
                Zobacz wszystkie <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
              {/* Cards (Large Bento Item) */}
              <div 
                onClick={() => navigate('/card-exchange')}
                className="md:col-span-8 row-span-2 group relative rounded-2xl overflow-hidden bg-surface-container-low shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent z-10"></div>
                <img 
                  alt="Trading Cards" 
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5wVAjWqJeCV38HRQ_uX5fn7j_nv8UwJjwXQJLJXXflUfQfn_ECpyj_EtwTKsLvG924h1lzzC14LiUQ2f1wCq9_OhXcin83Zpgcx95B_D9YxF1xfwqdzCG6oPlqVHnTuWS1JsiYTNN_cfM3HqeuNEme-9PnXjEaBGXdmZLtWH5AwL_k8sYKbq7W3Z4ZvI-AkJvxLUs3u5GCalbG9n5TsKHo0_2jtbhL22vG2JrnYaZqYlJTPjL3JpV"
                />
                <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface/20 backdrop-blur-md rounded-lg mb-3">
                        <span className="material-symbols-outlined text-on-primary text-[14px]">style</span>
                        <span className="text-xs font-semibold text-on-primary uppercase tracking-wider">Karty Kolekcjonerskie</span>
                      </div>
                      <h3 className="text-3xl font-extrabold text-on-primary">TCG & Sports Cards</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-on-primary/20 backdrop-blur-md flex items-center justify-center group-hover:bg-on-primary group-hover:text-primary text-on-primary transition-colors">
                      <span className="material-symbols-outlined">north_east</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vinyls */}
              <div 
                onClick={() => navigate('/collectible-exchange')}
                className="md:col-span-4 row-span-1 group relative rounded-2xl overflow-hidden bg-surface-container shadow-sm hover:shadow-md transition-all duration-500 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-10"></div>
                <img 
                  alt="Vinyl Records" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATf02fVWMwLwsMF8yW8tSVH7rYmSvOivhTyuHXAm8OwNf4A9fb3V2u7HEc2cgSq8ZqcvtRcXFkYOUUD_2j6e9c9MSwBB1EryK7BsZV9TROTblS9977C2yROjeEcG4ueLnQ1AHywCVjR0FG0BF_BThi1M-OuYlym_wO39cvKg38Ow1BALZjClIyO1CUc0FZULULptDAkpRQclYqRW6C0sT9uPUVnA4YWlv0y7aH8RqH_ehVqI_V-EEW"
                />
                <div className="absolute bottom-0 left-0 p-6 z-20">
                  <h3 className="text-xl font-bold text-on-primary mb-1">Płyty Winylowe</h3>
                  <p className="text-sm text-on-primary/80">Rzadkie tłoczenia i edycje limitowane</p>
                </div>
              </div>

              {/* Hot Wheels / Diecast */}
              <div 
                onClick={() => navigate('/diecast-exchange')}
                className="md:col-span-4 row-span-1 group relative rounded-2xl overflow-hidden bg-surface-container shadow-sm hover:shadow-md transition-all duration-500 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-10"></div>
                <img 
                  alt="Hot Wheels" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRAbf3ZyfT4qo2Q_LDzf6udJ2_9jsgh9zlJJrnNuUO3NcZdC0VMLucs4cRIHe0FpQawiMY_KwHzSDQyWLfBeGtkmdXCUzMSGFuWG6J1B3Sj2lGiHuwGvLg_SZzXseW3ugVZoIJndmL3I5uSMmKBJTHwpmT26KruK91dMM2QXejrWpvhCfZcTQ7YhiH125GF5-F-UNCmuRt04ufNQwIgFUZvxyoVS4VJZU-w-j7lQI7Eeu5SHz-_1d9"
                />
                <div className="absolute bottom-0 left-0 p-6 z-20">
                  <h3 className="text-xl font-bold text-on-primary mb-1">Modele & Hot Wheels</h3>
                  <p className="text-sm text-on-primary/80">Die-cast i figury kolekcjonerskie</p>
                </div>
              </div>
            </div>
          </section>

          {/* Process / Trust Section: How it Works */}
          <section id="how-it-works" className="w-full bg-surface-container-lowest py-24 relative z-10 border-y border-outline-variant/30">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface mb-4">
                    Wymiana bez ryzyka. <br/> Krok po kroku.
                  </h2>
                  <p className="text-base text-on-surface-variant mb-10 leading-relaxed">
                    Nasz rygorystyczny proces Escrow zapewnia, że nikt nie traci swoich aktywów. Środki lub przedmioty są uwalniane dopiero po potrójnej weryfikacji w centralnym Hubie.
                  </p>
                  
                  <div className="space-y-8 relative before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-variant">
                    {/* Step 1 */}
                    <div className="flex gap-6 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-base flex-shrink-0 shadow-[0_0_15px_rgba(55,85,195,0.3)]">
                        1
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-on-surface mb-1">Zdeponuj Przedmiot</h4>
                        <p className="text-sm text-on-surface-variant">Obie strony wysyłają przedmioty do certyfikowanego huba FlipCardZ.</p>
                      </div>
                    </div>
                    {/* Step 2 */}
                    <div className="flex gap-6 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-base flex-shrink-0 border-2 border-surface-variant">
                        2
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-on-surface mb-1">Weryfikacja Autentyczności</h4>
                        <p className="text-sm text-on-surface-variant">Nasi eksperci sprawdzają stan, grubość, wagę analityczną i oryginalność obu przedmiotów.</p>
                      </div>
                    </div>
                    {/* Step 3 */}
                    <div className="flex gap-6 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-base flex-shrink-0 border-2 border-surface-variant">
                        3
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-on-surface mb-1">Bezpieczna Wysyłka</h4>
                        <p className="text-sm text-on-surface-variant">Po zatwierdzeniu, przedmioty są ubezpieczone i wysyłane do nowych właścicieli z plombą VOID.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual representation card */}
                <div className="relative bg-surface-container rounded-3xl p-8 flex items-center justify-center min-h-[400px] shadow-sm overflow-hidden border border-outline-variant/40">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-fixed/30 to-transparent opacity-50"></div>
                  
                  <div className="relative z-10 w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-outline-variant/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status Transakcji</span>
                      <span className="px-2.5 py-1 bg-secondary/10 text-secondary font-bold rounded-md text-xs">W Toku</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="w-20 h-24 bg-surface-container rounded-lg bg-cover bg-center border border-outline-variant/40" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5wVAjWqJeCV38HRQ_uX5fn7j_nv8UwJjwXQJLJXXflUfQfn_ECpyj_EtwTKsLvG924h1lzzC14LiUQ2f1wCq9_OhXcin83Zpgcx95B_D9YxF1xfwqdzCG6oPlqVHnTuWS1JsiYTNN_cfM3HqeuNEme-9PnXjEaBGXdmZLtWH5AwL_k8sYKbq7W3Z4ZvI-AkJvxLUs3u5GCalbG9n5TsKHo0_2jtbhL22vG2JrnYaZqYlJTPjL3JpV')" }}></div>
                      
                      <div className="flex-1 h-0 border-t-2 border-dashed border-outline-variant relative">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 material-symbols-outlined text-secondary bg-surface-container-lowest px-1.5">sync_alt</span>
                      </div>

                      <div className="w-20 h-24 bg-surface-container rounded-lg bg-cover bg-center border border-outline-variant/40" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuATf02fVWMwLwsMF8yW8tSVH7rYmSvOivhTyuHXAm8OwNf4A9fb3V2u7HEc2cgSq8ZqcvtRcXFkYOUUD_2j6e9c9MSwBB1EryK7BsZV9TROTblS9977C2yROjeEcG4ueLnQ1AHywCVjR0FG0BF_BThi1M-OuYlym_wO39cvKg38Ow1BALZjClIyO1CUc0FZULULptDAkpRQclYqRW6C0sT9uPUVnA4YWlv0y7aH8RqH_ehVqI_V-EEW')" }}></div>
                    </div>

                    <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden mt-4">
                      <div className="bg-secondary w-1/2 h-full rounded-full relative">
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:20px_20px] animate-progress-stripe"></div>
                      </div>
                    </div>
                    
                    <p className="text-center text-xs font-semibold text-on-surface-variant mt-1">Weryfikacja laboratoryjna w toku...</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Standards Section */}
          <section className="py-20 px-6 lg:px-10 max-w-[1280px] mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface">Transparentne Standardy Escrow</h2>
              <p className="text-base text-on-surface-variant">Stała opłata per strona transakcji. Zero ukrytych kosztów.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-8 space-y-6 shadow-sm">
                <div>
                  <h4 className="font-bold text-xl text-on-surface">Standard Escrow</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Dla kart do 1 000 zł</p>
                </div>
                <div className="text-4xl font-extrabold text-on-surface">45 zł <span className="text-sm font-normal text-on-surface-variant">/ stronę</span></div>
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Etykiety InPost w obie strony</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Test optyczny UV 365 nm</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Weryfikacja wagi analitycznej</li>
                </ul>
              </div>

              <div className="bg-surface-container-lowest border-2 border-secondary rounded-2xl p-8 space-y-6 relative shadow-xl">
                <span className="absolute -top-3.5 right-6 bg-secondary text-on-secondary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Rekomendowany
                </span>
                <div>
                  <h4 className="font-bold text-xl text-on-surface">Swiss Safe</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Dla rzadkich okazów i graded cards</p>
                </div>
                <div className="text-4xl font-extrabold text-on-surface">69 zł <span className="text-sm font-normal text-on-surface-variant">/ stronę</span></div>
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Wszystko ze Standard Escrow</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Pomiar grubości mikrometrem</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Plomba VOID + Cyfrowy Certyfikat SHA-256</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Realizacja w Hubie do 24h</li>
                </ul>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-8 space-y-6 shadow-sm">
                <div>
                  <h4 className="font-bold text-xl text-on-surface">Vault Black</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Dla kart High-End & Grails</p>
                </div>
                <div className="text-4xl font-extrabold text-on-surface">99 zł <span className="text-sm font-normal text-on-surface-variant">/ stronę</span></div>
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Ciągłe nagranie wideo 4K z inspekcji</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Smart-Box z chipem NFC</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span> Pełne ubezpieczenie transakcji</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Recent Trades Marquee */}
          <section className="w-full py-16 overflow-hidden bg-surface-container-low border-t border-outline-variant/30">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-10 mb-8">
              <h3 className="text-2xl font-bold text-on-surface">Log Ostatnich Transakcji</h3>
            </div>
            
            <div className="flex gap-6 w-max animate-scroll-marquee hover:[animation-play-state:paused] px-6">
              {/* Item 1 */}
              <div className="w-80 bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-4 border border-outline-variant/30">
                <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5wVAjWqJeCV38HRQ_uX5fn7j_nv8UwJjwXQJLJXXflUfQfn_ECpyj_EtwTKsLvG924h1lzzC14LiUQ2f1wCq9_OhXcin83Zpgcx95B_D9YxF1xfwqdzCG6oPlqVHnTuWS1JsiYTNN_cfM3HqeuNEme-9PnXjEaBGXdmZLtWH5AwL_k8sYKbq7W3Z4ZvI-AkJvxLUs3u5GCalbG9n5TsKHo0_2jtbhL22vG2JrnYaZqYlJTPjL3JpV" alt="Charizard" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">Charizard Base Set</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary">done_all</span> Zweryfikowano
                    <span className="ml-auto text-[10px] opacity-60">2 min temu</span>
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="w-80 bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-4 border border-outline-variant/30">
                <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRAbf3ZyfT4qo2Q_LDzf6udJ2_9jsgh9zlJJrnNuUO3NcZdC0VMLucs4cRIHe0FpQawiMY_KwHzSDQyWLfBeGtkmdXCUzMSGFuWG6J1B3Sj2lGiHuwGvLg_SZzXseW3ugVZoIJndmL3I5uSMmKBJTHwpmT26KruK91dMM2QXejrWpvhCfZcTQ7YhiH125GF5-F-UNCmuRt04ufNQwIgFUZvxyoVS4VJZU-w-j7lQI7Eeu5SHz-_1d9" alt="Skyline" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">RLC Skyline R34</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary">done_all</span> Zweryfikowano
                    <span className="ml-auto text-[10px] opacity-60">2 min temu</span>
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="w-80 bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-4 border border-outline-variant/30">
                <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATf02fVWMwLwsMF8yW8tSVH7rYmSvOivhTyuHXAm8OwNf4A9fb3V2u7HEc2cgSq8ZqcvtRcXFkYOUUD_2j6e9c9MSwBB1EryK7BsZV9TROTblS9977C2yROjeEcG4ueLnQ1AHywCVjR0FG0BF_BThi1M-OuYlym_wO39cvKg38Ow1BALZjClIyO1CUc0FZULULptDAkpRQclYqRW6C0sT9uPUVnA4YWlv0y7aH8RqH_ehVqI_V-EEW" alt="Vinyl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">Pink Floyd First Press</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary">done_all</span> Zweryfikowano
                    <span className="ml-auto text-[10px] opacity-60">5 min temu</span>
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="w-80 bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-4 border border-outline-variant/30">
                <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5wVAjWqJeCV38HRQ_uX5fn7j_nv8UwJjwXQJLJXXflUfQfn_ECpyj_EtwTKsLvG924h1lzzC14LiUQ2f1wCq9_OhXcin83Zpgcx95B_D9YxF1xfwqdzCG6oPlqVHnTuWS1JsiYTNN_cfM3HqeuNEme-9PnXjEaBGXdmZLtWH5AwL_k8sYKbq7W3Z4ZvI-AkJvxLUs3u5GCalbG9n5TsKHo0_2jtbhL22vG2JrnYaZqYlJTPjL3JpV" alt="Pikachu" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">Pikachu Illustrator</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary">done_all</span> Zweryfikowano
                    <span className="ml-auto text-[10px] opacity-60">8 min temu</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-primary-container text-on-primary-container pt-16 pb-12">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-white text-slate-950 flex items-center justify-center font-bold text-xs">
                FZ
              </div>
              <span className="font-bold text-xl text-on-primary">FlipCardZ Escrow</span>
            </div>
            <p className="text-sm text-on-primary-container max-w-sm mb-6 leading-relaxed">
              Instytucjonalne bezpieczeństwo dla kolekcjonerów. FlipCardZ zapewnia najbezpieczniejszy ekosystem do wymiany rzadkich aktywów z pełnym spokojem.
            </p>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-secondary/20 px-3 py-1.5 rounded-lg border border-secondary/30">
                <span className="material-symbols-outlined text-[18px] text-secondary-container">verified_user</span>
                <span className="text-xs font-semibold text-on-secondary-fixed">Escrow Guaranteed</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-on-primary mb-4 text-sm uppercase tracking-wider">Kategorie</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-on-primary cursor-pointer"><Link to="/card-exchange">Trading Cards (TCG)</Link></li>
              <li className="hover:text-on-primary cursor-pointer"><Link to="/collectible-exchange">Vinyls & Media</Link></li>
              <li className="hover:text-on-primary cursor-pointer"><Link to="/diecast-exchange">Hot Wheels & Diecast</Link></li>
              <li className="hover:text-on-primary cursor-pointer"><Link to="/figure-exchange">Figurki & Statuy</Link></li>
              <li className="hover:text-on-primary cursor-pointer"><Link to="/brick-exchange">Klocki LEGO</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-on-primary mb-4 text-sm uppercase tracking-wider">Zaufanie & Bezpieczeństwo</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-on-primary cursor-pointer">Protokół Weryfikacji Hub</li>
              <li className="hover:text-on-primary cursor-pointer">Rozstrzyganie Sporów</li>
              <li className="hover:text-on-primary cursor-pointer">Ubezpieczenie Przesyłek</li>
              <li className="hover:text-on-primary cursor-pointer">Polityka Prywatności</li>
              <li className="hover:text-on-primary cursor-pointer">Centrum Pomocy</li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 mt-12 pt-6 border-t border-on-primary-fixed-variant/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-70">
          <span>© 2026 FlipCardZ Exchange Protocol. Wszelkie prawa zastrzeżone.</span>
          <div className="flex gap-6">
            <span>Regulamin Escrow</span>
            <span>Ustawienia Cookies</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
