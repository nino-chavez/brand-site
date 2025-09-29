# Execute-Task Instructions

## Purpose
Provide standardized execution patterns for implementing tasks with focus on agent-ready architecture and dual-interface development.

## Usage
```bash
# Command format
execute-task <task-id> [execution-mode] [validation-level]

# Examples
execute-task COMP-001 collaborative standard
execute-task ARCH-001 ai-assisted thorough
execute-task TEST-001 human-led minimal
```

## Execution Modes

### 1. **AI-Assisted Mode**
AI generates implementation, human reviews and refines:
- **Best for**: Boilerplate code, schemas, documentation
- **Process**: AI implements → Human reviews → Iterate → Validate
- **Quality Gate**: Human approval required

### 2. **Collaborative Mode**  
Human and AI work together in real-time:
- **Best for**: Complex components, integration tasks
- **Process**: Human designs → AI implements → Real-time refinement
- **Quality Gate**: Continuous validation

### 3. **Human-Led Mode**
Human implements with AI providing assistance:
- **Best for**: Architectural decisions, creative solutions
- **Process**: Human implements → AI suggests improvements → Validate
- **Quality Gate**: AI recommendations considered

## Execution Framework

### Phase 1: **Pre-Implementation Analysis**

#### 1.1 **Task Understanding**
```markdown
## Task Analysis: [TASK_ID]
- **Objective**: [Clear understanding of what to build]
- **Scope**: [Boundaries and limitations]
- **Dependencies**: [Required prerequisites]
- **Success Criteria**: [Measurable outcomes]
```

#### 1.2 **Architecture Planning**
- **Human Interface**: UI/UX requirements and patterns
- **Machine Interface**: Schema.org and agent action requirements
- **Integration Points**: How this connects to existing system
- **Performance Considerations**: Expected impact and optimizations

#### 1.3 **Implementation Strategy**
```typescript
// Planning template for dual-interface components
interface ImplementationPlan {
  humanInterface: {
    component: string;           // React component name
    props: PropsDefinition;      // TypeScript interface
    state: StateDefinition;      // State management approach
    interactions: UserAction[];   // User interaction patterns
  };
  
  machineInterface: {
    schema: SchemaOrgType;       // Schema.org structured data
    actions: AgentAction[];      // Available agent actions
    queries: SemanticQuery[];    // Natural language capabilities
    exposure: StateExposure;     // Agent state access patterns
  };
  
  integration: {
    dependencies: string[];      // Required imports/dependencies
    stateManagement: string;     // How state is managed
    dataFlow: DataFlowPattern;   // Data flow architecture
    testStrategy: TestApproach;  // Testing methodology
  };
}
```

### Phase 2: **Implementation Execution**

#### 2.1 **Human Interface Implementation**
```typescript
// Step 1: Create the base React component
export const ComponentName: React.FC<ComponentProps> = ({
  // Human interface props
  data,
  onAction,
  className,
  ...humanProps
}) => {
  // State management
  const [state, setState] = useState(initialState);
  
  // Event handlers
  const handleUserAction = useCallback((action: UserAction) => {
    // Implement user interaction logic
  }, []);

  // Render human interface
  return (
    <div className={className}>
      {/* Human-focused UI implementation */}
    </div>
  );
};
```

#### 2.2 **Machine Interface Layer**
```typescript
// Step 2: Add agent-ready enhancements
export const ComponentName: React.FC<ComponentProps> = ({
  data,
  onAction,
  className,
  // Agent interface props
  agentConfig,
  ...props
}) => {
  // Human interface state
  const [state, setState] = useState(initialState);
  
  // Agent interface integration
  const agentInterface = useMemo(() => ({
    structuredData: generateStructuredData(data),
    availableActions: getAgentActions(data),
    currentState: state,
    stateActions: {
      update: setState,
      reset: () => setState(initialState)
    }
  }), [data, state]);

  // Expose to window for agent access
  useEffect(() => {
    if (agentConfig?.exposeToAgents) {
      window.agentInterfaces = window.agentInterfaces || {};
      window.agentInterfaces[agentConfig.id] = agentInterface;
    }
  }, [agentInterface, agentConfig]);

  return (
    <article 
      // Schema.org structured data
      itemScope
      itemType={`https://schema.org/${agentInterface.structuredData['@type']}`}
      data-agent-component={agentConfig?.id}
      data-agent-actions={JSON.stringify(agentInterface.availableActions)}
    >
      {/* Structured data injection */}
      <script type="application/ld+json">
        {JSON.stringify(agentInterface.structuredData)}
      </script>
      
      {/* Human interface render */}
      <div className={className}>
        {/* Component content */}
      </div>
    </article>
  );
};
```

#### 2.3 **Agent Action Registry Integration**
```typescript
// Step 3: Register agent actions globally
export const registerComponentActions = () => {
  AgentActionRegistry.register('component.action-name', {
    description: 'Human-readable action description',
    parameters: ['param1', 'param2?'],
    execute: async (params: ActionParams) => {
      // Implementation that works for both humans and agents
      return await executeAction(params);
    },
    humanEquivalent: 'Click the "Action" button',
    permissions: ['read', 'write'],
    schemas: {
      input: inputSchema,
      output: outputSchema
    }
  });
};

