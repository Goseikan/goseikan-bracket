import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTournament } from "../contexts/TournamentContext";
import { Trophy, Users, Sword, Calendar, ArrowRight, User } from "lucide-react";

/**
 * HomePage component - Landing page with Material Design 3 styling
 * Shows tournament information and registration/login options
 */

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { tournament, dojos, teams, users } = useTournament();

  // Calculate tournament statistics
  const stats = {
    totalParticipants: users.length,
    totalTeams: teams.length,
    totalDojos: dojos.length,
    tournamentStatus: tournament?.status || "registration",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-accent-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Tournament title */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                <Sword className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-display-medium sm:text-display-large font-bold text-gray-900">
                Goryuki
              </h1>
            </div>

            {/* Tournament subtitle */}
            <p className="text-headline-small text-gray-600 mb-8 max-w-3xl mx-auto">
              {tournament
                ? tournament.name
                : "Welcome to the premier kendo competition platform"}
            </p>

            {/* Tournament status badge */}
            {tournament && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-label-large font-medium mb-8">
                <Calendar className="w-4 h-4 mr-2" />
                Status:{" "}
                {tournament.status.charAt(0).toUpperCase() +
                  tournament.status.slice(1)}{" "}
                Stage
              </div>
            )}

            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user ? (
                <>
                  <Link to="/register" className="btn-filled w-full sm:w-auto">
                    <Users className="w-5 h-5 mr-2" />
                    Register for Tournament
                  </Link>
                  <Link to="/login" className="btn-outlined w-full sm:w-auto">
                    Login to Account
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="btn-filled w-full sm:w-auto">
                    <User className="w-5 h-5 mr-2" />
                    View Dashboard
                  </Link>
                  <Link to="/bracket" className="btn-outlined w-full sm:w-auto">
                    <Trophy className="w-5 h-5 mr-2" />
                    Tournament Bracket
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-headline-large font-bold text-gray-900 mb-4">
              Current Tournament Stats
            </h2>
            <p className="text-body-large text-gray-600">
              See how many competitors are registered and ready to compete
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="card text-center p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="text-display-small font-bold text-gray-900">
                {stats.totalParticipants}
              </div>
              <div className="text-body-medium text-gray-600">Participants</div>
            </div>

            <div className="card text-center p-6">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-accent-600" />
              </div>
              <div className="text-display-small font-bold text-gray-900">
                {stats.totalTeams}
              </div>
              <div className="text-body-medium text-gray-600">Teams</div>
            </div>

            <div className="card text-center p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sword className="w-6 h-6 text-gray-600" />
              </div>
              <div className="text-display-small font-bold text-gray-900">
                {stats.totalDojos}
              </div>
              <div className="text-body-medium text-gray-600">Dojos</div>
            </div>

            <div className="card text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-title-large font-bold text-gray-900 capitalize">
                {stats.tournamentStatus}
              </div>
              <div className="text-body-medium text-gray-600">Stage</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-headline-large font-bold text-gray-900 mb-4">
              How the Tournament Works
            </h2>
            <p className="text-body-large text-gray-600 max-w-3xl mx-auto">
              Our tournament follows traditional kendo competition format with
              modern digital tracking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Registration Phase */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-title-large font-semibold text-gray-900 mb-3">
                Registration
              </h3>
              <p className="text-body-medium text-gray-600 mb-4">
                Register with your dojo and team information. Include your kendo
                rank to help with tournament seeding.
              </p>
              <div className="text-label-medium text-primary-600 font-medium">
                Step 1
              </div>
            </div>

            {/* Seed Stage */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-title-large font-semibold text-gray-900 mb-3">
                Seed Stage
              </h3>
              <p className="text-body-medium text-gray-600 mb-4">
                Teams compete in round-robin groups. Rankings determine
                advancement to the main tournament bracket.
              </p>
              <div className="text-label-medium text-accent-600 font-medium">
                Step 2
              </div>
            </div>

            {/* Main Tournament */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Sword className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-title-large font-semibold text-gray-900 mb-3">
                Main Tournament
              </h3>
              <p className="text-body-medium text-gray-600 mb-4">
                Double elimination bracket with real-time scoring tracking for
                men, kote, tsuki, do, and hansoku.
              </p>
              <div className="text-label-medium text-green-600 font-medium">
                Step 3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-headline-large font-bold text-white mb-4">
            Ready to Compete?
          </h2>
          <p className="text-body-large text-primary-100 mb-8">
            Join the tournament today and showcase your kendo skills
          </p>

          {!user ? (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-full text-title-medium font-semibold hover:bg-gray-50 transition-colors"
            >
              Register Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-full text-title-medium font-semibold hover:bg-gray-50 transition-colors"
            >
              View Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
