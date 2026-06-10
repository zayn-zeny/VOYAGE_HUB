import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripStats, useTrips } from '@/hooks/useTrips';
import useAuth from '@/hooks/useAuth';
import { 
  Plane, 
  Globe, 
  Calendar, 
  MapPin, 
  Plus, 
  Compass, 
  TrendingUp,
  Map
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateRange, getStatusColor } from '@/lib/utils';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useTripStats();
  const { data: trips, isLoading: tripsLoading } = useTrips({ sort: '-createdAt' });

  const upcomingTrips = trips?.filter(t => t.status === 'upcoming').slice(0, 3) || [];

  const quickStats = [
    { label: 'Total Trips', value: stats?.totalTrips ?? 0, icon: Plane, color: 'text-teal-500 bg-teal-500/10' },
    { label: 'Countries Visited', value: stats?.countriesVisited ?? 0, icon: Globe, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Days Traveled', value: stats?.totalDays ?? 0, icon: Calendar, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Saved Locations', value: stats?.savedLocations ?? 0, icon: MapPin, color: 'text-purple-500 bg-purple-500/10' },
  ];

  // Chart data formatting
  const pieData = stats?.statusCounts 
    ? [
        { name: 'Upcoming', value: stats.statusCounts.upcoming, color: '#0ea5e9' },
        { name: 'Ongoing', value: stats.statusCounts.ongoing, color: '#f59e0b' },
        { name: 'Completed', value: stats.statusCounts.completed, color: '#10b981' },
        { name: 'Drafts', value: stats.statusCounts.draft, color: '#64748b' },
      ].filter(item => item.value > 0)
    : [];

  const barData = trips
    ? trips.slice(0, 6).map(t => ({
        name: t.destination?.name.split(',')[0],
        duration: t.duration || 1,
      }))
    : [];

  const isLoading = statsLoading || tripsLoading;

  return (
    <div className="space-y-6 pb-12 font-sans select-none">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950/45 text-white">
        <div className="absolute top-[-40%] right-[-10%] w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px]" />
        <div className="relative z-10 max-w-xl space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Hi, {user?.name}! Ready for your next adventure?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Create highly detailed, customized itineraries instantly using Gemini, optimize routes, or explore popular attractions on the map.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="sm" variant="gradient" onClick={() => navigate('/plan')} className="font-semibold shadow-md shadow-teal-500/15">
              <Plus size={15} className="mr-1.5" /> Plan a New Trip
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/explore')} className="border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold">
              <Compass size={15} className="mr-1.5" /> Open Maps
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="border-border/60">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">{item.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <h3 className="text-2xl font-bold text-foreground font-sans">{item.value}</h3>
                  )}
                </div>
                <div className={`p-2.5 rounded-lg ${item.color}`}>
                  <Icon size={20} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle>Travel Statistics</CardTitle>
            <CardDescription>Visualizing trip durations across recent plans</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : barData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <TrendingUp className="h-10 w-10 text-muted-foreground/35 mb-2" />
                <p className="text-sm text-muted-foreground">Not enough data yet</p>
                <p className="text-xs text-muted-foreground/80">Trips duration statistics will show up here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} 
                    labelStyle={{ fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="duration" fill="url(#colorGrad)" radius={[4, 4, 0, 0]} barSize={35}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#0ea5e9" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Trip Statuses</CardTitle>
            <CardDescription>Active vs completed travel breakdowns</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex flex-col justify-between">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Globe className="h-10 w-10 text-muted-foreground/35 mb-2" />
                <p className="text-sm text-muted-foreground">No statuses found</p>
              </div>
            ) : (
              <>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Trips List */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Trips</CardTitle>
              <CardDescription>Your next travel destinations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/trips')} className="font-semibold text-xs">
              View all trips
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : upcomingTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Map className="h-10 w-10 text-muted-foreground/35 mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming trips planned</p>
                <Button variant="link" size="sm" onClick={() => navigate('/plan')} className="text-xs">
                  Create one now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip._id}
                    onClick={() => navigate(`/trips/${trip._id}`)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border/40 hover:border-teal-500/35 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-pointer transition-all duration-200 gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold">
                        ✈️
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-tight">
                          {trip.title || `Trip to ${trip.destination.name}`}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {trip.destination.name}, {trip.destination.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
