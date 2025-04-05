import React from 'react';

interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
}

interface StocksTableProps {
  stocks: Stock[];
}

const StocksTable: React.FC<StocksTableProps> = ({ stocks }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-card divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Symbol</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sector</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {stocks.map((stock) => (
            <tr key={stock.id} className="hover:bg-accent/50">
              <td className="px-4 py-2 border-b dark:border-gray-700 whitespace-nowrap">
                <div className="font-medium">{stock.name}</div>
              </td>
              <td className="px-4 py-2 border-b dark:border-gray-700">{stock.symbol}</td>
              <td className="px-4 py-2 border-b dark:border-gray-700">{stock.sector}</td>
              <td className="px-4 py-2 border-b dark:border-gray-700 text-right">₹{stock.price.toFixed(2)}</td>
              <td className="px-4 py-2 border-b dark:border-gray-700 text-right">
                <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StocksTable; 