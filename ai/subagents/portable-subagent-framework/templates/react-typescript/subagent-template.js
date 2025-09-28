#!/usr/bin/env node

/**
 * {{projectName}} Subagent - React TypeScript Implementation
 * 
 * Architecture compliance enforcer and code quality guardian for {{projectName}}.
 * Based on proven patterns from SmugMug Photo Discovery project.
 * 
 * Generated: {{generatedAt}}
 * Framework: Portable Subagent Framework v{{frameworkVersion}}
 * Tech Stack: {{techStack}}
 * Organization: {{organization}}
 */

const fs = require('fs');
const path = require('path');

class {{projectName}}Subagent {
  constructor() {
    this.config = this.loadConfig();
    this.name = this.config.subagent.name;
    this.version = this.config.subagent.version;
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'subagent-config.json');
      const configContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      console.error('Failed to load subagent configuration:', error.message);
      return null;
    }
  }

  /**
   * React/TypeScript specific validation
   */
  validateCode(code, options = {}) {
    const results = {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: [],
      metrics: {}
    };

    // Component size validation (React/TypeScript specific)
    if (this.isReactComponent(code)) {
      this.validateComponentSize(code, results);
      this.validateComponentProps(code, results);
      this.validateHookUsage(code, results);
      this.validateAgentIntegration(code, results);
    }

    // TypeScript validation
    this.validateTypeScript(code, results);
    
    // Performance validation
    this.validatePerformance(code, results);
    
    // Memory leak validation
    this.validateMemoryManagement(code, results);
    
    // Calculate metrics
    results.metrics = this.calculateReactMetrics(code);
    
    return results;
  }

  isReactComponent(code) {
    return code.includes('export const') && 
           (code.includes('React.FC') || code.includes('JSX.Element') || code.includes('return <'));
  }

  validateComponentSize(code, results) {
    const lines = code.split('\n').length;
    const maxLines = this.config.rules.component_limits?.max_lines || 200;
    
    if (lines > maxLines) {
      results.violations.push({
        type: 'god_component',
        message: `Component has ${lines} lines, exceeds limit of ${maxLines}`,
        severity: 'critical',
        fix: 'Break component into smaller, single-responsibility components',
        codeExample: this.getComponentSizeFix()
      });
      results.isValid = false;
    }
  }

  validateComponentProps(code, results) {
    const propsMatch = code.match(/interface\s+\w+Props\s*{([^}]+)}/);
    if (propsMatch) {
      const propsContent = propsMatch[1];
      const propCount = (propsContent.match(/\w+[?]?:/g) || []).length;
      const maxProps = this.config.rules.component_limits?.max_props || 5;
      
      if (propCount > maxProps) {
        results.violations.push({
          type: 'complex_props',
          message: `Component has ${propCount} props, exceeds limit of ${maxProps}`,
          severity: 'high',
          fix: 'Use composition pattern or group related props into objects',
          codeExample: this.getPropsFix()
        });
        results.isValid = false;
      }
    }
  }

  validateHookUsage(code, results) {
    // Check useEffect complexity
    const useEffectMatches = code.match(/useEffect\([^,]+,\s*\[([^\]]*)\]/g);
    if (useEffectMatches) {
      const maxDeps = this.config.rules.hook_constraints?.max_useeffect_dependencies || 3;
      
      useEffectMatches.forEach((match, index) => {
        const depsMatch = match.match(/\[([^\]]*)\]/);
        if (depsMatch && depsMatch[1]) {
          const deps = depsMatch[1].split(',').filter(d => d.trim()).length;
          if (deps > maxDeps) {
            results.violations.push({
              type: 'complex_hook',
              message: `useEffect #${index + 1} has ${deps} dependencies, exceeds limit of ${maxDeps}`,
              severity: 'high',
              fix: 'Extract complex logic into custom hooks with fewer dependencies',
              codeExample: this.getHookFix()
            });
            results.isValid = false;
          }
        }
      });
    }

    // Check for missing cleanup
    const hasUseEffect = code.includes('useEffect');
    const hasCleanup = code.includes('return () =>') || code.includes('return function');
    if (hasUseEffect && !hasCleanup) {
      results.warnings.push({
        type: 'potential_memory_leak',
        message: 'useEffect detected without cleanup function',
        severity: 'medium',
        fix: 'Add cleanup function to prevent memory leaks',
        codeExample: this.getCleanupFix()
      });
    }
  }

  validateAgentIntegration(code, results) {
    {{#if (includes standards 'agent-native')}}
    const hasAgentIntegration = code.includes('useDualInterface') || 
                              code.includes('AgentWrapper') ||
                              code.includes('agentInterface');
    
    if (this.isReactComponent(code) && !hasAgentIntegration) {
      results.suggestions.push({
        type: 'agent_integration',
        message: 'Component could benefit from agent-native capabilities',
        severity: 'low',
        fix: 'Add useDualInterface hook and AgentWrapper for agent compatibility',
        codeExample: this.getAgentIntegrationFix()
      });
    }
    {{/if}}
  }

  validateTypeScript(code, results) {
    // Check for any types
    if (code.includes(': any') || code.includes('<any>')) {
      results.violations.push({
        type: 'type_safety',
        message: 'Found usage of "any" type in code',
        severity: 'high',
        fix: 'Replace any types with explicit TypeScript interfaces',
        codeExample: this.getTypeSafetyFix()
      });
      results.isValid = false;
    }

    // Check for missing interfaces
    const hasInterface = code.includes('interface ') || code.includes('type ');
    const hasProps = code.includes('Props>') || code.includes('props:');
    if (hasProps && !hasInterface) {
      results.warnings.push({
        type: 'missing_interfaces',
        message: 'Component uses props but lacks TypeScript interface definition',
        severity: 'medium',
        fix: 'Define explicit prop interfaces for type safety'
      });
    }
  }

  validatePerformance(code, results) {
    // Check for missing memoization
    const hasExpensiveOps = code.includes('.filter(') || 
                          code.includes('.map(') || 
                          code.includes('.reduce(');
    const hasMemoization = code.includes('useMemo') || 
                         code.includes('useCallback') ||
                         code.includes('React.memo');
    
    if (hasExpensiveOps && !hasMemoization) {
      results.warnings.push({
        type: 'performance',
        message: 'Expensive operations detected without memoization',
        severity: 'medium',
        fix: 'Use useMemo/useCallback to optimize performance',
        codeExample: this.getMemoizationFix()
      });
    }
  }

  validateMemoryManagement(code, results) {
    // Check for AbortController usage
    const hasAsyncOperation = code.includes('fetch(') || code.includes('axios.');
    const hasAbortController = code.includes('AbortController');
    
    if (hasAsyncOperation && !hasAbortController) {
      results.warnings.push({
        type: 'memory_management',
        message: 'Async operations without AbortController for cancellation',
        severity: 'medium',
        fix: 'Use AbortController to prevent memory leaks from unfinished requests'
      });
    }
  }

  calculateReactMetrics(code) {
    const lines = code.split('\n').length;
    const useStateCount = (code.match(/useState/g) || []).length;
    const useEffectCount = (code.match(/useEffect/g) || []).length;
    const conditionalCount = (code.match(/if\s*\(/g) || []).length;
    const loopCount = (code.match(/\.(map|filter|reduce|forEach)/g) || []).length;
    
    return {
      lines,
      complexity_score: useStateCount * 2 + useEffectCount * 3 + conditionalCount + loopCount,
      hook_count: useStateCount + useEffectCount,
      useState_count: useStateCount,
      useEffect_count: useEffectCount,
      {{#if (includes standards 'agent-native')}}
      agent_ready: code.includes('useDualInterface') || code.includes('AgentWrapper'),
      {{/if}}
      performance_optimized: code.includes('useMemo') || code.includes('useCallback'),
      typescript_coverage: code.includes('interface ') || code.includes('type '),
      has_cleanup: code.includes('return () =>') || code.includes('return function')
    };
  }

  // Fix examples for React/TypeScript
  getComponentSizeFix() {
    return `
// ❌ Before: God component
export const MegaComponent = ({ photos, filters, operations }) => {
  // 200+ lines of mixed responsibilities
};

// ✅ After: Broken into focused components  
export const PhotoManagement = ({ photos }) => (
  <div>
    <PhotoSearch photos={photos} />
    <PhotoFilters />
    <PhotoGrid />
    <BulkOperations />
  </div>
);
    `.trim();
  }

  getPropsFix() {
    return `
// ❌ Before: Too many props
interface ComponentProps {
  prop1: string;
  prop2: number;
  prop3: boolean;
  prop4: object;
  prop5: Function;
  prop6: string; // Too many!
}

// ✅ After: Grouped props
interface ComponentProps {
  data: DataProps;
  handlers: HandlerProps;
  config: ConfigProps;
}
    `.trim();
  }

  getHookFix() {
    return `
// ❌ Before: Complex useEffect
useEffect(() => {
  // Complex logic with many dependencies
}, [dep1, dep2, dep3, dep4, dep5]);

// ✅ After: Custom hook extraction
const useSearchResults = (photos, filters, engine) => {
  return useMemo(() => engine?.search(filters) || [], [photos, filters, engine]);
};
    `.trim();
  }

  getCleanupFix() {
    return `
// ❌ Before: Missing cleanup
useEffect(() => {
  const interval = setInterval(update, 1000);
  // No cleanup!
}, []);

// ✅ After: Proper cleanup
useEffect(() => {
  const controller = new AbortController();
  const interval = setInterval(update, 1000);
  
  return () => {
    controller.abort();
    clearInterval(interval);
  };
}, []);
    `.trim();
  }

  {{#if (includes standards 'agent-native')}}
  getAgentIntegrationFix() {
    return `
// ✅ Agent-native component pattern
import { useDualInterface, AgentWrapper } from '../agents';

export const MyComponent = ({ data }) => {
  const { agentInterface } = useDualInterface({
    componentId: 'my-component',
    data,
    state: componentState,
    setState: setComponentState,
    exposeGlobally: true
  });

  return (
    <AgentWrapper agentInterface={agentInterface}>
      <div data-agent-component="my-component">
        {/* Component JSX */}
      </div>
    </AgentWrapper>
  );
};
    `.trim();
  }
  {{/if}}

  getTypeSafetyFix() {
    return `
// ❌ Before: any type
const processData = (data: any) => { /* ... */ };

// ✅ After: Explicit interface
interface ProcessingData {
  photos: Photo[];
  filters: FilterState;
}
const processData = (data: ProcessingData) => { /* ... */ };
    `.trim();
  }

  getMemoizationFix() {
    return `
// ❌ Before: Expensive operation every render
const Component = ({ items }) => {
  const filteredItems = items.filter(item => item.isValid); // Expensive!
  return <div>{filteredItems.map(...)}</div>;
};

// ✅ After: Memoized computation
const Component = ({ items }) => {
  const filteredItems = useMemo(() => 
    items.filter(item => item.isValid),
    [items]
  );
  return <div>{filteredItems.map(...)}</div>;
};
    `.trim();
  }

  /**
   * Generate suggested fixes for violations
   */
  generateFixes(violations) {
    return violations.map(violation => ({
      ...violation,
      timestamp: new Date().toISOString(),
      framework_version: this.version
    }));
  }

  /**
   * Main entry point for validation
   */
  inspect(code, options = {}) {
    const validation = this.validateCode(code, options);
    
    if (options.generateFixes && validation.violations.length > 0) {
      validation.fixSuggestions = this.generateFixes(validation.violations);
    }

    if (options.verbose) {
      console.log(`\n🤖 ${this.name} v${this.version} - Code Inspection Results`);
      console.log('='.repeat(60));
      
      if (validation.isValid) {
        console.log('✅ Code passes architecture compliance checks');
      } else {
        console.log(`❌ Found ${validation.violations.length} architecture violation(s)`);
        validation.violations.forEach((v, i) => {
          console.log(`\n${i + 1}. ${v.type.toUpperCase()}: ${v.message}`);
          console.log(`   Severity: ${v.severity}`);
          console.log(`   Fix: ${v.fix}`);
        });
      }

      if (validation.warnings.length > 0) {
        console.log(`\n⚠️ ${validation.warnings.length} warning(s):`);
        validation.warnings.forEach((w, i) => {
          console.log(`${i + 1}. ${w.message}`);
        });
      }

      console.log('\n📊 React/TypeScript Metrics:');
      Object.entries(validation.metrics).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }

    return validation;
  }

  getConfig() {
    return this.config;
  }
}

// CLI interface
if (require.main === module) {
  const subagent = new {{projectName}}Subagent();
  
  if (process.argv[2] === 'config') {
    console.log(JSON.stringify(subagent.getConfig(), null, 2));
  } else if (process.argv[2] === 'test') {
    // Test with sample React component
    const sampleCode = `
export const TestComponent = ({ photos, filters, operations, commands }) => {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState(); 
  const [state3, setState3] = useState();
  
  useEffect(() => {
    // Complex logic
  }, [photos, filters, operations, commands, state1]);
  
  const expensiveOperation = photos.filter(p => 
    operations.every(op => isValidForPhoto(op, p))
  );
  
  return <div>{/* 100+ lines of JSX */}</div>;
};
    `;
    
    const result = subagent.inspect(sampleCode, { verbose: true, generateFixes: true });
    process.exit(result.isValid ? 0 : 1);
  } else {
    console.log(`
🤖 {{projectName}} Subagent v${subagent.version}

Usage:
  node {{projectName.toLowerCase}}-subagent.cjs config    # Show configuration
  node {{projectName.toLowerCase}}-subagent.cjs test      # Run test validation

For AI Integration:
  @{{projectName}}Subagent validate this component
  @{{projectName}}Guardian check architecture compliance
    `);
  }
}

module.exports = {{projectName}}Subagent;