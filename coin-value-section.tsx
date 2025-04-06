
import { useCoinValue } from "@/hooks/use-coin-value";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Coins, Users, TrendingUp, Info as InfoIcon, Trophy } from "lucide-react";

export default function CoinValueSection() {
  const { coinValue, isLoading } = useCoinValue();
  
  // Se i dati sono in caricamento, mostra un loader
  if (isLoading || !coinValue) {
    return (
      <Card className="crypto-card p-6 h-full card-highlight hover-scale">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gradient">Valore della Moneta</h2>
          <div className="text-sm text-light-darker glass-effect px-4 py-1.5 rounded-full">
            In Caricamento...
          </div>
        </div>
        <div className="flex items-center justify-center h-52">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      </Card>
    );
  }
  
  // Calcola la percentuale di progresso verso il prossimo livello
  const calculateProgress = () => {
    if (!coinValue.nextTier) return 100; // Se non c'è un prossimo tier, siamo al 100%
    
    const prevTierUsers = coinValue.allTiers.findIndex(tier => tier.fino_a === coinValue.nextTier?.users) > 0 
      ? coinValue.allTiers[coinValue.allTiers.findIndex(tier => tier.fino_a === coinValue.nextTier?.users) - 1].fino_a 
      : 0;
    
    const progress = ((coinValue.totalUsers - prevTierUsers) / (coinValue.nextTier.users - prevTierUsers)) * 100;
    return Math.min(Math.max(progress, 0), 100); // Assicura che sia tra 0 e 100
  };
  
  // Generazione della tabella di livelli
  const tierRows = coinValue.allTiers.map((tier, index) => {
    const isCurrentTier = coinValue.totalUsers <= tier.fino_a && 
                          coinValue.totalUsers > (index > 0 ? coinValue.allTiers[index-1].fino_a : 0);
    
    const tierClass = isCurrentTier ? "text-primary font-medium" : "";
    
    return (
      <div key={`tier-row-${index}`} className="contents">
        <div className={tierClass}>
          {tier.fino_a.toLocaleString()}
        </div>
        <div className={`text-right ${tierClass}`}>
          €{tier.valore.toFixed(6)}
        </div>
      </div>
    );
  });
  
  return (
    <Card className="premium-card p-8 h-full card-highlight animate-shine">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-urbanist font-bold text-gradient neon-text-blue">Valore {coinValue.name}</h2>
        <div className="text-sm font-medium glass-effect-dark px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
          <span className="text-white">€{coinValue.currentValue.toFixed(6)}</span>
        </div>
      </div>
      
      {/* Sezione logo moneta e valore attuale */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 mb-5 shadow-lg shadow-green-500/20 glow-green">
          <div className="bg-dark-lighter h-full w-full rounded-full flex items-center justify-center glass-effect">
            <Coins className="h-14 w-14 text-gradient-green animate-float" />
          </div>
        </div>
        <div className="text-3xl font-bold font-urbanist text-gradient-green neon-text-purple">€{coinValue.currentValue.toFixed(6)}</div>
        <div className="text-sm text-light-darker mt-1 font-medium uppercase tracking-wider">Valore attuale</div>
      </div>
      
      {/* Informazioni utenti e prossimo tier */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Numero di utenti attuali */}
        <div className="flex items-center glass-effect-light p-5 rounded-xl hover-scale shadow-lg">
          <div className="w-16 h-16 rounded-full bg-blue-500 bg-opacity-15 flex items-center justify-center mr-4 shadow-lg shadow-blue-500/10 border border-blue-500/30">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="text-white text-sm font-medium uppercase tracking-wider mb-1 md:mb-0">Utenti Totali</div>
              <div className="font-bold text-xl text-gradient">{coinValue.totalUsers.toLocaleString()}</div>
            </div>
            
            {coinValue.nextTier && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-light-darker">Prossimo aumento a <span className="text-primary font-medium">{coinValue.nextTier.users.toLocaleString()}</span> utenti</span>
                  <span className="text-green-400 font-medium">+{coinValue.nextTier.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-dark/70 rounded-full overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                  <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Tendenza del valore */}
        <div className="flex items-center glass-effect-light p-5 rounded-xl hover-scale shadow-lg">
          <div className="w-16 h-16 rounded-full bg-green-500 bg-opacity-15 flex items-center justify-center mr-4 shadow-lg shadow-green-500/10 border border-green-500/30">
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-medium uppercase tracking-wider mb-1">Tendenza</div>
            <div className="text-gradient-green font-medium text-lg">
              Cresce con l&apos;aumento degli utenti
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabella valori per numero di utenti */}
      <div className="glass-effect-dark rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center mb-4">
          <div className="text-lg font-semibold text-white font-urbanist">Tabella Crescita Valore</div>
          <div className="ml-4 bg-blue-500/20 rounded-full h-[2px] flex-grow"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-primary font-medium uppercase tracking-wider text-xs">Utenti</div>
          <div className="text-primary font-medium uppercase tracking-wider text-xs text-right">Valore</div>
          
          {coinValue.allTiers.map((tier, index) => {
            const isCurrentTier = coinValue.totalUsers <= tier.fino_a && 
                                  coinValue.totalUsers > (index > 0 ? coinValue.allTiers[index-1].fino_a : 0);
            
            const nextTier = coinValue.nextTier && coinValue.nextTier.users === tier.fino_a;
            
            return [
              <div key={`tier-user-${index}`} className={`flex items-center ${isCurrentTier ? "text-white font-medium" : nextTier ? "text-purple-200" : ""}`}>
                {isCurrentTier && <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>}
                {nextTier && <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 pulse-animation"></div>}
                {!isCurrentTier && !nextTier && <div className="w-2 h-2 opacity-0 mr-2"></div>}
                {tier.fino_a.toLocaleString()}
              </div>,
              <div key={`tier-value-${index}`} className={`text-right ${isCurrentTier ? "text-gradient font-semibold" : nextTier ? "text-gradient-purple font-medium" : ""}`}>
                €{tier.valore.toFixed(6)}
              </div>
            ];
          }).flat()}
        </div>
      </div>
      
      <div className="glass-effect-light p-5 rounded-xl border border-blue-500/10 shadow-lg">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
          <span className="font-medium text-white">Crescita Automatica del Valore</span>
        </div>
        <p className="text-light-darker text-sm leading-relaxed">
          Il valore di {coinValue.name} cresce automaticamente con l&apos;aumento del numero di utenti registrati, 
          senza bisogno di transazioni reali. Ogni nuovo utente contribuisce all&apos;aumento del valore 
          della criptovaluta, creando un ecosistema sostenibile e in crescita.
        </p>
      </div>
    </Card>
  );
}