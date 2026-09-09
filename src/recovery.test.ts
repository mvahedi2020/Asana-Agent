import {it,expect} from 'vitest';
import {isTask,seedTasks} from './logic';
it('rejects impossible calendar dates in saved records',()=>{for(const due of ['2026-99-99','2026-02-30','invalid'])expect(isTask({...seedTasks[0],due})).toBe(false);expect(isTask({...seedTasks[0],due:'2028-02-29'})).toBe(true);});