// Auto-register on module load
registerComponentActions();
```

### Phase 3: **Quality Assurance**

#### 3.1 **Human Interface Testing**
```typescript
// React component testing
describe('ComponentName Human Interface', () => {
  test('renders correctly with props', () => {
    render(<ComponentName {...mockProps} />);
    // Standard React testing
  });

  test('handles user interactions', () => {
    const onAction = jest.fn();
    render(<ComponentName onAction={onAction} {...mockProps} />);
    // User interaction testing
  });

  test('meets accessibility requirements', () => {
    // Accessibility testing
  });
});
```

#### 3.2 **Agent Interface Testing**
```typescript
// Agent interface validation
describe('ComponentName Agent Interface', () => {
  test('generates valid structured data', () => {
    const component = render(<ComponentName {...mockProps} />);
    const structuredData = extractStructuredData(component);
    
    // Validate against Schema.org schemas
    expect(validateSchemaOrg(structuredData)).toBe(true);
  });

  test('exposes correct agent actions', () => {
    const agentInterface = getAgentInterface('component-id');
    
    expect(agentInterface.availableActions).toContainEqual({
      name: 'action-name',
      parameters: expect.any(Array),
      description: expect.any(String)
    });
  });

  test('agent state exposure works correctly', () => {
    render(<ComponentName agentConfig={{ id: 'test', exposeToAgents: true }} />);
    
    expect(window.agentInterfaces.test).toBeDefined();
    expect(window.agentInterfaces.test.currentState).toBeDefined();
  });
});
```

#### 3.3 **Integration Testing**
```typescript
// End-to-end agent workflow testing
describe('Agent Integration Workflow', () => {
  test('agent can discover and execute actions', async () => {
    // Simulate agent discovery
    const actions = await AgentActionRegistry.getAvailableActions();
    
    // Simulate agent execution
    const result = await AgentActionRegistry.execute('component.action-name', {
      param1: 'value1'
    });
    
    expect(result.success).toBe(true);
  });

  test('natural language processing works', async () => {
    const intent = await parseNaturalLanguage('Show me photos from last week');
    
    expect(intent.action).toBe('filter');
    expect(intent.parameters.timeRange).toBe('last-week');
  });
});
```

### Phase 4: **Documentation and Validation**

#### 4.1 **Code Documentation**
```typescript
/**
 * Agent-ready photo gallery component that provides both human and machine interfaces
 * 
 * @example Human Usage:
 * ```tsx
 * <PhotoGallery 
 *   photos={photos} 
 *   onPhotoClick={handleClick}
 *   className="grid-layout" 
 * />
 * ```
 * 
 * @example Agent Usage:
 * ```typescript
 * // Agent can discover this component
 * const gallery = window.agentInterfaces['photo-gallery'];
 * 
 * // Execute actions programmatically
 * await AgentActionRegistry.execute('photo-gallery.filter', {
 *   criteria: 'sunset photos'
 * });
 * ```
 * 
 * @param props - Component props combining human and agent interfaces
 */
export const PhotoGallery: React.FC<PhotoGalleryProps> = (props) => {
  // Implementation
};
```

#### 4.2 **User Documentation Updates**
```markdown
## Photo Gallery Component

### For Users
The photo gallery provides an intuitive interface for browsing and organizing your photos.

### For AI Agents
This component is agent-ready and supports:
- **Structured Data**: Schema.org PhotoGallery markup
- **Available Actions**: filter, sort, select, view
- **Natural Language**: "Show me sunset photos from last month"

#### Agent Action Examples
```javascript
// Filter photos by criteria
await agentActions.execute('photo-gallery.filter', {
  criteria: 'landscape photos',
  timeRange: 'last-month'
});

// Sort photos by date
await agentActions.execute('photo-gallery.sort', {
  field: 'dateCreated',
  order: 'desc'
});
```
```

#### 4.3 **Final Validation Checklist**
```markdown
## Task Completion Validation: [TASK_ID]

### Functional Requirements ✓
- [ ] Human interface works as specified
- [ ] Agent interface is discoverable and actionable
- [ ] Error handling covers edge cases
- [ ] Performance meets requirements

### Technical Requirements ✓
- [ ] TypeScript types are complete and accurate
- [ ] Code follows project standards
- [ ] Tests achieve required coverage
- [ ] Documentation is comprehensive

### Agent-Ready Requirements ✓
- [ ] Schema.org structured data validates
- [ ] Agent actions are registered and testable
- [ ] Natural language processing works
- [ ] Cross-browser agent compatibility verified

### Integration Requirements ✓
- [ ] Works with existing codebase
- [ ] State management is consistent
- [ ] Performance impact is acceptable
- [ ] Documentation is updated

### Quality Gates Passed ✓
- [ ] Code review completed
- [ ] Tests pass in CI/CD
- [ ] Agent interface testing passed
- [ ] User acceptance criteria met
```

## Execution Best Practices

### 1. **Dual-Interface Development**
- Always implement human interface first
- Add machine interface as enhancement layer
- Ensure both interfaces share the same underlying logic
- Test both interfaces independently and together

### 2. **Agent-Ready Patterns**
- Use Schema.org vocabulary consistently
- Make all interactive elements agent-discoverable
- Provide natural language aliases for technical actions
- Expose state through standardized patterns

### 3. **Performance Optimization**
- Agent interface should add minimal overhead
- Structured data generation should be memoized
- Agent state exposure should be opt-in
- Monitor performance impact of dual interfaces

### 4. **Error Handling**
- Agent actions should fail gracefully
- Provide meaningful error messages for agents
- Log agent interaction failures for debugging
- Maintain human interface functionality even if agent features fail

## Post-Implementation

### 1. **Success Measurement**
- Human interface usability metrics
- Agent interface reliability metrics
- Performance impact analysis
- Developer adoption feedback

### 2. **Iteration Planning**
- Identify enhancement opportunities
- Collect user and agent feedback
- Plan performance optimizations
- Consider additional agent capabilities

This framework ensures consistent, high-quality implementation of agent-ready features while maintaining excellent human user experience.