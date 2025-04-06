import { useState, useEffect, useRef } from "react";
import { User, coinRates, coinName } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MiningSectionProps {
  user: User;
  onClaimClick: () => void;
  isPending: boolean;
}

export default function MiningSection({ user, onClaimClick, isPending }: MiningSectionProps) {
  const [ripple, setRipple] = useState<{ x: number, y: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Formatter per i numeri
  const formatter = new Intl.NumberFormat('it-IT', { 
    style: 'decimal',
    maximumFractionDigits: 0
  });
  
  // Calcola la percentuale di progresso giornaliero
  const progressPercentage = Math.min(
    Math.floor((user.todayCoins / coinRates.MAX_COINS_PER_DAY) * 100),
    100
  );
  
  // Gestisce la rimozione dell'effetto ripple
  useEffect(() => {
    if (ripple) {
      const timer = setTimeout(() => {
        setRipple(null);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [ripple]);
  
  // Gestisce il click con effetto ripple
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    onClaimClick();
  };
  
  const isMaxedOut = user.clicksToday >= coinRates.MAX_CLICKS_PER_DAY;
  
  return (
    <Card className="crypto-card p-6 card-highlight hover-scale">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gradient">Attività di Accumulo</h2>
        <div className="text-sm text-light-darker glass-effect px-4 py-1.5 rounded-full">
          {progressPercentage}% di Capacità Giornaliera
        </div>
      </div>
      
      {/* Sezione Pulsante Accumulo */}
      <div className="flex flex-col items-center justify-center my-8 relative">
        <div className="text-center mb-6">
          <div className="text-light-darker mb-2">Clicca per accumulare <span className="text-primary font-medium">{coinRates.COINS_PER_CLICK} {coinName}</span></div>
          <div className="font-bold text-lg">
            <span className="text-primary neon-text">{coinRates.MAX_CLICKS_PER_DAY - user.clicksToday}</span> click rimanenti oggi
          </div>
        </div>
        
        <div className={`relative ${!isMaxedOut && !isPending ? "pulse-animation" : ""}`}>
          <div className="absolute inset-0 bg-primary rounded-full opacity-15"></div>
          <button
            ref={buttonRef}
            onClick={handleClick}
            disabled={isPending || isMaxedOut}
            className={`relative w-60 h-60 rounded-full bg-crypto-gradient flex items-center justify-center overflow-hidden transition-all duration-200 ${
              isMaxedOut || isPending ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl active:scale-[0.97] glow-primary"
            }`}
          >
            {/* Cerchio interno del pulsante */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 rounded-full"></div>
            <div className="absolute w-56 h-56 rounded-full glass-effect z-10 flex items-center justify-center border border-blue-600/30">
              <div className="text-center">
                {isPending ? (
                  <Loader2 className="h-16 w-16 text-primary mb-3 animate-spin mx-auto" />
                ) : (
                  <svg className="h-16 w-16 text-primary mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
                <div className="font-bold text-2xl uppercase neon-text text-primary">ACCUMULA ORA</div>
                <div className="text-sm text-light-darker">+{coinRates.COINS_PER_CLICK} {coinName}</div>
              </div>
            </div>
            
            {/* Effetto Ripple */}
            {ripple && (
              <span
                className="absolute rounded-full bg-white bg-opacity-30 animate-ripple"
                style={{
                  top: ripple.y - 60,
                  left: ripple.x - 60,
                  width: 120,
                  height: 120,
                }}
              />
            )}
          </button>
        </div>
        
        <div className="mt-8 w-full max-w-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progresso Accumulo Giornaliero</span>
            <span><span className="text-primary font-medium">{formatter.format(user.todayCoins)}</span>/{formatter.format(coinRates.MAX_COINS_PER_DAY)} {coinName}</span>
          </div>
          <div className="h-5 w-full rounded-full bg-dark relative overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Info Accumulo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <div className="crypto-card glass-effect rounded-xl p-5 hover-scale">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-500 bg-opacity-15 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-500/30">
              <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-light-darker text-sm mb-1">Accumulo Passivo</div>
              <div className="font-medium text-gradient text-lg">{formatter.format(coinRates.PASSIVE_COINS_PER_HOUR)} {coinName}/ora</div>
              <div className="text-xs text-light-darker">Ricompensa automatica ogni ora</div>
            </div>
          </div>
        </div>
        <div className="crypto-card glass-effect rounded-xl p-5 hover-scale">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-purple-500 bg-opacity-15 flex items-center justify-center shadow-md shadow-purple-500/20 border border-purple-500/30">
              <svg className="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div>
              <div className="text-light-darker text-sm mb-1">Accumulo con Click</div>
              <div className="font-medium text-gradient text-lg">{formatter.format(coinRates.COINS_PER_CLICK)} {coinName}/click</div>
              <div className="text-xs text-light-darker">Massimo {formatter.format(coinRates.MAX_CLICKS_PER_DAY)} click al giorno</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
