# CareerLens Development Guidelines

## Code Quality Standards

### TypeScript Conventions
- **Strict Mode Enabled**: All TypeScript files use strict type checking
- **Explicit Return Types**: Functions declare return types explicitly (e.g., `Promise<{ originalText: string; ... }>`)
- **Type-First Approach**: Use `type` for unions (`type RewriteTone = 'formal' | 'impact-driven' | ...`) and `interface` for objects
- **Optional Parameters**: Use TypeScript optional syntax (`targetRole?: string`) rather than default values when appropriate
- **Schema Validation**: Use Zod schemas for runtime validation (all API inputs/outputs validated)

### Python Conventions
- **Type Hints**: All function parameters and returns have type hints (`def add_notebook(url: str, ...) -> Dict[str, Any]`)
- **Docstrings**: Triple-quoted docstrings for all public functions following Google style
- **Private Methods**: Prefix with single underscore (`_load_library`, `_save_library`)
- **Path Handling**: Use `pathlib.Path` instead of string concatenation for file paths
- **Error Handling**: Explicit exception raising with descriptive messages (`raise ValueError(f"...")`)

### Naming Conventions
- **TypeScript**: camelCase for functions/variables (`rewriteResumeSection`, `bulletPoints`), PascalCase for types/interfaces
- **Python**: snake_case for functions/variables (`add_notebook`, `notebook_id`), PascalCase for classes
- **Constants**: UPPER_SNAKE_CASE with descriptive names (`MIN_EFFECT_SIZES`, `CONFIDENCE_LEVELS`)
- **Boolean Variables**: Prefix with `is_`, `has_`, `should_` (e.g., `is_significant_95`, `has_author`)
- **DOM Variables**: Suffix DOM elements with `_elem`, `_node` (e.g., `ins_elem`, `parent_node`)

### File Organization
- **Single Responsibility**: Each file focuses on one domain (e.g., `route.ts` for API endpoints, `document.py` for Word document operations)
- **Exports**: Export functions explicitly at the end or use named exports inline
- **Module-Level Constants**: Define constants at module top (e.g., `TEMPLATE_DIR`, `MIN_EFFECT_SIZES`)
- **Grouped Imports**: Standard library → Third-party → Local imports, separated by blank lines

## Architectural Patterns

### Server Actions ('use server')
- All AI flows and server-side functions marked with `'use server'` directive at top
- Prevents accidental client-side execution of sensitive operations
- Used consistently in `/src/ai/flows/` directory

### API Route Structure
- **Pattern**: POST endpoints accept JSON body, validate with TypeScript types
- **Logging**: Console.log with emoji prefixes (`✅`, `❌`, `🔍`, `📊`) for readability
- **Error Handling**: Try-catch with detailed error logging, return structured error responses
- **Mock Data Pattern**: Large mock datasets defined in-function (e.g., `getMockColleges()`) with filtering/scoring logic
- **Integration Pattern**: API routes call other API routes server-side to bypass CORS (e.g., `/api/college-recommendations` → `/api/reddit-search`)

### Service Layer Pattern
- Business logic separated into service files (`/lib/services/`)
- Services handle external API calls, data transformations, caching
- API routes orchestrate service calls and handle HTTP concerns

### XML Document Manipulation Pattern (Python)
- **DOM Editing**: Use `defusedxml.minidom` for safe XML parsing/manipulation
- **Attribute Injection**: Automatically inject required attributes (RSIDs, author, date) via `_inject_attributes_to_nodes()`
- **Method Chaining**: XML editor methods return nodes for further manipulation
- **Validation**: Validate documents against XSD schemas before saving
- **Temporary Directories**: Use `tempfile.mkdtemp()` for safe working directories, cleanup in `__del__`

### Class-Based State Management (Python)
- **Initialization**: `__init__` sets up dependencies, loads state from disk
- **Lazy Loading**: Use cached properties or manual caching (`_editors` dict) for expensive operations
- **Persistence**: Explicit `_save_*()` and `_load_*()` methods for serialization
- **Public vs Private**: Public methods for user API, private methods (leading `_`) for internal logic

## Testing & Validation

### Statistical Calculations
- **Confidence Intervals**: Use standard z-scores (0.80 → 0.84, 0.95 → 1.645, 0.975 → 1.96)
- **Sample Size**: Calculate with proper alpha/beta error rates, provide duration estimates
- **Approximations**: Document when using approximations (e.g., standard normal CDF approximation)
- **Unit Conversions**: Consistent units (rates as 0-1, percentages as 0-100, clearly documented)

### Data Validation
- **Zod Schemas**: Define schemas for all structured data (API inputs, AI outputs)
- **Runtime Checks**: Validate user inputs before processing (e.g., check `exam_type`, `score`, `branch_preferences`)
- **Type Guards**: Use TypeScript type guards or Zod `.parse()` for runtime validation
- **Early Returns**: Return errors early for invalid inputs before expensive operations

