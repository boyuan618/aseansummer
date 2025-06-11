import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Map, Users, Trophy, Compass, Clock, MapPin, Calendar } from 'lucide-react';

interface Activity {
  id: string;
  theme: string;
  description: string;
  location: string;
  order: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  activities: { [key: number]: number[] }; // activity number -> group numbers
}

const activities: Activity[] = [
  {
    id: 'mermaids-lagoon',
    theme: "Mermaid's Lagoon",
    description: "Dive into the mystical waters where mermaids once sang their enchanting songs. Decipher the ancient rebus puzzles left by the sea maidens to unlock the secrets hidden beneath the waves. Only those who can read the symbolic language of the deep will discover the treasure.",
    location: "Arc TR",
    order: 1
  },
  {
    id: 'krakens-wrath',
    theme: "Kraken's Wrath",
    description: "Face the legendary sea monster in this thrilling Ddjaki challenge. Test your courage and precision as you battle against the mighty tentacles of the deep. Master the ancient throwing technique to defeat the kraken and claim victory over the seas.",
    location: "LWN",
    order: 2
  },
  {
    id: 'cursed-compass',
    theme: "Cursed Compass",
    description: "Follow the cursed compass through the explosive Splat! challenge. Navigate through twisted paths where one wrong move could spell disaster. Only pirates with quick reflexes and steady nerves can break the ancient curse and find the hidden treasure.",
    location: "AIA",
    order: 3
  },
  {
    id: 'plank-duel',
    theme: "Plank Duel",
    description: "Walk the plank in this nerve-wracking Eraser Game challenge. Test your steady hand and unwavering focus as you balance on the edge of defeat. One false move and you'll be swimming with the fishes - only the most precise pirates survive this deadly duel.",
    location: "Outside Audi",
    order: 4
  },
  {
    id: 'isle-of-echoes',
    theme: "Isle of Echoes",
    description: "On this mysterious island, every melody holds a secret message. Listen carefully to the songs of old pirates in this musical challenge. Use your keen ear and knowledge of sea shanties to identify the tunes that will guide you to the legendary treasure.",
    location: "Hive",
    order: 5
  },
  {
    id: 'cannonball-clash',
    theme: "Cannonball Clash",
    description: "Load the cannons and prepare for the Frog Game battle! This high-energy challenge tests your aim and timing as you launch attacks against rival crews. Master the art of precision warfare to dominate the seas in this epic pirate showdown.",
    location: "GAIA",
    order: 6
  },
  {
    id: 'tropical-trickery',
    theme: "Tropical Trickery",
    description: "Navigate through a maze of tropical traps and tricky Yes or No decisions. What seems obvious may be a trap, and what appears impossible might be your salvation. Trust your instincts and choose wisely in this mind-bending pirate puzzle.",
    location: "HSS",
    order: 7
  },
  {
    id: 'blazing-buccaneers',
    theme: "Blazing Buccaneers",
    description: "The final challenge where legends are born! Master the ancient art of Chapteh in this blazing finale. Show off your footwork and coordination skills as you compete for the ultimate pirate glory. Only true buccaneers can conquer this legendary test.",
    location: "CHC/Outside Can B",
    order: 8
  }
];

