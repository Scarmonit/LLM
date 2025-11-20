export class EnhancedHealthScoring {
  constructor() {
    this.weights = {
      successRate: 0.40,      // 40% - most important
      responseTime: 0.25,     // 25% - critical for UX
      availability: 0.20,     // 20% - uptime matters
      recentPerformance: 0.15 // 15% - momentum factor
    };
    this.baselines = {
      targetResponseTime: 200,  // ms - adjust based on your requirements
      maxAcceptableResponseTime: 2000 // ms
    };
  }

  calculateScore(stats, metadata = {}) {
    const now = Date.now();
    const { 
      successRate = 1.0,
      avgResponseTime = 0,
      totalRequests = 0,
      lastCheck = now,
      totalChecks = 0,
      recentResponseTimes = []
    } = stats;

    // Score 1: Success Rate (0-40 points)
    const successScore = Math.max(0, Math.min(40, successRate * 40));

    // Score 2: Response Time (0-25 points, with bonus for speed)
    let responseScore = 25;
    if (avgResponseTime <= this.baselines.targetResponseTime) {
      responseScore = 25 + Math.min(5, (this.baselines.targetResponseTime - avgResponseTime) / 10);
    } else if (avgResponseTime >= this.baselines.maxAcceptableResponseTime) {
      responseScore = 0;
    } else {
      responseScore = 25 * (1 - (avgResponseTime - this.baselines.targetResponseTime) / 
                      (this.baselines.maxAcceptableResponseTime - this.baselines.targetResponseTime));
    }

    // Score 3: Availability (0-20 points)
    const timeSinceCheck = now - lastCheck;
    const maxAcceptableInterval = 120000; // 2 minutes
    const availabilityScore = Math.max(0, 20 * (1 - timeSinceCheck / maxAcceptableInterval));

    // Score 4: Recent Performance (0-15 points + bonus)
    let recentPerformanceScore = 15;
    if (recentResponseTimes && recentResponseTimes.length > 0) {
      const recentAvg = recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length;
      
      // Trend analysis (improving performance gets bonus)
      if (recentResponseTimes.length >= 3) {
        const trend = this.calculateTrend(recentResponseTimes);
        recentPerformanceScore += Math.max(-5, Math.min(5, trend * 2.5));
      }
      
      // Responsiveness bonus/penalty
      if (recentAvg <= this.baselines.targetResponseTime * 0.8) {
        recentPerformanceScore += 2;
      } else if (recentAvg >= this.baselines.maxAcceptableResponseTime * 0.8) {
        recentPerformanceScore -= 3;
      }
    }

    const totalScore = successScore + responseScore + availabilityScore + recentPerformanceScore;
    
    return {
      score: Math.max(0, Math.min(100, Math.round(totalScore))),
      components: {
        success: successScore,
        response: responseScore,
        availability: availabilityScore,
        recent: recentPerformanceScore
      },
      verdict: this.getVerdict(totalScore)
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const recent = values.slice(-Math.min(5, values.length));
    const first = recent.slice(0, Math.floor(recent.length / 2));
    const second = recent.slice(Math.floor(recent.length / 2));
    
    const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
    const avgSecond = second.reduce((a, b) => a + b, 0) / second.length;
    
    const improvement = (avgFirst - avgSecond) / avgFirst;
    return Math.max(-1, Math.min(1, improvement));
  }

  getVerdict(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'HEALTHY';
    if (score >= 70) return 'GOOD';
    if (score >= 50) return 'DEGRADED';
    if (score >= 30) return 'STRUGGLING';
    return 'CRITICAL';
  }
}
