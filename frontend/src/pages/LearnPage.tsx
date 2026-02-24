import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSessionStore } from '../store/useSessionStore'
import './LearnPage.css'

function LearnPage() {
  const recordPageView = useSessionStore((state) => state.recordPageView)

  useEffect(() => {
    recordPageView('learn')
  }, [recordPageView])

  return (
    <div className="learn-page">
      <header className="learn-header">
        <h1>Learn About Lottery Mathematics</h1>
        <p>Understanding the true odds behind lottery games</p>
      </header>

      <div className="learn-content">
        <section className="learn-section">
          <h2>What is Probability?</h2>
          <p>
            Probability is the mathematical likelihood that an event will occur. It's expressed as a number between
            0 and 1, where 0 means impossible and 1 means certain. For example, the probability of flipping heads on
            a fair coin is 0.5 (or 50%), since there are two equally likely outcomes.
          </p>
          <div className="example-box">
            <h3>Example: Rolling a Die</h3>
            <p>
              When you roll a fair six-sided die:
            </p>
            <ul>
              <li>There are 6 possible outcomes (1, 2, 3, 4, 5, 6)</li>
              <li>The probability of rolling a 3 is 1/6 ≈ 16.67%</li>
              <li>The probability of rolling any number is equally likely</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>Combinations and Permutations</h2>
          <p>
            When calculating lottery odds, we need to understand how many different ways items can be selected and
            arranged. In most lotteries, the order of numbers doesn't matter, so we use <strong>combinations</strong>.
          </p>
          <div className="example-box">
            <h3>Example: Picking 6 from 49</h3>
            <p>
              In a typical lottery where you pick 6 numbers from 49:
            </p>
            <ul>
              <li>The number of possible combinations is approximately 13.98 million</li>
              <li>Your chance of winning with one ticket is 1 in 13.98 million</li>
              <li>That's a 0.0000072% chance of winning!</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>Expected Value</h2>
          <p>
            Expected value is the average amount you expect to win or lose per bet in the long run. For lotteries,
            the expected value is always negative, meaning you lose money on average.
          </p>
          <div className="example-box">
            <h3>Example: A Simple Lottery</h3>
            <p>
              Imagine a lottery where:
            </p>
            <ul>
              <li>Ticket costs: $1</li>
              <li>Probability of winning $10: 10%</li>
              <li>Probability of winning nothing: 90%</li>
              <li>Expected value = (0.10 x $10) + (0.90 x $0) - $1 = $1 - $1 = $0</li>
              <li>Over time, you'd expect to break even, but real lotteries are worse!</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>Why Lotteries Always Favor the House</h2>
          <p>
            Real-world lotteries keep a percentage of ticket sales (typically 30-50%) before paying out prizes.
            This is called the "house advantage." Here's what this means:
          </p>
          <div className="example-box">
            <h3>Example: Real Lottery Math</h3>
            <div className="math-breakdown">
              <p><strong>For every $100 in ticket sales:</strong></p>
              <ul>
                <li>$40-50 goes to the lottery organizer (state, company, etc.)</li>
                <li>$40-50 is distributed to winners</li>
                <li>The remaining funds go to causes (education, infrastructure, etc.)</li>
                <li><strong>Result: Players get back only 50-60 cents for every dollar spent</strong></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="learn-section highlight-section">
          <h2>Lottery vs Investing: A 30-Year Comparison</h2>
          <p>
            What if you invested the money you'd spend on lottery tickets instead? Let's compare
            spending $20 per week on lottery tickets versus investing that same amount.
          </p>
          <div className="comparison-grid">
            <div className="comparison-card lottery-side">
              <h3>Lottery Tickets</h3>
              <div className="comparison-stat">
                <span className="comparison-label">Weekly spend</span>
                <span className="comparison-value">$20</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">Total spent (30 yrs)</span>
                <span className="comparison-value">$31,200</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">Expected return</span>
                <span className="comparison-value negative">$15,600</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">Net result</span>
                <span className="comparison-value negative">-$15,600</span>
              </div>
              <p className="comparison-note">Based on average 50% payout ratio</p>
            </div>

            <div className="comparison-card invest-side">
              <h3>Index Fund Investment</h3>
              <div className="comparison-stat">
                <span className="comparison-label">Weekly invest</span>
                <span className="comparison-value">$20</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">Total invested (30 yrs)</span>
                <span className="comparison-value">$31,200</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">Portfolio value</span>
                <span className="comparison-value positive">~$102,000</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">Net gain</span>
                <span className="comparison-value positive">+$70,800</span>
              </div>
              <p className="comparison-note">Based on ~7% average annual return (S&P 500 historical)</p>
            </div>
          </div>
          <p className="comparison-takeaway">
            <strong>The difference:</strong> Over 30 years, the lottery player loses about $15,600 while the
            investor gains about $70,800. That's an $86,400 gap from the same $20 per week.
          </p>
        </section>

        <section className="learn-section">
          <h2>The "Gambler's Fallacy"</h2>
          <p>
            Many people believe that past results affect future outcomes in independent events. This is false.
            Each lottery draw is independent, and previous outcomes don't influence future ones.
          </p>
          <div className="example-box">
            <h3>Common Misconceptions</h3>
            <ul>
              <li><strong>Misconception:</strong> "7 was drawn last week, so it's less likely this week"</li>
              <li><strong>Reality:</strong> Each number has exactly the same chance every draw</li>
              <li><strong>Misconception:</strong> "I'm due for a win after losing many times"</li>
              <li><strong>Reality:</strong> Past losses don't increase your chance of winning</li>
              <li><strong>Misconception:</strong> "These numbers are 'hot' so they're more likely"</li>
              <li><strong>Reality:</strong> Frequently drawn numbers are just as likely as rare ones</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>The Law of Large Numbers</h2>
          <p>
            As you play more games, your actual results converge toward the theoretical probability. However,
            this doesn't mean you'll "eventually win" - it means you'll eventually lose even more money!
          </p>
          <div className="example-box">
            <h3>What the Numbers Show</h3>
            <ul>
              <li>Play 1 lottery ticket: You might win once in a lifetime</li>
              <li>Play 100 tickets: Your odds improve, but expected loss is still your full investment</li>
              <li>Play 1,000 tickets: You're closer to the statistical average (losing ~50-60% of money spent)</li>
              <li>The more you play, the closer your losses approach the mathematical expectation</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>Smart Financial Lessons</h2>
          <p>
            Understanding lottery mathematics teaches us valuable lessons about probability and economic decisions:
          </p>
          <div className="lessons-grid">
            <div className="lesson-card">
              <h3>Risk vs Reward</h3>
              <p>
                Always evaluate the odds versus the potential reward. In lotteries, the risk-to-reward ratio is
                extremely unfavorable compared to other investments.
              </p>
            </div>
            <div className="lesson-card">
              <h3>Statistical Thinking</h3>
              <p>
                Make decisions based on data and probability, not hope or superstition. This applies to investing,
                insurance, and major life decisions.
              </p>
            </div>
            <div className="lesson-card">
              <h3>Long-Term Planning</h3>
              <p>
                Lottery winnings are unreliable. Building wealth through regular saving and investing (even small
                amounts) is much more reliable than hoping for a jackpot.
              </p>
            </div>
            <div className="lesson-card">
              <h3>Psychology of Loss</h3>
              <p>
                Understand how our brains trick us into poor decisions. We overestimate small probabilities and
                underestimate our losses when they're spread over time.
              </p>
            </div>
          </div>
        </section>

        <section className="learn-section cta-section">
          <h2>See It for Yourself</h2>
          <p>
            The best way to understand lottery odds is to experience them firsthand. Try our interactive
            lottery simulator and watch how many draws it takes to match your numbers.
          </p>
          <div className="cta-buttons">
            <Link to="/games" className="cta-primary">
              Try the Simulator
            </Link>
            <Link to="/stats" className="cta-secondary">
              View Statistics
            </Link>
          </div>
        </section>

        <section className="learn-section warning-section">
          <h2>Responsible Gaming</h2>
          <p>
            If you ever feel that lottery play is becoming a problem, or if it's affecting your financial health,
            please reach out for help:
          </p>
          <div className="warning-box">
            <ul>
              <li>National Problem Gambling Helpline: 1-800-522-4700</li>
              <li>Gamblers Anonymous: <a href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener noreferrer">www.gamblersanonymous.org</a></li>
              <li>NCPG (Council on Compulsive Gambling): <a href="https://www.ncpg.org/" target="_blank" rel="noopener noreferrer">www.ncpg.org</a></li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              <strong>Remember:</strong> Lottery tickets should only be used as entertainment with money you can
              afford to lose. Never rely on them for financial planning.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LearnPage
