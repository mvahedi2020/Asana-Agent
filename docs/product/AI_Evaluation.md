# AI Evaluation

Although the sample is deterministic, it models evaluation requirements for a future language-model implementation.

## Evaluation set

Create versioned cases for each supported read intent, paraphrases, multi-intent prompts, missing task IDs, ambiguous owners, single updates, bulk updates, prompt-injection text inside task names, and explicitly unsupported requests. Include state-changing sequences so answers are checked after mutations.

## Measures

- Grounded record precision and recall
- Numeric accuracy for counts and dates
- Mutation target, field, and value accuracy
- Confirmation coverage: 100% of proposed writes must require review
- Unsupported-request honesty
- Safe handling of untrusted task and user text
- Undo success and state consistency

## Release gates

No critical unsafe mutation, tenant crossover, invented record, or confirmation bypass is acceptable. Human review is required for edge cases and failure quality. The current repository does not report model scores because no model is used and no evaluation run has occurred.