const timeSlots: TimeSlot[] = [
  {
    startTime: "8:45",
    endTime: "9:05",
    activities: {
      1: [1, 2], 2: [3, 4], 3: [5, 6], 4: [7, 8], 5: [9, 10], 6: [11, 12], 7: [13, 14], 8: [15, 16]
    }
  },
  {
    startTime: "9:05",
    endTime: "9:25",
    activities: {
      1: [3, 5], 2: [1, 6], 3: [7, 2], 4: [9, 4], 5: [11, 8], 6: [13, 15], 7: [10, 16], 8: [14, 12]
    }
  },
  {
    startTime: "9:25",
    endTime: "9:45",
    activities: {
      1: [8, 4], 2: [10, 2], 3: [12, 1], 4: [5, 11], 5: [13, 16], 6: [3, 14], 7: [6, 15], 8: [7, 9]
    }
  },
  {
    startTime: "9:45",
    endTime: "10:05",
    activities: {
      1: [13, 6], 2: [11, 14], 3: [4, 16], 4: [1, 10], 5: [7, 15], 6: [2, 9], 7: [3, 12], 8: [8, 5]
    }
  },
  {
    startTime: "10:05",
    endTime: "10:25",
    activities: {
      1: [7, 16], 2: [15, 5], 3: [14, 9], 4: [6, 12], 5: [2, 3], 6: [1, 8], 7: [4, 11], 8: [10, 13]
    }
  },
  {
    startTime: "10:25",
    endTime: "10:45",
    activities: {
      1: [14, 10], 2: [7, 12], 3: [8, 15], 4: [2, 13], 5: [6, 4], 6: [5, 16], 7: [1, 9], 8: [3, 11]
    }
  },
  {
    startTime: "10:45",
    endTime: "11:05",
    activities: {
      1: [11, 15], 2: [13, 9], 3: [10, 3], 4: [14, 16], 5: [12, 5], 6: [6, 7], 7: [2, 8], 8: [4, 1]
    }
  },
  {
    startTime: "11:05",
    endTime: "11:25",
    activities: {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] // Free for all
    }
  }
];

interface GroupActivity {
  activity: Activity;
  timeSlot: string;
  isActive: boolean;
  isCompleted: boolean;
}

