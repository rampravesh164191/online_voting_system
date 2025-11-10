import { BookOpen, Shield, Vote, CheckCircle } from 'lucide-react';

export default function UserGuide() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center mb-6">
        <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Voting Guide</h2>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            Getting Started
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">1</span>
              <div>
                <strong>Create Your Account:</strong> Sign up with a valid email address and secure password.
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">2</span>
              <div>
                <strong>Complete Your Profile:</strong> Provide your personal information, voter ID, and upload required documents.
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">3</span>
              <div>
                <strong>Wait for Verification:</strong> Our administrators will review and verify your profile within 24-48 hours.
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Vote className="w-6 h-6 text-blue-600 mr-2" />
            How to Vote
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">1</span>
              <div>
                <strong>Browse Elections:</strong> View active elections in the Elections tab.
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">2</span>
              <div>
                <strong>Review Candidates:</strong> Read about candidates and their platforms before voting.
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">3</span>
              <div>
                <strong>Request Voting Link:</strong> Click "Proceed to Vote" to generate your secure voting link.
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">4</span>
              <div>
                <strong>Complete Verification:</strong> Allow camera access for facial verification during voting.
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">5</span>
              <div>
                <strong>Cast Your Vote:</strong> Select your candidate and confirm your choice. You can only vote once per election.
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
            Security Features
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Time-Limited Links:</strong> Voting links expire 2 minutes after generation for security.
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Facial Recognition:</strong> Your identity is verified through facial recognition during voting.
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Location Tracking:</strong> Vote location is recorded to prevent fraud while maintaining privacy.
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Vote Anonymity:</strong> Your vote is encrypted and anonymized to protect your privacy.
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Audit Trail:</strong> All actions are logged for security and transparency.
              </div>
            </li>
          </ul>
        </section>

        <section className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Common Issues</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>Q: My voting link expired. What should I do?</strong>
              <p>A: Request a new voting link from the election details page. Make sure to use it within 2 minutes.</p>
            </div>
            <div>
              <strong>Q: Facial verification is not working.</strong>
              <p>A: Ensure you're in a well-lit area and allow camera permissions. Your photo should match your registered profile photo.</p>
            </div>
            <div>
              <strong>Q: Can I change my vote after submitting?</strong>
              <p>A: No, votes are final once submitted. Please review your selection carefully before confirming.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
