import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTournament } from "../contexts/TournamentContext";
import { Trophy, Users, Sword, Calendar, ArrowRight, User } from "lucide-react";

/**
 * HomePage component - Landing page with Material Design 3 styling
 * REGISTRATION-ONLY MODE: Focus on collecting registrations for upcoming tournament
 * Tournament features temporarily disabled. See backups/tournament-features/ for restoration.
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

            {/* Registration subtitle */}
            <p className="text-headline-small text-gray-600 mb-8 max-w-3xl mx-auto">
              Register now for the upcoming kendo tournament
            </p>

            {/* Registration status badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-label-large font-medium mb-8">
              <Calendar className="w-4 h-4 mr-2" />
              Registration Open - Secure Your Spot Today
            </div>

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
                    Manage Registration
                  </Link>
                  <p className="text-body-medium text-gray-600 text-center">
                    Welcome back! Update your team and dojo information anytime.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Registration Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-headline-large font-bold text-gray-900 mb-4">
              Current Registration Stats
            </h2>
            <p className="text-body-large text-gray-600">
              Join the growing community of registered participants
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
              <div className="text-title-large font-bold text-gray-900">
                Open
              </div>
              <div className="text-body-medium text-gray-600">Registration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-headline-large font-bold text-gray-900 mb-4">
              How to Register
            </h2>
            <p className="text-body-large text-gray-600 max-w-3xl mx-auto">
              Simple registration process to secure your place in the upcoming tournament
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Create Account */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-title-large font-semibold text-gray-900 mb-3">
                Create Account
              </h3>
              <p className="text-body-medium text-gray-600 mb-4">
                Sign up with your personal information and kendo rank. All skill levels welcome.
              </p>
              <div className="text-label-medium text-primary-600 font-medium">
                Step 1
              </div>
            </div>

            {/* Team & Dojo Info */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-title-large font-semibold text-gray-900 mb-3">
                Team & Dojo
              </h3>
              <p className="text-body-medium text-gray-600 mb-4">
                Add your dojo information and form teams with other participants.
              </p>
              <div className="text-label-medium text-accent-600 font-medium">
                Step 2
              </div>
            </div>

            {/* Confirmation */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-title-large font-semibold text-gray-900 mb-3">
                Await Tournament
              </h3>
              <p className="text-body-medium text-gray-600 mb-4">
                You're registered! Tournament details and brackets will be announced closer to the event date.
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
            Don't Miss Out!
          </h2>
          <p className="text-body-large text-primary-100 mb-8">
            Registration is now open. Secure your spot in the upcoming tournament
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
              Manage Registration
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
