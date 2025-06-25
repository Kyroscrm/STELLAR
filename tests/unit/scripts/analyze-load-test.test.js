const { generateReport, calculateStats, compareWithBaseline } = require('../../../scripts/analyze-load-test');

describe('Load Test Analysis', () => {
  const mockMetrics = {
    http_reqs: {
      values: { count: 1000 }
    },
    http_req_duration: {
      values: {
        p95: 450,
        p99: 850,
        avg: 200,
        med: 180
      }
    },
    http_req_failed: {
      values: {
        rate: 0.005,
        count: 5
      }
    },
    data_received: {
      values: { count: 10000 }
    },
    leads_created: {
      values: { count: 50 }
    },
    estimates_created: {
      values: { count: 30 }
    },
    invoices_created: {
      values: { count: 20 }
    },
    dashboard_load_time: {
      values: { avg: 300 }
    },
    api_errors: {
      values: { rate: 0.002 }
    }
  };

  const mockTestResults = {
    metrics: mockMetrics,
    testInfo: {
      type: 'smoke',
      env: 'staging',
      timestamp: '2024-01-01T00:00:00Z',
      duration: '1m'
    },
    thresholds: {
      'http_req_duration': { ok: true },
      'http_req_failed': { ok: true },
      'dashboard_load_time': { ok: true }
    }
  };

  describe('calculateStats', () => {
    it('should calculate basic metrics correctly', () => {
      const stats = calculateStats(mockMetrics);

      expect(stats.totalRequests).toBe(1000);
      expect(stats.duration.p95).toBe(450);
      expect(stats.duration.avg).toBe(200);
      expect(stats.errors.rate).toBe(0.005);
      expect(stats.throughput).toBeGreaterThan(0);
    });

    it('should handle missing custom metrics', () => {
      const metricsWithoutCustom = {
        ...mockMetrics,
        leads_created: undefined,
        estimates_created: undefined
      };

      const stats = calculateStats(metricsWithoutCustom);

      expect(stats.customMetrics.leads).toBe(0);
      expect(stats.customMetrics.estimates).toBe(0);
    });
  });

  describe('compareWithBaseline', () => {
    const baselineStats = {
      duration: {
        p95: 400,
        p99: 800,
        avg: 180
      },
      errors: {
        rate: 0.004
      },
      throughput: 90
    };

    const currentStats = {
      duration: {
        p95: 450,
        p99: 850,
        avg: 200
      },
      errors: {
        rate: 0.005
      },
      throughput: 100
    };

    it('should detect response time degradation', () => {
      const { insights } = compareWithBaseline(currentStats, baselineStats);
      const p95Insight = insights.find(i => i.metric === 'p95 response time');

      expect(p95Insight).toBeDefined();
      expect(p95Insight.change).toBe('12.5%');
    });

    it('should detect error rate changes', () => {
      const degradedStats = {
        ...currentStats,
        errors: { rate: 0.015 }
      };

      const { insights } = compareWithBaseline(degradedStats, baselineStats);
      const errorInsight = insights.find(i => i.metric === 'error rate');

      expect(errorInsight).toBeDefined();
      expect(errorInsight.level).toBe('critical');
    });

    it('should detect throughput improvements', () => {
      const improvedStats = {
        ...currentStats,
        throughput: 150
      };

      const { insights } = compareWithBaseline(improvedStats, baselineStats);
      const throughputInsight = insights.find(i => i.metric === 'throughput');

      expect(throughputInsight).toBeDefined();
      expect(throughputInsight.message).toContain('increased');
    });
  });

  describe('generateReport', () => {
    it('should generate a complete report', () => {
      const report = generateReport(mockTestResults);

      expect(report.summary).toMatchObject({
        testType: 'smoke',
        environment: 'staging'
      });
      expect(report.thresholds.passed).toBe(true);
      expect(report.customMetrics).toMatchObject({
        leads: 50,
        estimates: 30,
        invoices: 20
      });
    });

    it('should include comparison when baseline is provided', () => {
      const baselineResults = {
        ...mockTestResults,
        metrics: {
          ...mockMetrics,
          http_req_duration: {
            values: {
              p95: 400,
              p99: 800,
              avg: 180,
              med: 160
            }
          }
        }
      };

      const report = generateReport(mockTestResults, baselineResults);

      expect(report.comparison).toBeDefined();
      expect(report.comparison.insights).toBeInstanceOf(Array);
      expect(report.comparison.changes).toBeDefined();
    });

    it('should handle failed thresholds', () => {
      const failedResults = {
        ...mockTestResults,
        thresholds: {
          'http_req_duration': { ok: false, message: 'P95 too high' }
        }
      };

      const report = generateReport(failedResults);

      expect(report.thresholds.passed).toBe(false);
      expect(report.thresholds.details[0]).toMatchObject({
        name: 'http_req_duration',
        passed: false,
        message: 'P95 too high'
      });
    });
  });
});
