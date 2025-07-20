import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export const alt = 'ResumeGPT - AI-Powered Resume Builder';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage:
              'radial-gradient(circle at 30% 40%, #1e293b 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1e40af 0%, transparent 50%)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Background Grid Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='m0 .5h31.5v31'/%3e%3c/svg%3e")`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Main Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              zIndex: 10,
              padding: '80px 60px',
            }}
          >
            {/* Logo/Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)',
                }}
              >
                <div
                  style={{
                    color: 'white',
                    fontSize: '28px',
                    fontWeight: 'bold',
                  }}
                >
                  R
                </div>
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: 'white',
                  letterSpacing: '-0.02em',
                }}
              >
                ResumeGPT
              </div>
            </div>

            {/* Main Headline */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: '800',
                lineHeight: '1.1',
                marginBottom: '24px',
                background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
                maxWidth: '900px',
              }}
            >
              AI-Powered Resume Builder
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                lineHeight: '1.4',
                marginBottom: '40px',
                maxWidth: '700px',
                textAlign: 'center',
              }}
            >
              Create perfect resumes with AI. Type naturally, watch your resume
              build in real-time.
            </div>

            {/* Feature Pills */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {['AI-Powered', 'Real-time Building', 'ATS Optimized'].map(
                (feature) => (
                  <div
                    key={feature}
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '50px',
                      color: '#60a5fa',
                      fontSize: '16px',
                      fontWeight: '500',
                    }}
                  >
                    {feature}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Decorative Elements */}
          <div
            style={{
              position: 'absolute',
              top: '60px',
              right: '60px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              opacity: 0.1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '60px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              opacity: 0.1,
            }}
          />

          {/* Bottom URL */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              fontSize: '16px',
              color: '#64748b',
              fontWeight: '500',
            }}
          >
            tryresumegpt.vercel.app
          </div>
        </div>
      ),
      {
        ...size,
      },
    );
  } catch (error) {
    console.error('Error generating OpenGraph image:', error);
    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '16px',
            }}
          >
            ResumeGPT
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#94a3b8',
            }}
          >
            AI-Powered Resume Builder
          </div>
        </div>
      ),
      {
        ...size,
      },
    );
  }
}