### Error Handling
- **Graceful Degradation**: Return partial results on non-critical failures (e.g., return recommendations without reviews if Reddit API fails)
- **Specific Exceptions**: Use specific exception types (`ValueError`, `KeyError`) rather than generic `Exception`
- **User-Friendly Messages**: Convert technical errors to user-facing messages (e.g., "Failed to generate recommendations" instead of stack traces)
- **Logging Context**: Include relevant context in error logs (test_id, user inputs, external API responses)

## External API Integration

### CORS Bypass Pattern
- **Server-Side Proxy**: Create `/api/*` routes that proxy external APIs to avoid CORS
- **Internal Fetch**: Use `fetch('http://localhost:3000/api/...')` or `process.env.NEXT_PUBLIC_API_URL` within server routes
- **Error Handling**: Gracefully handle proxy failures, return original data if enrichment fails

### Caching Strategy
- **5-Minute TTL**: Cache API responses in Firestore with 5-minute expiration
- **Cache Key Design**: Use deterministic keys (e.g., `reddit_${collegeName}`)
- **Cache Checking**: Always check cache before making external API calls
- **Cache Invalidation**: Respect TTL, provide manual invalidation if needed

### Rate Limiting
- **Debouncing**: 500ms debounce on user-triggered API calls (search inputs)
- **Request Throttling**: Limit concurrent external API calls (use `Promise.all` for parallel, but controlled)
- **Retry Logic**: Implement exponential backoff for transient failures (not yet implemented, but recommended)

## AI Integration (Genkit)

### Prompt Engineering
- **Structured Prompts**: Use Handlebars templates with clear sections (Task, Guidelines, Requirements, Return)
- **Schema-Driven**: Define input/output schemas with Zod for type-safe AI interactions
- **Few-Shot Examples**: Include examples in prompts to guide AI behavior (e.g., tone examples in resume rewrite)
- **Constraints**: Explicitly list requirements (factual accuracy, length constraints, keyword density)
- **Output Format**: Specify exact return format (JSON structure, array of strings, etc.)

### Model Selection
- **Gemini 2.5 Flash**: Fast responses for conversational AI, bullet point rewriting, summaries
- **Gemini 1.5 Pro**: Complex reasoning, long context (career analysis, resume optimization)
- **Model Configuration**: Set in `ai.definePrompt({ model: 'vertexai/gemini-2.5-flash' })`

### Error Handling
- **Fallback Values**: Return safe defaults on AI failure (e.g., `return bulletPoints` if rewrite fails)
- **Validation**: Validate AI output against schema before returning (Zod schema parsing)
- **User Feedback**: Convert AI errors to user-friendly messages ("Failed to rewrite resume section. Please try again.")

## Data Structures

### Nested Object Patterns
- **Cutoffs Structure**: Nested objects with exam types as keys, branch-specific cutoffs as values
  ```typescript
  cutoffs: {
    JEE: { 'Computer Science': 150, 'Mechanical': 800 },
    KCET: { 'Computer Science': 500, ... }
  }
  ```
- **Recommendation Objects**: Structured with nested metadata (college, match_score, review_summary, etc.)
- **Sentiment Distribution**: Objects with fixed keys (`positive`, `negative`, `neutral`, `mixed`)

### Array Manipulation
- **Filtering**: Use `.filter()` with predicate functions for complex conditions
- **Mapping**: Transform arrays with `.map()`, always return new array (immutability)
- **Sorting**: Use `.sort()` with custom comparators, multi-level sorting (admission chance → match score)
- **Slicing**: Limit results with `.slice(0, maxResults)` after sorting

### ID Generation
- **Hex IDs**: Random 8-character hex for Word document IDs (`_generate_hex_id()`)
- **RSID Generation**: 8-character uppercase hex for Word revision IDs
- **Timestamp-Based**: Use Unix timestamps for unique test IDs (`${test_type}_${timestamp}`)
- **Deterministic**: Derive IDs from names for predictable lookups (`name.lower().replace(' ', '-')`)

## Documentation Standards

### Function Documentation
- **Purpose**: First line describes what the function does
- **Parameters**: List each parameter with type and description
- **Returns**: Describe return value structure
- **Examples**: Include usage examples for complex functions
- **Raises/Throws**: Document exceptions that can be thrown

### Code Comments
- **Inline Comments**: Explain non-obvious logic, not obvious code
- **Section Comments**: Use `// ===== SECTION =====` for major sections in long files
- **TODO/FIXME**: Use `// TODO:` for planned features, `// FIXME:` for known issues
- **Algorithm Explanations**: Document complex algorithms (e.g., Haversine formula, statistical calculations)

