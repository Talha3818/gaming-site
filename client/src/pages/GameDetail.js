import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { FaGamepad, FaTrophy, FaUsers, FaChartLine, FaPlus } from 'react-icons/fa';

const GameDetail = () => {
  const { gameId } = useParams();

  const games = {
    'ludo-king': {
      name: 'Ludo King',
      icon: '🎲',
      description: 'Classic board game with strategic gameplay',
      players: '2-4 players',
      avgBet: '৳500',
      activeChallenges: 12,
      color: 'from-purple-500 to-pink-500',
      rules: [
        'Each player starts with 4 tokens',
        'Roll dice to move tokens around the board',
        'First player to get all tokens home wins',
        'Landing on opponent tokens sends them back to start'
      ]
    },
    'free-fire': {
      name: 'Free Fire',
      icon: '🔫',
      description: 'Battle royale shooting game with intense action',
      players: '50 players',
      avgBet: '৳800',
      activeChallenges: 8,
      color: 'from-orange-500 to-red-500',
      rules: [
        '50 players drop onto an island',
        'Find weapons and equipment',
        'Survive and eliminate other players',
        'Last player or team standing wins'
      ]
    },
    'pubg': {
      name: 'PUBG',
      icon: '🎯',
      description: 'PlayerUnknown\'s Battlegrounds - ultimate survival',
      players: '100 players',
      avgBet: '৳1000',
      activeChallenges: 15,
      color: 'from-green-500 to-blue-500',
      rules: [
        '100 players parachute onto a map',
        'Gather weapons, armor, and supplies',
        'Play zone shrinks over time',
        'Last player or team alive wins'
      ]
    }
  };

  const game = games[gameId];

  if (!game) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Game Not Found</h1>
        <Link to="/games" className="btn-primary">Back to Games</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className={`inline-block p-6 rounded-full bg-gradient-to-r ${game.color} mb-4`}>
          <div className="text-6xl">{game.icon}</div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">{game.name}</h1>
        <p className="text-dark-300 text-lg max-w-2xl mx-auto">{game.description}</p>
      </motion.div>

      {/* Game Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="gaming-card p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-xl font-bold text-white mb-2">Players</h3>
          <p className="text-dark-300">{game.players}</p>
        </div>
        
        <div className="gaming-card p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-xl font-bold text-white mb-2">Average Bet</h3>
          <p className="text-primary-400 font-semibold">{game.avgBet}</p>
        </div>
        
        <div className="gaming-card p-6 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-xl font-bold text-white mb-2">Active Challenges</h3>
          <p className="text-yellow-400 font-semibold">{game.activeChallenges}</p>
        </div>
      </motion.div>

      {/* Game Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gaming-card p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Game Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {game.rules.map((rule, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-dark-300">{rule}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link
          to="/challenges"
          className="btn-primary flex items-center justify-center gap-2"
        >
          <FaPlus />
          Create Challenge
        </Link>
        
        <Link
          to="/challenges"
          className="btn-outline flex items-center justify-center gap-2"
        >
          <FaTrophy />
          View Challenges
        </Link>
        
        <Link
          to="/games"
          className="btn-outline flex items-center justify-center gap-2"
        >
          <FaGamepad />
          Back to Games
        </Link>
      </motion.div>
    </div>
  );
};

export default GameDetail;
