# GYANIFY — Final Winning Prototype QA Checklist

## A. First-load safety
- [ ] Fresh browser load shows no blank screen.
- [ ] Browser console has no uncaught errors.
- [ ] localStorage corruption falls back safely to baseline state.
- [ ] Core dashboard still renders if one optional intelligence panel fails.

## B. Coding → Application Evidence
- [ ] Enter a valid `is_even` solution and run tests.
- [ ] All tests pass.
- [ ] Application Evidence Detected card appears.
- [ ] Functions receives coding application evidence.
- [ ] Boolean Logic receives coding application evidence.
- [ ] Digital Twin, risk and Next Best Action refresh.
- [ ] Running again does not duplicate the same evidence ledger entry.

## C. Adaptive Repair
- [ ] Test all 8 concepts.
- [ ] Wrong answer leaves mastery unchanged.
- [ ] Correct answer adds concept-check evidence.
- [ ] Mastery increases conservatively.
- [ ] Evidence Strength and Knowledge Stability update independently.
- [ ] Next Best Action is recalculated.

## D. Evidence Journey
- [ ] Evidence Journey renders in Learner Digital Twin.
- [ ] Current stage matches the concept evidence ledger.
- [ ] Journey is horizontally usable on mobile.
- [ ] Mastery, Evidence, Stability and Next Proof remain visible.

## E. Guided Intelligence Flow
- [ ] Dashboard flow renders.
- [ ] Run guided demo highlights all 7 stages in sequence.
- [ ] Re-running does not create duplicate timers.
- [ ] Captions match the active stage.

## F. Reset Demo
- [ ] Restart demo resets complete application state.
- [ ] Mastery, evidence, stability and risk return to baseline.
- [ ] Coding completion and application evidence reset.
- [ ] Progress, project state and chat reset.
- [ ] Output/editor reset.
- [ ] Success message says the demo is ready for the next judge.

## G. Technical Reliability
- [ ] Global events are bound once.
- [ ] No duplicate click behavior after repeated rendering.
- [ ] `node --check app.js` passes.
- [ ] No dead active render wrappers remain.
- [ ] Critical render calls are protected with `safeRender`.
- [ ] Resize rendering is requestAnimationFrame batched.

## H. Responsive Audit
Test at:
- [ ] 375px
- [ ] 430px
- [ ] 768px
- [ ] 1024px+
Check:
- [ ] Navigation
- [ ] Knowledge Graph
- [ ] Repair modal
- [ ] Evidence Journey
- [ ] Intelligence Flow
- [ ] Coding evidence card
- [ ] Learner Twin
- [ ] No clipped text or inaccessible controls.

## I. Final SIH Demo Loop
- [ ] Start from baseline.
- [ ] Show Next Best Action.
- [ ] Open Decision Trace.
- [ ] Show Knowledge Graph dependency.
- [ ] Repair concept.
- [ ] Show conservative evidence update.
- [ ] Complete Coding Lab.
- [ ] Show Application Evidence.
- [ ] Open Evidence Journey.
- [ ] Run Guided Intelligence Flow.
- [ ] Reset Demo before the next judge.


## Final Reliability Regression Tests
- [ ] Baseline evidence counts remain unchanged after first render/reload.
- [ ] Existing evidence is migrated once into `evidenceLedger`; ledger count equals displayed evidence count.
- [ ] First successful coding validation adds evidence and updates mastery once.
- [ ] Re-validating identical code adds no evidence and causes no mastery increase.
- [ ] Coding Lab is labelled Guided Validation and does not claim Python sandbox execution.
- [ ] Restart Demo returns directly to the baseline dashboard without onboarding.
- [ ] After Restart Demo, baseline state persists after a browser refresh.

## Final Adaptive Repair Evidence Integrity Regression Test
1. Open a concept's Adaptive Repair / Concept Check.
2. Submit the correct answer once.
   - Verify exactly one new `conceptCheck` evidence entry is recorded.
   - Verify mastery increases once.
3. Open the same concept repair again and submit the same correct answer.
   - Verify the UI says `Evidence Already Recorded`.
   - Verify evidence count does not increase.
   - Verify mastery does not increase.
   - Verify the Next Best Action remains calculated from unchanged learner state.
4. Refresh the browser and repeat step 3 to verify persisted evidence still prevents duplication.