### README Patterns
- **Comprehensive**: Include purpose, features, tech stack, setup instructions
- **Emoji Usage**: Use emojis for visual hierarchy (🚀, 📚, 🔥, ✨)
- **Code Examples**: Include actual code snippets, not just descriptions
- **Architecture Diagrams**: Use ASCII art for architecture overviews
- **Version Numbers**: Document exact versions for all dependencies

## Security Best Practices

### Input Sanitization
- **HTML Escaping**: Use `html.escape()` (Python) or built-in escaping for user inputs
- **XML Injection Prevention**: Escape XML entities when building XML strings
- **SQL Injection**: Use parameterized queries (not string concatenation) - though this project uses NoSQL
- **Path Traversal**: Validate file paths, use `Path.resolve()` to prevent `../` attacks

### API Key Management
- **Environment Variables**: All API keys in `.env.local`, never hardcoded
- **No Client Exposure**: Never send API keys to client-side code
- **Key Rotation**: Document process for rotating compromised keys
- **Scoped Permissions**: Use least-privilege API keys (read-only when possible)

### Authentication Patterns
- **Server-Side Verification**: Always verify auth tokens on server, never trust client
- **Firebase Auth**: Use Firebase Admin SDK for server-side auth verification
- **Protected Routes**: Check authentication before processing sensitive operations
- **Session Management**: Use Firebase session cookies for persistent authentication

## Performance Optimization

### Data Loading
- **Lazy Loading**: Load XML editors on-demand with caching (`__getitem__` pattern)
- **Parallel Processing**: Use `Promise.all()` for independent async operations (Reddit reviews for multiple colleges)
- **Early Exits**: Return immediately on validation failures to avoid unnecessary computation
- **Pagination**: Limit results with `maxResults` variables based on context (exam type, score ranges)

### Algorithm Efficiency
- **Pre-computation**: Calculate once and reuse (e.g., `next_comment_id` calculated once at initialization)
- **Efficient Sorting**: Multi-criteria sort in single pass, not multiple sorts
- **Set Operations**: Use `set()` for uniqueness checks, faster than list iteration
- **Dictionary Lookups**: Use dict/object lookups (O(1)) instead of array searches (O(n))

### Memory Management
- **Stream Processing**: Process large datasets in chunks, not all at once
- **Resource Cleanup**: Explicitly clean up resources (`__del__`, `shutil.rmtree()`)
- **Avoid Duplication**: Reference existing data instead of copying (use views/references)

## Common Patterns

### Frequency Analysis
- Count occurrences in collections using dictionaries
- Pattern: `for item in items: counts[item] = counts.get(item, 0) + 1`
- Used for sentiment distribution, topic ratings, review analysis

### Configuration Dictionaries
- Define mappings/configs as module-level dictionaries
- Pattern: `CONFIDENCE_LEVELS = {'high': 0.95, 'standard': 0.90, ...}`
- Use `.get(key, default)` for safe access with fallbacks

### Builder Pattern
- Construct complex objects step-by-step
- Pattern: Create empty dict, populate fields conditionally, validate before return
- Used for recommendation objects, test designs, report generation

### Factory Methods
- Static methods that return instances (`@staticmethod`)
- Pattern: `@staticmethod def suggest_paragraph(xml_content: str) -> str:`
- Used for XML transformations, test designs

### Decorator Usage
- Use decorators for cross-cutting concerns
- `'use server'`: Server-side execution
- `@staticmethod`: Class methods without instance state
- Future: `@cache`, `@retry` for performance/reliability

## Testing Strategy

### Unit Testing
- Test individual functions with known inputs/outputs
- Mock external dependencies (APIs, file system, database)
- Test edge cases (empty inputs, null values, boundary conditions)
- Pattern: `/tests/*.test.ts` for TypeScript, `test_*.py` for Python

### Integration Testing
- Test API routes end-to-end
- Verify database writes/reads
- Test external API integrations with test data
- Pattern: `/tests/integration/` directory

### Validation Testing
- XSD schema validation for XML documents
- Zod schema validation for TypeScript data structures
- Redlining validation for Word document tracked changes
- Run before deployment to catch schema violations

## Deployment

### Environment Configuration
- Separate configs for development/staging/production
- Use environment variables for all environment-specific values
- Document required environment variables in README
- Provide example `.env.example` file

### Build Process
- TypeScript compilation: `tsc --noEmit` for type checking
- Next.js build: `next build` generates standalone output
- Python packaging: No build needed, interpret at runtime
- Validate before deployment: Run linters, type checks, tests

### Firebase Deployment
- App Hosting: Automatic builds from GitHub (main branch)
- Cloud Functions: Deploy with `firebase deploy --only functions`
- Firestore Rules: Deploy with `firebase deploy --only firestore:rules`
- Verify deployment: Check Cloud Console for errors
