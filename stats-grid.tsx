import { User, coinRates, coinName } from "@shared/schema";
import { Card } from "@/components/ui/card";

interface StatsGridProps {
  user: User;
}

export default function StatsGrid({ user }: StatsGridProps) {
  // Calcola il valore stimato in EUR
  const estimatedValue = (user.totalCoins * coinRates.COIN_VALUE_EUR).toFixed(2);
  
  // Formatter per i numeri con lo stile italiano
  const formatter = new Intl.NumberFormat('it-IT', { 
    style: 'decimal',
    maximumFractionDigits: 0
  });
  
  const formatNumber = (num: number) => {
    return formatter.format(num);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Totale Monete */}
      <Card className="glass-effect rounded-2xl p-6 shadow-lg hover-scale card-highlight transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="text-light-darker font-medium">Totale {coinName}</div>
          <div className="w-10 h-10 rounded-full bg-primary bg-opacity-15 flex items-center justify-center border border-primary/20">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="text-2xl font-bold text-gradient mb-1">{formatNumber(user.totalCoins)}</div>
        <div className="text-sm">
          <span className="text-green-400">≈ €{estimatedValue}</span>
          <span className="text-light-darker ml-1">valore stimato</span>
        </div>
      </Card>
      
      {/* Guadagni Odierni */}
      <Card className="glass-effect rounded-2xl p-6 shadow-lg hover-scale card-highlight transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="text-light-darker font-medium">Guadagni Odierni</div>
          <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-15 flex items-center justify-center border border-green-500/20">
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="text-2xl font-bold text-gradient mb-1">{formatNumber(user.todayCoins)}</div>
        <div className="text-sm">
          <span className="text-light-darker">
            {Math.floor((user.todayCoins / coinRates.MAX_COINS_PER_DAY) * 100)}% del limite giornaliero
          </span>
        </div>
      </Card>
      
      {/* Mining Passivo */}
      <Card className="glass-effect rounded-2xl p-6 shadow-lg hover-scale card-highlight transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="text-light-darker font-medium">Mining Passivo</div>
          <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-15 flex items-center justify-center border border-blue-500/20">
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="text-2xl font-bold text-gradient mb-1">{formatNumber(user.passiveCoins)}</div>
        <div className="text-sm">
          <span className="text-light-darker">{formatNumber(coinRates.PASSIVE_COINS_PER_HOUR)} {coinName}/ora</span>
        </div>
      </Card>
      
      {/* Mining con Click */}
      <Card className="glass-effect rounded-2xl p-6 shadow-lg hover-scale card-highlight transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="text-light-darker font-medium">Mining con Click</div>
          <div className="w-10 h-10 rounded-full bg-purple-500 bg-opacity-15 flex items-center justify-center border border-purple-500/20">
            <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
        </div>
        <div className="text-2xl font-bold text-gradient mb-1">{formatNumber(user.clickCoins)}</div>
        <div className="text-sm">
          <span className="text-light-darker">
            <span className="text-primary">{user.clicksToday}</span>/{coinRates.MAX_CLICKS_PER_DAY} click oggi
          </span>
        </div>
      </Card>
    </div>
  );
}
