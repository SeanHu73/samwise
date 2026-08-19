import {describe,expect,it} from 'vitest';import {rolloverState,validateDeferral} from './rollover';import type {Task} from '../types';
const task={deferCount:1,nextActionText:'Open file'} as Task;
describe('rollover',()=>{it('requires intervention on second deferral',()=>expect(rolloverState(2)).toBe('intervention_required'));it('requires a rewritten action for repeated reschedule',()=>expect(validateDeferral(task,'reschedule','')).toMatch(/Rewrite/));it('never requires shame-oriented overdue state',()=>expect(rolloverState(1)).toBe('decision_required'))});
