import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips, useDeleteTrip } from '@/hooks/useTrips';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  MapPin, 
  Calendar, 
  Plane,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateRange, getBudgetColor, getStatusColor, getDestinationGradient } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MyTrips() {
  const navigate = useNavigate();
  const deleteTripMutation = useDeleteTrip();

  // Filter & Sort States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('-createdAt');

  const { data: trips, isLoading } = useTrips({ search, status, sort });

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this trip itinerary?')) {
      try {
        await deleteTripMutation.mutateAsync(id);
      } catch (err) {
        toast.error('Failed to delete trip');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans select-none">
      {/* Title & Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">My Trips</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your created and generated travel plans
          </p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => navigate('/plan')} className="font-semibold shadow-md">
          <Plane size={15} className="mr-1.5" /> Plan a New Trip
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by destination or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Select */}
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <Filter size={14} className="text-muted-foreground hidden sm:inline" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full sm:w-36 rounded-lg border border-border/80 bg-background/50 backdrop-blur-sm px-2.5 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent font-semibold transition-all duration-200"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="draft">Drafts</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <ArrowUpDown size={14} className="text-muted-foreground hidden sm:inline" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="flex h-10 w-full sm:w-40 rounded-lg border border-border/80 bg-background/50 backdrop-blur-sm px-2.5 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent font-semibold transition-all duration-200"
              >
                <option value="-createdAt">Created (Newest)</option>
                <option value="createdAt">Created (Oldest)</option>
                <option value="startDate">Start Date (Earliest)</option>
                <option value="-duration">Duration (Longest)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !trips || trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/80 rounded-2xl bg-card">
          <Plane className="h-12 w-12 text-muted-foreground/35 mb-3 rotate-45" />
          <p className="text-sm font-bold text-muted-foreground">No trips found</p>
          <p className="text-xs text-muted-foreground/80 mt-1">Try clearing your search filters or start planning a new journey.</p>
          <Button variant="link" size="sm" onClick={() => navigate('/plan')} className="text-xs font-semibold mt-2">
            Create your first itinerary now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const destGradient = getDestinationGradient(trip.destination?.name || 'voyage');
            return (
              <Card
                key={trip._id}
                onClick={() => navigate(`/trips/${trip._id}`)}
                className="overflow-hidden border border-border/60 hover:border-teal-500/35 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-[2px]"
              >
                {/* Gradient banner */}
                <div className={`h-28 bg-gradient-to-tr ${destGradient} p-4 flex flex-col justify-between text-white relative`}>
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-black/30 backdrop-blur-md`}>
                      {trip.status}
                    </span>
                  </div>
                  <div />
                  <div>
                    <h3 className="text-base font-extrabold truncate drop-shadow-md">
                      {trip.title || `Trip to ${trip.destination?.name.split(',')[0]}`}
                    </h3>
                    <p className="text-[10px] text-white/90 truncate flex items-center gap-1 mt-0.5 font-semibold">
                      <MapPin size={10} /> {trip.destination?.name}
                    </p>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {formatDateRange(trip.startDate, trip.endDate)}
                    </span>
                    <span>{trip.duration} days</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-3">
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full capitalize ${getBudgetColor(trip.budget)}`}>
                      {trip.budget}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                        onClick={(e) => handleDelete(e, trip._id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground">
                        <Eye size={13} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
