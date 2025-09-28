
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, Wrench, CheckCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function StatsCards() {
  const { workOrders, clients, technicians, serviceTypes } = useData();

  const stats = [
    {
      title: 'Serviços cadastrados',
      value: serviceTypes.length.toString(),
      icon: FileText,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      textColor: 'text-white'
    },
    {
      title: 'Usuários',
      value: technicians.length.toString(),
      icon: Users,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      textColor: 'text-white'
    },
    {
      title: 'Clientes',
      value: clients.length.toString(),
      icon: Users,
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      textColor: 'text-white'
    },
    {
      title: 'Ordens de serviços',
      value: workOrders.length.toString(),
      icon: CheckCircle,
      color: 'bg-gradient-to-br from-red-500 to-pink-500',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.color} border-0 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${stat.textColor} text-sm font-medium opacity-90`}>
                  {stat.title}
                </p>
                <p className={`${stat.textColor} text-3xl font-bold mt-2`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`${stat.textColor} h-12 w-12 opacity-80`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