function Landing() {
  const { user, logout } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState<GroupActivity | null>(null);

  const userGroup = Number(user?.group) || 1;

  // Convert time string to minutes for proper sorting
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Get activities for the user's group
  const getGroupActivities = (): GroupActivity[] => {
    const groupActivities: GroupActivity[] = [];
    
    timeSlots.forEach((slot, slotIndex) => {
      // Skip the free-for-all slot for individual activities
      if (slotIndex === 7) {
        groupActivities.push({
          activity: {
            id: 'free-for-all',
            theme: 'Free For All',
            description: 'All groups participate together in the final celebration and prize distribution ceremony. Gather at the main assembly area for the grand finale of your pirate adventure!',
            location: 'Main Assembly Area',
            order: 9
          },
          timeSlot: `${slot.startTime} - ${slot.endTime}`,
          isActive: false,
          isCompleted: false
        });
        return;
      }

      // Find which activity this group is doing in this time slot
      Object.entries(slot.activities).forEach(([activityNum, groups]) => {
        if (groups.includes(userGroup)) {
          const activity = activities[parseInt(activityNum) - 1];
          groupActivities.push({
            activity,
            timeSlot: `${slot.startTime} - ${slot.endTime}`,
            isActive: false, // You can implement logic to determine current activity
            isCompleted: false // You can implement logic to track completion
          });
        }
      });
    });

    // Sort by time slot using proper time comparison
    return groupActivities.sort((a, b) => {
      const timeA = timeToMinutes(a.timeSlot.split(' - ')[0]);
      const timeB = timeToMinutes(b.timeSlot.split(' - ')[0]);
      return timeA - timeB;
    });
  };

  const groupActivities = getGroupActivities();

  React.useEffect(() => {
    if (groupActivities.length > 0 && !selectedActivity) {
      setSelectedActivity(groupActivities[0]);
    }
  }, [groupActivities.length]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-b border-yellow-400/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
                <Compass size={20} className="text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-yellow-400 font-serif">Pirate's Quest</h1>
                <p className="text-sm text-blue-200">Amazing Race Adventure</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-yellow-400 font-medium">{user?.name}</p>
                <p className="text-sm text-blue-300">{user?.programme} • Group {user?.group}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-all duration-200 border border-red-500/30"
              >
                <LogOut size={16} />
                <span>Abandon Ship</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-20 animate-pulse">
          <Map size={150} className="text-yellow-400 transform rotate-12" />
        </div>
        <div className="absolute bottom-20 right-32 animate-bounce">
          <Compass size={120} className="text-blue-300 transform -rotate-12" />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Left panel - Group Schedule */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/20 p-6 relative overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-yellow-400/30 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-yellow-400/30 rounded-br-2xl"></div>

              <h2 className="text-2xl font-bold text-yellow-400 mb-6 font-serif flex items-center">
                <Calendar className="mr-3" size={24} />
                Group {user?.group} Schedule
              </h2>

              {/* Activity Schedule Cards - Removed max-height and overflow */}
              <div className="space-y-3 mb-6">
                {groupActivities.map((groupActivity, index) => (
                  <button
                    key={`${groupActivity.activity.id}-${index}`}
                    onClick={() => setSelectedActivity(groupActivity)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                      selectedActivity?.activity.id === groupActivity.activity.id && 
                      selectedActivity?.timeSlot === groupActivity.timeSlot
                        ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400'
                        : 'bg-slate-700/30 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm">{groupActivity.activity.theme}</h3>
                      <div className="flex items-center space-x-2">
                        {groupActivity.isCompleted && (
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                        {groupActivity.isActive && (
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-xs opacity-75">
                      <Clock size={12} className="mr-1" />
                      {groupActivity.timeSlot}
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Trophy className="text-yellow-400" size={20} />
                      <span className="text-blue-200">Activities Completed</span>
                    </div>
                    <span className="text-yellow-400 font-bold">
                      {groupActivities.filter(ga => ga.isCompleted).length}/{groupActivities.length}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="text-blue-400" size={20} />
                      <span className="text-blue-200">Your Group</span>
                    </div>
                    <span className="text-blue-400 font-bold">#{user?.group}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Activity Details */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/20 p-8 h-full relative overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-yellow-400/30 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-yellow-400/30 rounded-br-2xl"></div>

              {selectedActivity && (
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-yellow-400 font-serif">
                      {selectedActivity.activity.theme}
                    </h2>
                    <div className="flex items-center space-x-3">
                      {selectedActivity.isActive && (
                        <div className="bg-green-400/20 px-3 py-1 rounded-full border border-green-400/50">
                          <span className="text-green-400 font-medium text-sm">Active Now</span>
                        </div>
                      )}
                      {selectedActivity.isCompleted && (
                        <div className="bg-blue-400/20 px-3 py-1 rounded-full border border-blue-400/50">
                          <span className="text-blue-400 font-medium text-sm">Completed</span>
                        </div>
                      )}
                      <div className="bg-yellow-400/20 px-3 py-1 rounded-full">
                        <span className="text-yellow-400 font-medium text-sm">
                          {selectedActivity.activity.order === 9 ? 'Final Event' : `Station ${selectedActivity.activity.order}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-blue-200 mb-8 text-lg leading-relaxed">
                    {selectedActivity.activity.description}
                  </p>

                  {/* Activity Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                      <div className="flex items-center space-x-3 mb-2">
                        <MapPin className="text-yellow-400" size={20} />
                        <span className="text-yellow-400 font-medium">Location</span>
                      </div>
                      <p className="text-blue-200">{selectedActivity.activity.location}</p>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                      <div className="flex items-center space-x-3 mb-2">
                        <Clock className="text-blue-400" size={20} />
                        <span className="text-blue-400 font-medium">Your Time Slot</span>
                      </div>
                      <p className="text-blue-200">{selectedActivity.timeSlot}</p>
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl border-2 border-dashed border-yellow-400/30 h-80 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="text-center relative z-10">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Map size={40} className="text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                        Activity Map
                      </h3>
                      <p className="text-blue-300 max-w-sm">
                        Detailed map and instructions for {selectedActivity.activity.theme} will appear here during your scheduled time slot.
                      </p>
                    </div>

                    {/* Animated treasure sparkles */}
                    <div className="absolute top-8 left-8 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-12 right-16 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/3 right-8 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping delay-1000"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Landing;