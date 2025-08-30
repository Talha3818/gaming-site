import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaGamepad, FaTrophy, FaUsers, FaChartLine } from "react-icons/fa";

// Import game logos
import pubgLogo from "../assets/pubg.png";
import freeFireLogo from "../assets/free-fire.png";

const Games = () => {
  const games = [
    {
      id: "ludo-king",
      name: "Ludo King",
      icon: "🎲",
      description: "Classic board game with strategic gameplay",
      players: "2-4 players",
      avgBet: "৳500",
      activeChallenges: 12,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "free-fire",
      name: "Free Fire",
      icon: "free-fire-logo",
      description: "Battle royale shooting game with intense action",
      players: "50 players",
      avgBet: "৳800",
      activeChallenges: 8,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "pubg",
      name: "PUBG",
      icon: "pubg-logo",
      description: "PlayerUnknown's Battlegrounds - ultimate survival",
      players: "100 players",
      avgBet: "৳1000",
      activeChallenges: 15,
      color: "from-green-500 to-blue-500",
    },
  ];

  return (
         <div className="p-3 md:p-6 space-y-4 md:space-y-6">
             {/* Header */}
       <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center"
       >
         <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">Available Games</h1>
         <p className="text-dark-300 text-sm md:text-lg">
           Choose your game and start challenging other players
         </p>
       </motion.div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="gaming-card overflow-hidden"
          >
            {/* Game Header */}
            <div
              className={`h-32 bg-gradient-to-r ${game.color} flex items-center justify-center`}
            >
              {game.icon === "🎲" ? (
                <div className="text-6xl">{game.icon}</div>
              ) : game.icon === "free-fire-logo" ? (
                <img src={freeFireLogo} alt="Free Fire" className="w-20 h-20 object-contain" />
              ) : game.icon === "pubg-logo" ? (
                <img src={pubgLogo} alt="PUBG" className="w-20 h-20 object-contain" />
              ) : (
                <div className="text-6xl">{game.icon}</div>
              )}
            </div>

                         {/* Game Content */}
             <div className="p-4 md:p-6 space-y-3 md:space-y-4">
               <h3 className="text-lg md:text-2xl font-bold text-white">{game.name}</h3>
               <p className="text-dark-300 text-sm md:text-base">{game.description}</p>

                             {/* Game Stats */}
               <div className="grid grid-cols-2 gap-3 md:gap-4 py-3 md:py-4">
                 <div className="text-center">
                   <div className="text-xs md:text-sm text-dark-300">Players</div>
                   <div className="font-semibold text-white text-sm md:text-base">{game.players}</div>
                 </div>
                 <div className="text-center">
                   <div className="text-xs md:text-sm text-dark-300">Avg Challenge</div>
                   <div className="font-semibold text-primary-400 text-sm md:text-base">
                     {game.avgBet}
                   </div>
                 </div>
               </div>

                             {/* Active Challenges */}
               <div className="flex items-center justify-between p-2 md:p-3 bg-dark-700 rounded-lg">
                 <div className="flex items-center gap-2">
                   <FaTrophy className="text-yellow-400 text-sm md:text-base" />
                   <span className="text-xs md:text-sm text-dark-300">
                     Active Challenges
                   </span>
                 </div>
                 <span className="font-semibold text-white text-sm md:text-base">
                   {game.activeChallenges}
                 </span>
               </div>


              <div className="w-full flex gap-3 justify-center md:hidden">
                <Link
                  to={`/games/${game.id}`}
                  className="btn-outline text-center"
                >
                  View Details
                </Link>

              </div>
            </div>
          </motion.div>
        ))}
      </div>

             {/* Quick Stats */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12"
       >
         <div className="gaming-card p-4 md:p-6 text-center">
           <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎮</div>
           <h3 className="text-lg md:text-xl font-bold text-white mb-2">3 Games</h3>
           <p className="text-dark-300 text-sm md:text-base">Available for challenges</p>
         </div>

         <div className="gaming-card p-4 md:p-6 text-center">
           <div className="text-3xl md:text-4xl mb-3 md:mb-4">🏆</div>
           <h3 className="text-lg md:text-xl font-bold text-white mb-2">35 Active</h3>
           <p className="text-dark-300 text-sm md:text-base">Challenges waiting</p>
         </div>

         <div className="gaming-card p-4 md:p-6 text-center">
           <div className="text-3xl md:text-4xl mb-3 md:mb-4">💰</div>
           <h3 className="text-lg md:text-xl font-bold text-white mb-2">৳25,000</h3>
           <p className="text-dark-300 text-sm md:text-base">Total prize pool</p>
         </div>
       </motion.div>
    </div>
  );
};

export default Games;
