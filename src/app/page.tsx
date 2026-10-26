import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-very-light-blue via-white to-light-blue">
      <nav className="bg-primary-dark/95 backdrop-blur-sm text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">TEMPO</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/login" className="hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                Login
              </Link>
              <Link href="/register" className="bg-white text-primary-dark hover:bg-light-blue px-5 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-16 pb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-6">
            <span className="text-sm font-medium text-primary">School Appointment & Request Management</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-text-dark mb-6 tracking-tight">
            Streamline School
            <span className="block text-primary">Services in One Place</span>
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            TEMPO centralizes document requests, payment verifications, and counseling appointments 
            for Registrar, Finance, and Guidance Offices with seamless coordination.
          </p>
          <div className="flex gap-4 justify-center mt-10">
            <Link href="/register" className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
              Register as Student
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3 inline-block shadow-md hover:shadow-lg transition-all duration-200">
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 pb-16">
          <div className="group card text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-t-4 border-primary">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-dark mb-3">Registrar Office</h3>
            <p className="text-text-secondary leading-relaxed">Submit, track, and manage official document requests with real-time status updates</p>
          </div>

          <div className="group card text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-t-4 border-success">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-dark mb-3">Finance Office</h3>
            <p className="text-text-secondary leading-relaxed">Streamlined payment status verification for document processing</p>
          </div>

          <div className="group card text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-t-4 border-warning">
            <div className="w-16 h-16 bg-gradient-to-br from-warning to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-dark mb-3">Guidance Office</h3>
            <p className="text-text-secondary leading-relaxed">Book and manage counseling appointments with ease and efficiency</p>
          </div>
        </div>
      </main>

      <footer className="bg-primary-dark text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-lg font-bold">TEMPO</span>
            </div>
            <p className="text-light-blue text-sm">© 2026 TEMPO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
