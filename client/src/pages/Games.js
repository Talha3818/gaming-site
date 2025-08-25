import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaGamepad, FaTrophy, FaUsers, FaChartLine } from "react-icons/fa";

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
      icon: "🔫",
      description: "Battle royale shooting game with intense action",
      players: "50 players",
      avgBet: "৳800",
      activeChallenges: 8,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "pubg",
      name: "PUBG",
      icon: "🎯",
      description: "PlayerUnknown's Battlegrounds - ultimate survival",
      players: "100 players",
      avgBet: "৳1000",
      activeChallenges: 15,
      color: "from-green-500 to-blue-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Available Games</h1>
        <p className="text-dark-300 text-lg">
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
              <div className="text-6xl">{game.icon}</div>
            </div>

            {/* Game Content */}
            <div className="p-6 space-y-4">
              <h3 className="text-2xl font-bold text-white">{game.name}</h3>
              <p className="text-dark-300">{game.description}</p>

              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="text-center">
                  <div className="text-sm text-dark-300">Players</div>
                  <div className="font-semibold text-white">{game.players}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-dark-300">Avg Bet</div>
                  <div className="font-semibold text-primary-400">
                    {game.avgBet}
                  </div>
                </div>
              </div>

              {/* Active Challenges */}
              <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-yellow-400" />
                  <span className="text-sm text-dark-300">
                    Active Challenges
                  </span>
                </div>
                <span className="font-semibold text-white">
                  {game.activeChallenges}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full gap-3 hidden md:flex">
                <Link
                  to={`/games/${game.id}`}
                  className="btn-outline text-center"
                >
                  View Details
                </Link>
                <Link to="/challenges" className="btn-primary text-center">
                  Create Challenge
                </Link>
              </div>

              <div className="w-full flex gap-3 justify-center md:hidden">
                <Link
                  to={`/games/${game.id}`}
                  className="btn-outline text-center"
                >
                  View Details
                </Link>
                <Link to="/challenges" className="btn-primary text-center">
                  Create Challenge
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
      >
        <div className="gaming-card p-6 text-center">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-white mb-2">3 Games</h3>
          <p className="text-dark-300">Available for challenges</p>
        </div>

        <div className="gaming-card p-6 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-white mb-2">35 Active</h3>
          <p className="text-dark-300">Challenges waiting</p>
        </div>

        <div className="gaming-card p-6 text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold text-white mb-2">৳25,000</h3>
          <p className="text-dark-300">Total prize pool</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Games;
