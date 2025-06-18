import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock, Users, Compass, RotateCcw } from 'lucide-react';
import { supabase } from '../supabase';

interface Activity {
  id: string;
  theme: string;
  location: string;
  order: number;
}

const groups: { [key: number]: string } = {
  1 : "The Wave Warriors",
  2 : "The Tidal Titans",
  3 : "The Freewind Pirates",
  4 : "The Treasure Trackers",
  5 : "The Storm Riders",
  6 : "The Moonlit Mariners",
  7 : "The Seafaring Legends",
  8 : "The Compass Crusaders",
  9 : "The Rising Tide",
  10 : "The Majestic Raiders",
  11 : "The Horizon Hopper",
  12 : "The Infinite Navigators",
  13 : "The Gallant Privateers",
  14 : "The Celestial Sailors",
  15 : "The Admiral's Pride",
  16 : "The Silver Shark"
}

interface CompletionData {
  [groupId: string]: {
    [activityId: string]: boolean;
  };
}

const activities: Activity[] = [
  {
    id: 'mermaids-lagoon',
    theme: "Mermaid's Lagoon",
    location: "Arc",
    order: 1
  },
  {
    id: 'krakens-wrath',
    theme: "Kraken's Wrath",
    location: "LWN",
    order: 2
  },
  {
    id: 'plank-panic',
    theme: "Plank Panic",
    location: "AIA",
    order: 3
  },
  {
    id: 'plank-duel',
    theme: "Plank Duel",
    location: "Audi",
    order: 4
  },
  {
    id: 'isle-of-echoes',
    theme: "Isle of Echoes",
    location: "Hive",
    order: 5
  },
  {
    id: 'cannonball-clash',
    theme: "Cannonball Clash",
    location: "GAIA",
    order: 6
  },
  {
    id: 'tropical-trickery',
    theme: "Tropical Trickery",
    location: "HSS",
    order: 7
  },
  {
    id: 'blazing-buccaneers',
    theme: "Blazing Buccaneers",
    location: "CHC",
    order: 8
  }
];

