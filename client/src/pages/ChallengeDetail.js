import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const ChallengeDetail = () => {
  const { challengeId } = useParams();

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">Challenge Details</h1>
        <p className="text-dark-300">Challenge ID: {challengeId}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gaming-card p-6 text-center"
      >
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-dark-300 mb-4">
          Detailed challenge view with real-time updates and match information will be available soon.
        </p>
        <Link
          to="/challenges"
          className="btn-primary flex items-center justify-center gap-2 mx-auto"
        >
          <FaArrowLeft />
          Back to Challenges
        </Link>
      </motion.div>
    </div>
  );
};

export default ChallengeDetail;
