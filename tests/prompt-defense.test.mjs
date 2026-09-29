import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Use the existing TypeScript compiler; no extra test dependency.
const source = readFileSync(new URL('../labs/llm01.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { simulatePromptDefense } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

for (const guard of [null, 'triage']) {
  test(`${guard ?? 'no guard'} does not stop the model-card route`, () => {
    const run = simulatePromptDefense(guard);
    assert.equal(run.outcome, 'loss');
    assert.equal(run.frames.at(-1).node, 'registry');
    assert.equal(run.frames.some(f => f.node === 'draft'), false);
    assert.equal(run.frames.some(f => f.node === 'triage'), false);
  });
}
for (const guard of ['builder', 'reviewer']) {
  test(`${guard} rejects forged authority and completes legitimate work`, () => {
    const run = simulatePromptDefense(guard);
    assert.equal(run.outcome, 'win');
    assert.equal(run.frames.at(-1).node, 'draft');
    assert.equal(run.frames.at(-1).trace.allow, true);
    assert.equal(run.frames.some(f => f.node === 'registry'), false);
    assert.ok(run.frames.some(f => f.node === guard && !f.trace.allow));
  });
}
test('late release block alone is not a completed safe workflow', () => {
  const run = simulatePromptDefense('publisher');
  assert.equal(run.outcome, 'partial');
  assert.equal(run.frames.at(-1).trace.allow, false);
  assert.equal(run.frames.some(f => ['registry', 'draft'].includes(f.node)), false);
});
test('all simulated verdicts obey the course trace contract and replay deterministically', () => {
  for (const guard of [null, 'triage', 'builder', 'reviewer', 'publisher']) {
    const run = simulatePromptDefense(guard);
    assert.deepEqual(run, simulatePromptDefense(guard));
    for (const { trace } of run.frames) {
      assert.ok(trace.tool.length <= 80);
      assert.equal(typeof trace.allow, 'boolean');
      assert.ok(trace.score >= 0 && trace.score <= 100);
      assert.ok(trace.reasons.every(reason => reason.length <= 300));
      assert.equal(trace.allow, trace.score < 50);
      assert.equal(trace.cleared, undefined, 'defense wins must not be marked ATTACK LANDED');
    }
  }
});