function GameMaster() {
    const [completionData, setCompletionData] = useState<CompletionData>({});
    const [selectedGroup, setSelectedGroup] = useState<string>('1');
    const [selectedActivity, setSelectedActivity] = useState<string>(activities[0].id);
    const [loading, setLoading] = useState<boolean>(true);
  
    // Fetch completion data from Supabase on mount
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Assuming your table is called 'groups' with columns 'group_id' and 'completed_activities' (JSON array)
          const { data, error } = await supabase
            .from('groups')
            .select('*');
  
          if (error) throw error;
  
          // Build initial completionData object
          const initialData: CompletionData = {};
  
          // Initialize all groups with false for all activities by default
          for (let i = 1; i <= 16; i++) {
            initialData[i.toString()] = {};
            activities.forEach(activity => {
              initialData[i.toString()][activity.id] = false;
            });
          }
  
          // Overwrite with DB values if available
          data?.forEach((row: any) => {
            const groupId = row.group_id.toString();
            if (typeof row.tasks_complete === 'string') {
                const completedIds = row.tasks_complete.split(',');
                completedIds.forEach((activityId: string) => {
                  if (initialData[groupId]) {
                    initialData[groupId][activityId] = true;
                  }
                });
              }
              
          });
  
          setCompletionData(initialData);
        } catch (error) {
          console.error('Error fetching completion data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    // Update completion in state and supabase
    const toggleCompletion = async (groupId: string, activityId: string) => {
        setCompletionData(prev => {
          const prevGroup = prev[groupId] ?? {};
          const updatedGroup = {
            ...prevGroup,
            [activityId]: !prevGroup[activityId],
          };
      
          // Save to Supabase (async, after state is updated)
          saveCompletionToSupabase(groupId, updatedGroup);
      
          return {
            ...prev,
            [groupId]: updatedGroup,
          };
        });
      };
      
    // Save a group's completion list to Supabase
    const saveCompletionToSupabase = async (groupId: string, groupCompletion: { [activityId: string]: boolean }) => {
      const completedActivities = Object.entries(groupCompletion)
        .filter(([_, completed]) => completed)
        .map(([activityId]) => activityId);
  
      try {
        // Upsert: insert or update existing group_id
        const { error } = await supabase
          .from('groups')
          .upsert(
            {
              group_id: parseInt(groupId),
              tasks_complete: completedActivities.join(','),
            },
            { onConflict: 'group_id' }
          )
          
  
        if (error) {
          console.error('Error saving completion data:', error);
        }
      } catch (error) {
        console.error('Unexpected error saving completion data:', error);
      }
    };
  
    // Mark activity completed toggles completion
    const markActivityCompleted = () => {
      toggleCompletion(selectedGroup, selectedActivity);
    };
  
    // Reset a group's completion both locally and in Supabase
    const resetGroup = async (groupId: string) => {
      const resetActivities = activities.reduce((acc, activity) => {
        acc[activity.id] = false;
        return acc;
      }, {} as { [key: string]: boolean });
  
      setCompletionData(prev => {
        const newData = { ...prev, [groupId]: resetActivities };
        return newData;
      });
  
      // Save reset to Supabase (empty array)
      try {
        const { error } = await supabase
          .from('groups')
          .upsert(
            {
              group_id: parseInt(groupId),
              tasks_complete: '',
            },
            { onConflict: 'group_id' }
          )
          
  
        if (error) console.error('Error resetting group in DB:', error);
      } catch (error) {
        console.error('Unexpected error resetting group in DB:', error);
      }
    };
  
    // Reset all groups locally and in Supabase
    const resetAll = async () => {
      const resetData: CompletionData = {};
      for (let i = 1; i <= 16; i++) {
        resetData[i.toString()] = {};
        activities.forEach(activity => {
          resetData[i.toString()][activity.id] = false;
        });
      }
      setCompletionData(resetData);
  
      // Batch reset all groups in Supabase (you might want to optimize this with batch or RPC)
      try {
        for (let i = 1; i <= 16; i++) {
          await supabase
            .from('groups')
            .upsert(
              {
                group_id: i,
                tasks_complete: "",
              },
              { onConflict: 'group_id' }
            );
        }
      } catch (error) {
        console.error('Error resetting all groups in DB:', error);
      }
    };
  
    const getGroupStats = (groupId: string) => {
      const completed = activities.filter(activity => completionData[groupId]?.[activity.id]).length;
      return { completed, total: activities.length };
    };
  
    const getCurrentTime = () => {
      return new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
    };
  
    if (loading) {
      return <div className="text-yellow-400 font-bold p-8">Loading...</div>;
    }  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm border border-yellow-400/20 rounded-2xl mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
                <Shield size={24} className="text-slate-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400 font-serif">GameMaster Control</h1>
                <p className="text-sm text-blue-200">Station Completion Tracker</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-blue-300">
                <Clock size={16} />
                <span className="font-mono">{getCurrentTime()}</span>
              </div>
              <button
                onClick={resetAll}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-all duration-200 border border-red-500/30"
              >
                <RotateCcw size={16} />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/20 p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-6 font-serif flex items-center">
              <CheckCircle className="mr-3" size={20} />
              Quick Mark Complete
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Select Group
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
                >
                  {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num.toString()}>
                      {groups[num]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Select Station
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
                >
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      Station {activity.order}: {activity.theme}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={markActivityCompleted}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  completionData[selectedGroup]?.[selectedActivity]
                    ? 'bg-green-600/20 border border-green-400/50 text-green-400 hover:bg-green-600/30'
                    : 'bg-yellow-400/20 border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/30'
                }`}
              >
                {completionData[selectedGroup]?.[selectedActivity] ? 'Mark Incomplete' : 'Mark Complete'}
              </button>

              <div className="pt-4 border-t border-slate-600/50">
                <div className="text-sm text-blue-300">
                  <p><strong>Selected:</strong> {groups[Number(selectedGroup)]}</p>
                  <p><strong>Station:</strong> {activities.find(a => a.id === selectedActivity)?.theme}</p>
                  <p><strong>Location:</strong> {activities.find(a => a.id === selectedActivity)?.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Groups Overview */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/20 p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-6 font-serif flex items-center">
              <Users className="mr-3" size={20} />
              All Groups Progress
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 16 }, (_, i) => i + 1).map(groupNum => {
                const groupId = groupNum.toString();
                const stats = getGroupStats(groupId);
                const completionPercentage = (stats.completed / stats.total) * 100;

                return (
                  <div
                    key={groupId}
                    className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white">{groups[groupNum]}</h3>
                      <button
                        onClick={() => resetGroup(groupId)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Reset Group"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-blue-200">Progress</span>
                        <span className="text-yellow-400 font-medium">
                          {stats.completed}/{stats.total}
                        </span>
                      </div>
                      <div className="w-full bg-slate-600/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {activities.map(activity => (
                        <button
                          key={activity.id}
                          onClick={() => toggleCompletion(groupId, activity.id)}
                          className={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${
                            completionData[groupId]?.[activity.id]
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600'
                          }`}
                          title={`Station ${activity.order}: ${activity.theme}`}
                        >
                          {activity.order}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Station Reference */}
      <div className="mt-6">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/20 p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-6 font-serif flex items-center">
            <Compass className="mr-3" size={20} />
            Station Reference
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-yellow-400/20 px-2 py-1 rounded text-yellow-400 font-bold text-sm">
                    Station {activity.order}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-1">{activity.theme}</h3>
                <p className="text-blue-300 text-sm">{activity.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameMaster;