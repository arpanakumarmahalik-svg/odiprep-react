import { Link } from 'react-router-dom'
import {
  Upload,
  FileText,
  Award,
  Camera,
  Brain,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import Logo from '../components/Logo'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size={38} />
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Log in
            </Link>
            <Link to="/auth" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div
          className="mx-auto w-44 sm:w-56 rounded-3xl p-4 mb-8"
          style={{ backgroundColor: '#D6E6F3' }}
        >
          <img src="/logo.png" alt="OdiPrep" className="w-full h-auto" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Prepare for SCETVT exams
          <br />
          <span className="text-blue-600">the smart way</span>
        </h1>
        <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your notes, get AI-generated mock tests in the real SCETVT
          pattern, write your answers by hand, and get instant AI evaluation
          with marks and feedback.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/auth" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
            Start Free
          </Link>
          <a href="#how-it-works" className="text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50">
            How it works
          </a>
        </div>
      </section>

      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            How it works
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <Upload className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">1. Upload notes</h3>
              <p className="mt-2 text-sm text-gray-600">
                Upload your study notes as PDF, Word, PPT, or text file.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">2. Take the test</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get a mock test in real SCETVT pattern. Write answers on paper.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <Camera className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">3. Get evaluated</h3>
              <p className="mt-2 text-sm text-gray-600">
                Upload photos of your answers and get instant AI marks and feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Why OdiPrep
          </h2>
          <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-blue-600" />}
              title="AI-generated tests"
              text="Tests made directly from your own notes."
            />
            <FeatureCard
              icon={<Award className="w-6 h-6 text-blue-600" />}
              title="Real exam pattern"
              text="Matches actual SCETVT marks distribution."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
              title="Proctored tests"
              text="Tab-switch detection keeps practice honest."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-blue-600" />}
              title="Instant feedback"
              text="Know your marks and mistakes right away."
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            SCETVT Exam Pattern
          </h2>
          <p className="mt-2 text-center text-gray-600">
            70 marks &middot; 3 hours
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden border border-gray-200">
              <thead className="bg-blue-600 text-white text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Section</th>
                  <th className="px-4 py-3 text-left">Questions</th>
                  <th className="px-4 py-3 text-left">Attempt</th>
                  <th className="px-4 py-3 text-left">Marks each</th>
                  <th className="px-4 py-3 text-left">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-3 font-medium">A</td>
                  <td className="px-4 py-3">10</td>
                  <td className="px-4 py-3">All 10</td>
                  <td className="px-4 py-3">2</td>
                  <td className="px-4 py-3">20</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-3 font-medium">B</td>
                  <td className="px-4 py-3">7</td>
                  <td className="px-4 py-3">Any 6</td>
                  <td className="px-4 py-3">5</td>
                  <td className="px-4 py-3">30</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="px-4 py-3 font-medium">C</td>
                  <td className="px-4 py-3">4</td>
                  <td className="px-4 py-3">Any 2</td>
                  <td className="px-4 py-3">10</td>
                  <td className="px-4 py-3">20</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to prepare smarter?
          </h2>
          <p className="mt-3 text-gray-600">
            Join OdiPrep and start turning your notes into real exam practice.
          </p>
          <Link to="/auth" className="mt-6 inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700">
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} OdiPrep. Built for Odisha polytechnic students.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="p-5 rounded-lg border border-gray-200 bg-white">
      <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{text}</p>
    </div>
  )
}